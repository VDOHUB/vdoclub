import { getSessionProfile } from "@/lib/auth";
import { createReferralLink, toggleReferralLink } from "@/lib/actions/admin";
import { Badge, Button, Card } from "@/components/ui";

export default async function IndicacoesPage() {
  const session = await getSessionProfile();
  if (!session) return null;

  const { data: links } = await session.supabase
    .from("referral_links")
    .select("id, token, active, uses_count, created_at")
    .order("created_at", { ascending: false });

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-white">Links de indicação</h1>
        <form action={createReferralLink}>
          <Button type="submit">Gerar link</Button>
        </form>
      </div>
      <p className="text-sm text-muted mb-6">
        Quem se cadastrar por um destes links entra aprovado automaticamente, sem revisão manual.
      </p>

      <div className="space-y-2">
        {(links ?? []).map((l) => (
          <Card key={l.id} className="flex items-center justify-between py-3">
            <div>
              <div className="text-sm text-cream font-mono">{`${site}/cadastro?ref=${l.token}`}</div>
              <div className="text-xs text-muted mt-1">{l.uses_count} cadastros usados</div>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone={l.active ? "green" : "red"}>{l.active ? "Ativo" : "Inativo"}</Badge>
              <form action={toggleReferralLink}>
                <input type="hidden" name="id" value={l.id} />
                <input type="hidden" name="active" value={String(l.active)} />
                <Button type="submit" variant="ghost">
                  {l.active ? "Desativar" : "Ativar"}
                </Button>
              </form>
            </div>
          </Card>
        ))}
      </div>

      {(links ?? []).length === 0 && <p className="text-sm text-muted">Nenhum link gerado ainda.</p>}
    </div>
  );
}
