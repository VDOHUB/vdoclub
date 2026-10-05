import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Checagem pública e somente-leitura. Chamada de tempos em tempos por um agendador
// externo: mantém o Supabase ativo e falha (HTTP 503) se o banco estiver fora do ar.
export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { error } = await supabase.from("categories").select("id").limit(1);

  if (error) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
