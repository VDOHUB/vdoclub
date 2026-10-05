import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Valida o token_hash do e-mail de recuperação de senha. Diferente do fluxo PKCE,
// não depende de cookie do navegador que pediu o link — funciona em qualquer aparelho.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/redefinir-senha";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/redefinir-senha";

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/esqueci-senha?error=${encodeURIComponent(
      "O link expirou ou já foi usado. Peça um novo para redefinir sua senha."
    )}`
  );
}
