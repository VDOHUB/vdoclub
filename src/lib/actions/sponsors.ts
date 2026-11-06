"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { normalizeUrl } from "@/lib/url";
import { UPLOAD_LIMITS, UploadError, parseUploaded, type UploadedFile } from "@/lib/uploads";

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

function fail(message: string): never {
  redirect(`${BACK}?error=${encodeURIComponent(message)}`);
}

export async function addSponsor(formData: FormData) {
  const { supabase } = await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const linkRaw = String(formData.get("link_url") ?? "");

  let files: UploadedFile[] = [];
  try {
    files = parseUploaded(formData, {
      prefix: "logos/",
      maxBytes: UPLOAD_LIMITS.sponsor.maxBytes,
      maxFiles: 1,
    });
  } catch (e) {
    fail(e instanceof UploadError ? e.message : "Arquivo inválido.");
  }

  const bucket = supabase.storage.from(UPLOAD_LIMITS.sponsor.bucket);
  const discard = async () => {
    if (files.length > 0) await bucket.remove(files.map((f) => f.path));
  };

  if (!name) {
    await discard();
    fail("Informe o nome do patrocinador");
  }
  if (files.length === 0) fail("Envie o logo do patrocinador");

  let linkUrl: string | null = null;
  try {
    linkUrl = normalizeUrl(linkRaw);
  } catch (e) {
    await discard();
    fail(e instanceof Error ? e.message : "Link inválido");
  }

  const { data: publicUrl } = bucket.getPublicUrl(files[0].path);

  const { error } = await supabase.from("sponsors").insert({
    name,
    logo_url: publicUrl.publicUrl,
    logo_path: files[0].path,
    link_url: linkUrl,
  });

  if (error) {
    await discard();
    fail(error.message);
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
