import { getSessionProfile } from "@/lib/auth";
import { addSponsor, deleteSponsor, toggleSponsor } from "@/lib/actions/sponsors";
import { Badge, Button, Card, ErrorNote, Input, Label } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";

export default async function PatrocinadoresPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const session = await getSessionProfile();
  if (!session) return null;

  const { data: sponsors } = await session.supabase
    .from("sponsors")
    .select("id, name, logo_url, link_url, active")
    .order("created_at", { ascending: true });

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-2xl text-white mb-1">Patrocinadores</h1>
      <p className="text-sm text-muted mb-6">
        Os logos ativos passam em loop no celular exibido nas telas do app (em telas largas).
      </p>

      <ErrorNote message={error} />

      <Card className="mb-6">
        <form action={addSponsor} className="space-y-3" encType="multipart/form-data">
          <div>
            <Label>Nome</Label>
            <Input type="text" name="name" required placeholder="Ex: Marcenaria Nobre" />
          </div>
          <div>
            <Label>Link (opcional)</Label>
            <Input type="url" name="link_url" placeholder="https://..." />
          </div>
          <div>
            <Label>Logo (imagem até 5 MB)</Label>
            <input
              type="file"
              name="logo"
              accept="image/*"
              required
              className="w-full text-xs text-muted file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border file:border-wood/25 file:bg-wood/10 file:text-cream file:text-xs"
            />
          </div>
          <SubmitButton pendingText="Enviando logo...">Adicionar patrocinador</SubmitButton>
        </form>
      </Card>

      <div className="space-y-2">
        {(sponsors ?? []).map((s) => (
          <Card key={s.id} className="py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-16 h-12 rounded-lg bg-white flex items-center justify-center p-1.5 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.logo_url} alt={s.name} className="max-w-full max-h-full object-contain" />
              </div>
              <div className="min-w-0">
                <div className="text-sm text-white truncate">{s.name}</div>
                {s.link_url && <div className="text-xs text-muted truncate">{s.link_url}</div>}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge tone={s.active ? "green" : "red"}>{s.active ? "Ativo" : "Oculto"}</Badge>
              <form action={toggleSponsor}>
                <input type="hidden" name="id" value={s.id} />
                <input type="hidden" name="active" value={String(s.active)} />
                <Button type="submit" variant="ghost">
                  {s.active ? "Ocultar" : "Mostrar"}
                </Button>
              </form>
              <form action={deleteSponsor}>
                <input type="hidden" name="id" value={s.id} />
                <Button type="submit" variant="danger">
                  Remover
                </Button>
              </form>
            </div>
          </Card>
        ))}
      </div>

      {(sponsors ?? []).length === 0 && (
        <p className="text-sm text-muted">Nenhum patrocinador cadastrado ainda.</p>
      )}
    </div>
  );
}
