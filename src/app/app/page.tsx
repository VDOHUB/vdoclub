import Link from "next/link";
import { getSessionProfile } from "@/lib/auth";
import { Badge, Card } from "@/components/ui";
import type { BusinessStatus } from "@/lib/supabase/types";

const statusTone: Record<BusinessStatus, "yellow" | "wood" | "green"> = {
  indicou: "yellow",
  orcamento: "wood",
  fechado: "green",
};
const statusLabel: Record<BusinessStatus, string> = {
  indicou: "Aguardando",
  orcamento: "Respondido",
  fechado: "Fechado",
};

export default async function HomePage() {
  const session = await getSessionProfile();
  if (!session) return null;
  const { supabase, profile, user } = session;

  const filterColumn = profile.role === "supplier" ? "supplier_id" : "architect_id";

  const { data: requests } = await supabase
    .from("business_requests")
    .select("id, status, title, created_at")
    .eq(filterColumn, user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  const pendingCount = (requests ?? []).filter((r) => r.status !== "fechado").length;

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <p className="text-xs text-muted mb-1">Bem-vindo de volta</p>
        <h1 className="font-serif text-2xl text-white">{profile.name}</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <Link href="/app/orcamentos">
          <Card className="hover:border-wood/60 transition-colors">
            <div className="text-2xl font-bold text-[#d4b896]">{pendingCount}</div>
            <div className="text-xs text-muted mt-1">
              {profile.role === "supplier" ? "solicitações em aberto" : "orçamentos em andamento"}
            </div>
          </Card>
        </Link>
        <Link href="/app/fornecedores">
          <Card className="hover:border-wood/60 transition-colors">
            <div className="text-2xl font-bold text-[#d4b896]">→</div>
            <div className="text-xs text-muted mt-1">ver fornecedores</div>
          </Card>
        </Link>
      </div>

      <h2 className="text-sm font-semibold text-white mb-3">Atividade recente</h2>
      <div className="space-y-3">
        {(requests ?? []).map((r) => (
          <Link key={r.id} href={`/app/orcamentos/${r.id}`}>
            <Card className="hover:border-wood/60 transition-colors flex items-center justify-between">
              <span className="text-sm text-white">{r.title || "Orçamento"}</span>
              <Badge tone={statusTone[r.status]}>{statusLabel[r.status]}</Badge>
            </Card>
          </Link>
        ))}
        {(requests ?? []).length === 0 && (
          <p className="text-sm text-muted">Nenhuma atividade ainda.</p>
        )}
      </div>
    </div>
  );
}
