"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

export async function addPortfolioItem(formData: FormData) {
  const session = await getSessionProfile();
  if (!session) redirect("/login");
  const { supabase, user } = session;

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const linkUrl = String(formData.get("link_url") ?? "").trim();
  const files = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);

  if (!title) redirect("/app/perfil?error=Informe%20um%20t%C3%ADtulo");

  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) {
      redirect(`/app/perfil?error=${encodeURIComponent(`"${file.name}" passa de 5 MB`)}`);
    }
  }

  const photoPaths: string[] = [];
  for (const file of files) {
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/${randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("portfolio")
      .upload(path, file, { contentType: file.type });
    if (uploadError) {
      redirect(`/app/perfil?error=${encodeURIComponent(uploadError.message)}`);
    }
    photoPaths.push(path);
  }

  const { error } = await supabase.from("portfolio_items").insert({
    profile_id: user.id,
    title,
    description: description || null,
    link_url: linkUrl || null,
    photo_paths: photoPaths,
  });

  if (error) redirect(`/app/perfil?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/app/perfil");
  redirect("/app/perfil");
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

  revalidatePath("/app/perfil");
  redirect("/app/perfil");
}
