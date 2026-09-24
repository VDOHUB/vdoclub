import Link from "next/link";
import { getSessionProfile } from "@/lib/auth";
import { Badge, Card } from "@/components/ui";
import { statusLabel, statusTone } from "@/lib/status";

export default async function OrcamentosPage() {
  const session = await getSessionProfile();
  if (!session) return null;
  const { supabase, profile, user } = session;

  const filterColumn = profile.role === "supplier" ? "supplier_id" : "architect_id";

  const { data: requests } = await supabase
    .from("business_requests")
    .select("id, status, title, valor_proposto, created_at, architect_id, supplier_id, category_id")
    .eq(filterColumn, user.id)
    .order("created_at", { ascending: false });

  const ids = requests ?? [];
  const otherPartyIds = Array.from(
    new Set(ids.map((r) => (profile.role === "supplier" ? r.architect_id : r.supplier_id)))
  );
  const categoryIds = Array.from(new Set(ids.map((r) => r.category_id)));

  const { data: parties } = otherPartyIds.length
    ? await supabase.from("profiles").select("id, name").in("id", otherPartyIds)
    : { data: [] };
  const { data: cats } = categoryIds.length
    ? await supabase.from("categories").select("id, name").in("id", categoryIds)
    : { data: [] };

  const partyMap = new Map((parties ?? []).map((p) => [p.id, p.name]));
  const catMap = new Map((cats ?? []).map((c) => [c.id, c.name]));

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl text-white mb-1">
          {profile.role === "supplier" ? "Solicitações recebidas" : "Meus Orçamentos"}
        </h1>
        <p className="text-sm text-muted">{profile.name}</p>
      </div>

      <div className="space-y-3">
        {ids.map((r) => {
          const otherId = profile.role === "supplier" ? r.architect_id : r.supplier_id;
          return (
            <Link key={r.id} href={`/app/orcamentos/${r.id}`}>
              <Card className="hover:border-wood/60 transition-colors flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-white text-sm">
                    {r.title || partyMap.get(otherId) || "—"}
                  </div>
                  <div className="text-xs text-muted mt-0.5">
                    {partyMap.get(otherId) ?? "—"} · {catMap.get(r.category_id) ?? "—"}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {r.valor_proposto && (
                    <span className="text-sm font-semibold text-[#d4b896]">
                      R$ {Number(r.valor_proposto).toLocaleString("pt-BR")}
                    </span>
                  )}
                  <Badge tone={statusTone[r.status]}>{statusLabel[r.status]}</Badge>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {ids.length === 0 && (
        <p className="text-sm text-muted">
          {profile.role === "supplier"
            ? "Nenhuma solicitação recebida ainda."
            : "Nenhum orçamento solicitado ainda. Vá até Fornecedores para pedir um."}
        </p>
      )}
    </div>
  );
}
