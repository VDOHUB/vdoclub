// Auto-recuperação: se o projeto Supabase estiver pausado, pede a reativação pela Management API.
// Requer a variável SUPABASE_ACCESS_TOKEN (token pessoal da conta Supabase) no ambiente.
// O ref do projeto é deduzido de NEXT_PUBLIC_SUPABASE_URL.

export type GuardResult = {
  status: string;
  action: "none" | "restore_requested" | "no_token" | "error";
};

const PAUSED_STATES = new Set(["INACTIVE", "PAUSED", "GOING_DOWN"]);

function projectRef(): string | null {
  try {
    const host = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
    return host.split(".")[0] || null;
  } catch {
    return null;
  }
}

export async function ensureSupabaseActive(): Promise<GuardResult> {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  const ref = projectRef();
  if (!ref) return { status: "UNKNOWN", action: "error" };
  if (!token) return { status: "UNKNOWN", action: "no_token" };

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const base = `https://api.supabase.com/v1/projects/${ref}`;

  try {
    const res = await fetch(base, { headers, signal: AbortSignal.timeout(8000), cache: "no-store" });
    if (!res.ok) return { status: `HTTP_${res.status}`, action: "error" };
    const { status } = (await res.json()) as { status: string };

    if (PAUSED_STATES.has(status)) {
      const restore = await fetch(`${base}/restore`, {
        method: "POST",
        headers,
        body: "{}",
        signal: AbortSignal.timeout(8000),
        cache: "no-store",
      });
      return { status, action: restore.ok ? "restore_requested" : "error" };
    }

    return { status, action: "none" };
  } catch {
    return { status: "UNREACHABLE", action: "error" };
  }
}
