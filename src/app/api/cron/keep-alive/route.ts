import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ensureSupabaseActive } from "@/lib/supabase-guard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.rpc("keep_alive_ping");

  if (error) {
    // Banco fora do ar (provavelmente pausado): tenta reativar sozinho.
    const guard = await ensureSupabaseActive();
    return NextResponse.json(
      { ok: false, error: error.message, supabase: guard.status, action: guard.action },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, pinged_at: data });
}
