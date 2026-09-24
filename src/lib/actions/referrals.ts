"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";

export async function createArchitectReferral(formData: FormData) {
  const session = await getSessionProfile();
  if (!session || session.profile.role !== "architect" || session.profile.status !== "approved") {
    redirect("/login");
  }

  const name = String(formData.get("invited_name") ?? "").trim();
  const phone = String(formData.get("invited_phone") ?? "").trim();
  const activity = String(formData.get("invited_activity") ?? "").trim();

  if (!name) redirect(`/app/perfil?error=${encodeURIComponent("Informe o nome do fornecedor")}`);

  const token = crypto.randomBytes(6).toString("hex");

  const { error } = await session.supabase.from("referral_links").insert({
    token,
    created_by: session.user.id,
    invited_name: name,
    invited_phone: phone || null,
    invited_activity: activity || null,
  });

  if (error) redirect(`/app/perfil?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/app/perfil");
  redirect("/app/perfil");
}
