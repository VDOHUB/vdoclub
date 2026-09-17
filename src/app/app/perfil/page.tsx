import { getSessionProfile } from "@/lib/auth";
import { addPortfolioItem, deletePortfolioItem } from "@/lib/actions/portfolio";
import { Badge, Button, Card, ErrorNote, Input, Label } from "@/components/ui";

const roleLabel: Record<string, string> = {
  architect: "Arquiteto",
  supplier: "Fornecedor",
  admin: "Admin VDO",
};

export default async function PerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const session = await getSessionProfile();
  if (!session) return null;
  const { supabase, profile, user } = session;

  const { data: categories } =
    profile.role === "supplier"
      ? await supabase
          .from("supplier_categories")
          .select("categories(name)")
          .eq("supplier_id", user.id)
      : { data: [] };

  const { data: portfolio } = await supabase
    .from("portfolio_items")
    .select("id, title, description, link_url, photo_paths")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  const photoUrls = (portfolio ?? []).map((item) => ({
    ...item,
    urls: item.photo_paths.map(
      (path) => supabase.storage.from("portfolio").getPublicUrl(path).data.publicUrl
    ),
  }));

  return (
    <div className="max-w-xl">
      <h1 className="font-serif text-2xl text-white mb-6">Meu perfil</h1>

      <ErrorNote message={error} />

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-semibold text-white">{profile.name}</div>
            <div className="text-xs text-muted mt-0.5">{user.email}</div>
          </div>
          <Badge>{roleLabel[profile.role]}</Badge>
        </div>
        <dl className="text-sm text-cream/80 space-y-2">
          <div className="flex justify-between">
            <dt className="text-muted">Telefone</dt>
            <dd>{profile.phone}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Status</dt>
            <dd>
              {profile.status === "approved"
                ? "Aprovado"
                : profile.status === "rejected"
                ? "Rejeitado"
                : "Em análise"}
            </dd>
          </div>
        </dl>

        {profile.role === "supplier" && (
          <div className="mt-4 pt-4 border-t border-wood/20">
            <div className="text-xs text-muted mb-2">Categorias</div>
            <div className="flex flex-wrap gap-1.5">
              {(categories ?? []).map((c, i) => (
                <Badge key={i}>{c.categories?.name}</Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-white mb-4">Meus projetos</h2>

        <Card className="mb-4">
          <form action={addPortfolioItem} className="space-y-3" encType="multipart/form-data">
            <div>
              <Label>Título</Label>
              <Input type="text" name="title" required placeholder="Ex: Reforma apartamento Setor Bueno" />
            </div>
            <div>
              <Label>Descrição</Label>
              <textarea
                name="description"
                rows={3}
                className="w-full bg-wood/10 border border-wood/25 rounded-lg px-3.5 py-2.5 text-sm text-cream placeholder:text-muted focus:outline-none focus:border-cream/40"
              />
            </div>
            <div>
              <Label>Link (opcional)</Label>
              <Input type="url" name="link_url" placeholder="https://..." />
            </div>
            <div>
              <Label>Fotos (até 5 MB cada)</Label>
              <input
                type="file"
                name="photos"
                multiple
                accept="image/*"
                className="w-full text-xs text-muted file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border file:border-wood/25 file:bg-wood/10 file:text-cream file:text-xs"
              />
            </div>
            <Button type="submit">Adicionar projeto</Button>
          </form>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          {photoUrls.map((item) => (
            <Card key={item.id}>
              {item.urls.length > 0 && (
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  {item.urls.slice(0, 4).map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={url} alt={item.title} className="rounded-lg object-cover aspect-square" />
                  ))}
                </div>
              )}
              <div className="font-semibold text-white text-sm mb-1">{item.title}</div>
              {item.description && <p className="text-xs text-muted mb-2">{item.description}</p>}
              <div className="flex items-center justify-between mt-2">
                {item.link_url ? (
                  <a
                    href={item.link_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#d4b896] font-medium hover:underline"
                  >
                    Ver mais ↗
                  </a>
                ) : (
                  <span />
                )}
                <form action={deletePortfolioItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" className="text-xs text-red-300 hover:underline">
                    Remover
                  </button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
