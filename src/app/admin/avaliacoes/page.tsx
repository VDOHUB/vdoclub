import { getSessionProfile } from "@/lib/auth";
import { approveRating, rejectRating } from "@/lib/actions/admin";
import { Button, Card, Stars } from "@/components/ui";

export default async function AvaliacoesPage() {
  const session = await getSessionProfile();
  if (!session) return null;

  const { data: pending } = await session.supabase
    .from("ratings")
    .select("id, stars, comment, architect_id, supplier_id, created_at")
    .eq("status", "pending_review")
    .order("created_at", { ascending: true });

  const ids = pending ?? [];
  const profileIds = Array.from(
    new Set(ids.flatMap((r) => [r.architect_id, r.supplier_id]))
  );
  const { data: profiles } = profileIds.length
    ? await session.supabase.from("profiles").select("id, name").in("id", profileIds)
    : { data: [] };
  const nameMap = new Map((profiles ?? []).map((p) => [p.id, p.name]));

  return (
    <div>
      <h1 className="font-serif text-2xl text-white mb-1">Avaliações pendentes</h1>
      <p className="text-sm text-muted mb-8">{ids.length} avaliações aguardando revisão</p>

      <div className="space-y-3">
        {ids.map((r) => (
          <Card key={r.id}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm">
                <span className="font-semibold text-white">{nameMap.get(r.architect_id)}</span>
                <span className="text-muted"> avaliou </span>
                <span className="font-semibold text-white">{nameMap.get(r.supplier_id)}</span>
              </div>
              <Stars value={r.stars} />
            </div>
            {r.comment && <p className="text-sm text-cream/80 mb-3">{r.comment}</p>}
            <div className="flex gap-2">
              <form action={approveRating}>
                <input type="hidden" name="id" value={r.id} />
                <Button type="submit">Aprovar</Button>
              </form>
              <form action={rejectRating}>
                <input type="hidden" name="id" value={r.id} />
                <Button type="submit" variant="danger">
                  Rejeitar
                </Button>
              </form>
            </div>
          </Card>
        ))}
      </div>

      {ids.length === 0 && <p className="text-sm text-muted">Nenhuma avaliação pendente no momento.</p>}
    </div>
  );
}
