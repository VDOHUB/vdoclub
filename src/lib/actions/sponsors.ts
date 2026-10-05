"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const BACK = "/admin/patrocinadores";

async function requireAdmin() {
  const session = await getSessionProfile();
  if (!session || session.profile.role !== "admin") redirect("/login");
  return session;
}

function refresh() {
  revalidatePath(BACK);
  revalidatePath("/app", "layout");
}

export async function addSponsor(formData: FormData) {
  const { supabase } = await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const linkRaw = String(formData.get("link_url") ?? "").trim();
  const file = formData.get("logo");

  if (!name) redirect(`${BACK}?error=${encodeURIComponent("Informe o nome do patrocinador")}`);
  if (!(file instanceof File) || file.size === 0) {
    redirect(`${BACK}?error=${encodeURIComponent("Envie o logo do patrocinador")}`);
  }
  if (!file.type.startsWith("image/")) {
    redirect(`${BACK}?error=${encodeURIComponent("O logo precisa ser uma imagem")}`);
  }
  if (file.size > MAX_FILE_BYTES) {
    redirect(`${BACK}?error=${encodeURIComponent("O logo passa de 5 MB")}`);
  }

  let linkUrl: string | null = null;
  if (linkRaw) {
    try {
      const parsed = new URL(linkRaw);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error();
      linkUrl = parsed.toString();
    } catch {
      redirect(`${BACK}?error=${encodeURIComponent("O link precisa começar com http:// ou https://")}`);
    }
  }

  const ext = (file.name.split(".").pop() ?? "png").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${randomUUID()}.${ext || "png"}`;

  const { error: uploadError } = await supabase.storage
    .from("sponsors")
    .upload(path, file, { contentType: file.type });

  if (uploadError) redirect(`${BACK}?error=${encodeURIComponent(uploadError.message)}`);

  const { data: publicUrl } = supabase.storage.from("sponsors").getPublicUrl(path);

  const { error } = await supabase.from("sponsors").insert({
    name,
    logo_url: publicUrl.publicUrl,
    logo_path: path,
    link_url: linkUrl,
  });

  if (error) {
    await supabase.storage.from("sponsors").remove([path]);
    redirect(`${BACK}?error=${encodeURIComponent(error.message)}`);
  }

  refresh();
  redirect(BACK);
}

export async function toggleSponsor(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";
  await supabase.from("sponsors").update({ active: !active }).eq("id", id);
  refresh();
}

export async function deleteSponsor(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id"));

  const { data: sponsor } = await supabase
    .from("sponsors")
    .select("logo_path")
    .eq("id", id)
    .single();

  if (sponsor?.logo_path) {
    await supabase.storage.from("sponsors").remove([sponsor.logo_path]);
  }
  await supabase.from("sponsors").delete().eq("id", id);
  refresh();
}
