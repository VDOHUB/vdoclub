"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { normalizeUrl } from "@/lib/url";
import { UPLOAD_LIMITS, UploadError, parseUploaded, type UploadedFile } from "@/lib/uploads";

const BACK = "/app/perfil";

function fail(message: string): never {
  redirect(`${BACK}?error=${encodeURIComponent(message)}`);
}

export async function addPortfolioItem(formData: FormData) {
  const session = await getSessionProfile();
  if (!session) redirect("/login");
  const { supabase, user } = session;

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const linkRaw = String(formData.get("link_url") ?? "");

  let photos: UploadedFile[] = [];
  try {
    photos = parseUploaded(formData, {
      prefix: `${user.id}/`,
      maxBytes: UPLOAD_LIMITS.portfolio.maxBytes,
      maxFiles: UPLOAD_LIMITS.portfolio.maxFiles,
    });
  } catch (e) {
    fail(e instanceof UploadError ? e.message : "Arquivos inválidos.");
  }

  const discard = async () => {
    if (photos.length > 0) {
      await supabase.storage.from(UPLOAD_LIMITS.portfolio.bucket).remove(photos.map((p) => p.path));
    }
  };

  if (!title) {
    await discard();
    fail("Informe um título");
  }

  let linkUrl: string | null = null;
  try {
    linkUrl = normalizeUrl(linkRaw);
  } catch (e) {
    await discard();
    fail(e instanceof Error ? e.message : "Link inválido");
  }

  const { error } = await supabase.from("portfolio_items").insert({
    profile_id: user.id,
    title,
    description: description || null,
    link_url: linkUrl,
    photo_paths: photos.map((p) => p.path),
  });

  if (error) {
    await discard();
    fail(error.message);
  }

  revalidatePath(BACK);
  redirect(BACK);
}

export async function updateAvatar(formData: FormData) {
  const session = await getSessionProfile();
  if (!session) redirect("/login");
  const { supabase, user } = session;

  let files: UploadedFile[] = [];
  try {
    files = parseUploaded(formData, {
      prefix: `${user.id}/`,
      maxBytes: UPLOAD_LIMITS.avatar.maxBytes,
      maxFiles: 1,
    });
  } catch (e) {
    fail(e instanceof UploadError ? e.message : "Arquivo inválido.");
  }
  if (files.length === 0) fail("Escolha uma foto");

  const bucket = supabase.storage.from(UPLOAD_LIMITS.avatar.bucket);
  const { data: publicUrl } = bucket.getPublicUrl(files[0].path);

  const previous = session.profile.avatar_url;

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl.publicUrl })
    .eq("id", user.id);

  if (error) {
    await bucket.remove([files[0].path]);
    fail(error.message);
  }

  // Apaga a foto anterior para não acumular arquivos (só se estiver na pasta do usuário).
  const marker = `/avatars/${user.id}/`;
  if (previous && previous.includes(marker)) {
    const oldPath = decodeURIComponent(previous.slice(previous.indexOf(marker) + "/avatars/".length));
    await bucket.remove([oldPath]);
  }

  revalidatePath(BACK);
  redirect(BACK);
}

export async function deletePortfolioItem(formData: FormData) {
  const session = await getSessionProfile();
  if (!session) redirect("/login");
  const { supabase, user } = session;

  const id = String(formData.get("id"));

  const { data: item } = await supabase
    .from("portfolio_items")
    .select("photo_paths, profile_id")
    .eq("id", id)
    .single();

  if (item && item.profile_id === user.id && item.photo_paths.length > 0) {
    await supabase.storage.from("portfolio").remove(item.photo_paths);
  }

  await supabase.from("portfolio_items").delete().eq("id", id).eq("profile_id", user.id);

  revalidatePath(BACK);
  redirect(BACK);
}
