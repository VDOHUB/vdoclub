"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import type { LegalSlug } from "@/lib/legal-defaults";

const MAX_CHARS = 60000;

async function requireAdmin() {
  const session = await getSessionProfile();
  if (!session || session.profile.role !== "admin") redirect("/login");
  return session;
}

function parseSlug(value: FormDataEntryValue | null): LegalSlug {
  const slug = String(value ?? "");
  if (slug !== "termos" && slug !== "privacidade") redirect("/admin/documentos");
  return slug;
}

function back(slug: LegalSlug, params: Record<string, string>): never {
  redirect(`/admin/documentos?${new URLSearchParams({ doc: slug, ...params }).toString()}`);
}

export async function saveLegalDocument(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const slug = parseSlug(formData.get("slug"));
  const content = String(formData.get("content") ?? "").replace(/\r\n/g, "\n").trim();

  if (!content) {
    back(slug, {
      error: "O texto não pode ficar vazio. Para voltar ao original, use “Restaurar texto original”.",
    });
  }
  if (content.length > MAX_CHARS) back(slug, { error: "O texto está grande demais." });

  const { error } = await supabase
    .from("legal_documents")
    .upsert({ slug, content, updated_at: new Date().toISOString(), updated_by: user.id });

  if (error) back(slug, { error: error.message });

  revalidatePath(`/${slug}`);
  back(slug, { saved: "1" });
}

export async function resetLegalDocument(formData: FormData) {
  const { supabase } = await requireAdmin();
  const slug = parseSlug(formData.get("slug"));

  const { error } = await supabase.from("legal_documents").delete().eq("slug", slug);
  if (error) back(slug, { error: error.message });

  revalidatePath(`/${slug}`);
  back(slug, { reset: "1" });
}
