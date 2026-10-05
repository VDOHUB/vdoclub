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
  const acceptedTerms = formData.get("accept_terms") === "on";

  const back = (message: string) =>
    `/cadastro?error=${encodeURIComponent(message)}&role=${role}${
      referralToken ? `&ref=${encodeURIComponent(referralToken)}` : ""
    }`;

  if (!acceptedTerms) {
    redirect(back("Para criar sua conta, aceite os Termos de Uso e a Política de Privacidade."));
  }

  if (role === "supplier" && categoryIds.length === 0) {
    redirect(back("Selecione ao menos uma categoria."));
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
        terms_accepted_at: new Date().toISOString(),
      },
    },
  });

  if (error) {
    redirect(back(error.message));
  }

  redirect("/cadastro/confirme-email");
}

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();

  if (email) {
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(email);
  }

  // Resposta sempre igual, exista o e-mail ou não, para não revelar quem tem conta.
  redirect("/esqueci-senha?sent=1");
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 6) {
    redirect(`/redefinir-senha?error=${encodeURIComponent("A senha deve ter ao menos 6 caracteres.")}`);
  }
  if (password !== confirm) {
    redirect(`/redefinir-senha?error=${encodeURIComponent("As senhas não conferem.")}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/esqueci-senha?error=${encodeURIComponent("O link expirou. Peça um novo para redefinir sua senha.")}`
    );
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/redefinir-senha?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/app/orcamentos");
}
