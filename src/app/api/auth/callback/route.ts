import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/app/orcamentos";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // O Supabase já confirma o e-mail no servidor antes de chegar aqui, mesmo
  // que a troca de sessão falhe (ex: link aberto em outro navegador). Nesses
  // casos mandamos para uma tela de sucesso em vez de um erro assustador —
  // o usuário só precisa fazer login normalmente em seguida.
  return NextResponse.redirect(`${origin}/cadastro/confirmado`);
}
