import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ensureSupabaseActive } from "@/lib/supabase-guard";

export const dynamic = "force-dynamic";

// Checagem pública. Chamada de tempos em tempos por um monitor externo (ex.: UptimeRobot a cada
// 5 min): mantém o Supabase ativo e, se o banco estiver pausado, já pede a reativação.
export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { error } = await supabase.from("categories").select("id").limit(1);

  if (error) {
    const guard = await ensureSupabaseActive();
    return NextResponse.json({ ok: false, supabase: guard.status, action: guard.action }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
