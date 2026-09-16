"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRole } from "@/lib/supabase/types";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/app/orcamentos");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "");
  const phone = String(formData.get("phone") ?? "");
  const role = (String(formData.get("role") ?? "architect")) as ProfileRole;
  const referralToken = String(formData.get("referral_token") ?? "").trim() || undefined;
  const categoryIds = formData.getAll("category_ids").map(String).filter(Boolean);

  if (role === "supplier" && categoryIds.length === 0) {
    redirect(
      `/cadastro?error=${encodeURIComponent(
        "Selecione ao menos uma categoria."
      )}&role=${role}`
    );
  }

  const supabase = await createClient();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${site}/api/auth/callback`,
      data: {
        name,
        phone,
        role,
        referral_token: referralToken,
        category_ids: role === "supplier" ? categoryIds : undefined,
      },
    },
  });

  if (error) {
    redirect(`/cadastro?error=${encodeURIComponent(error.message)}&role=${role}`);
  }

  redirect("/cadastro/confirme-email");
}
