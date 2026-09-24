"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSessionProfile();
  if (!session || session.profile.role !== "admin") redirect("/login");
  return session;
}

export async function approveProfile(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id"));
  await session.supabase
    .from("profiles")
    .update({ status: "approved", approved_by: session.user.id, approved_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/aprovacoes");
}

export async function rejectProfile(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id"));
  await session.supabase
    .from("profiles")
    .update({ status: "rejected", approved_by: session.user.id, approved_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/aprovacoes");
}

export async function approveRating(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id"));
  await session.supabase
    .from("ratings")
    .update({ status: "approved", reviewed_by: session.user.id })
    .eq("id", id);
  revalidatePath("/admin/avaliacoes");
}

export async function rejectRating(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id"));
  await session.supabase
    .from("ratings")
    .update({ status: "rejected", reviewed_by: session.user.id })
    .eq("id", id);
  revalidatePath("/admin/avaliacoes");
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createCategory(formData: FormData) {
  const session = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await session.supabase
    .from("categories")
    .insert({ name, slug: slugify(name), created_by: session.user.id });
  revalidatePath("/admin/categorias");
}

export async function toggleCategory(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";
  await session.supabase.from("categories").update({ active: !active }).eq("id", id);
  revalidatePath("/admin/categorias");
}

export async function updateCommissionPercent(formData: FormData) {
  const session = await requireAdmin();
  const percent = Number(formData.get("commission_percent"));
  await session.supabase
    .from("app_settings")
    .update({ commission_percent: percent, updated_at: new Date().toISOString() })
    .eq("id", "default");
  revalidatePath("/admin/configuracoes");
}
