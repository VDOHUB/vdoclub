import { getSessionProfile } from "@/lib/auth";
import { approveProfile, rejectProfile } from "@/lib/actions/admin";
import { Badge, Button, Card } from "@/components/ui";

const roleLabel: Record<string, string> = {
  architect: "Arquiteto",
  supplier: "Fornecedor",
  admin: "Admin",
};

export default async function AprovacoesPage() {
  const session = await getSessionProfile();
  if (!session) return null;

  const { data: pending } = await session.supabase
    .from("profiles")
    .select("id, name, phone, role, created_at, referred_by")
    .eq("status", "pending_review")
    .order("created_at", { ascending: true });

  const referrerIds = Array.from(
    new Set((pending ?? []).map((p) => p.referred_by).filter((id): id is string => Boolean(id)))
  );
  const { data: referrers } = referrerIds.length
    ? await session.supabase.from("profiles").select("id, name").in("id", referrerIds)
    : { data: [] };
  const referrerMap = new Map((referrers ?? []).map((r) => [r.id, r.name]));

  return (
    <div>
      <h1 className="font-serif text-2xl text-white mb-1">Aprovações pendentes</h1>
      <p className="text-sm text-muted mb-8">{(pending ?? []).length} cadastros aguardando revisão</p>

      <div className="space-y-3">
        {(pending ?? []).map((p) => (
          <Card key={p.id} className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm">{p.name}</span>
                <Badge>{roleLabel[p.role]}</Badge>
              </div>
              <div className="text-xs text-muted mt-0.5">{p.phone}</div>
              {p.referred_by && (
                <div className="text-xs text-[#d4b896] mt-0.5">
                  Indicado por {referrerMap.get(p.referred_by) ?? "—"}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <form action={approveProfile}>
                <input type="hidden" name="id" value={p.id} />
                <Button type="submit">Aprovar</Button>
              </form>
              <form action={rejectProfile}>
                <input type="hidden" name="id" value={p.id} />
                <Button type="submit" variant="danger">
                  Rejeitar
                </Button>
              </form>
            </div>
          </Card>
        ))}
      </div>

      {(pending ?? []).length === 0 && (
        <p className="text-sm text-muted">Nenhum cadastro pendente no momento.</p>
      )}
    </div>
  );
}
