import { notFound } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { createBusinessRequest } from "@/lib/actions/crm";
import { Badge, Button, Card, ErrorNote, Input, Label, Select, Stars } from "@/components/ui";

const roleLabel: Record<string, string> = {
  architect: "Arquiteto",
  supplier: "Fornecedor",
  admin: "Admin VDO",
};

export default async function PerfilPublicoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const session = await getSessionProfile();
  if (!session) return null;
  const { supabase, profile: viewer } = session;

  const { data: target } = await supabase
    .from("profiles")
    .select("id, name, role, status")
    .eq("id", id)
    .single();

  if (!target || target.status !== "approved") notFound();

  const { data: portfolio } = await supabase
    .from("portfolio_items")
    .select("id, title, description, link_url, photo_paths")
    .eq("profile_id", id)
    .order("created_at", { ascending: false });

  const isSupplier = target.role === "supplier";

  const { data: supplierCategories } = isSupplier
    ? await supabase
        .from("supplier_categories")
        .select("category_id, categories(id, name)")
        .eq("supplier_id", id)
    : { data: [] };

  const { data: approvedRatings } = isSupplier
    ? await supabase.from("ratings").select("stars").eq("supplier_id", id).eq("status", "approved")
    : { data: [] };

  const avg = (approvedRatings ?? []).length
    ? Math.round((approvedRatings ?? []).reduce((a, r) => a + r.stars, 0) / (approvedRatings ?? []).length)
    : 0;

  const canRequest = viewer.role === "architect" && isSupplier && (supplierCategories ?? []).length > 0;

  const photoUrls = (portfolio ?? []).map((item) => ({
    ...item,
    urls: item.photo_paths.map(
      (path) =>
        supabase.storage.from("portfolio").getPublicUrl(path).data.publicUrl
    ),
  }));

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-2xl text-white mb-1">{target.name}</h1>
          <div className="flex items-center gap-2">
            <Badge>{roleLabel[target.role]}</Badge>
            {isSupplier && avg > 0 && <Stars value={avg} />}
          </div>
        </div>
      </div>

      <ErrorNote message={error} />

      {isSupplier && (supplierCategories ?? []).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {(supplierCategories ?? []).map((c) => (
            <Badge key={c.category_id}>{c.categories?.name}</Badge>
          ))}
        </div>
      )}

      {canRequest && <NovoOrcamentoForm supplierId={target.id} categories={supplierCategories ?? []} />}

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-white mb-4">Projetos realizados</h2>
        {photoUrls.length === 0 && <p className="text-sm text-muted">Nenhum projeto cadastrado ainda.</p>}
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
              {item.link_url && (
                <a
                  href={item.link_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#d4b896] font-medium hover:underline"
                >
                  Ver mais ↗
                </a>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function NovoOrcamentoForm({
  supplierId,
  categories,
}: {
  supplierId: string;
  categories: { category_id: string; categories: { id: string; name: string } | null }[];
}) {
  return (
    <Card className="mb-2">
      <h2 className="text-sm font-semibold text-white mb-3">+ Novo orçamento</h2>
      <form action={createBusinessRequest} className="space-y-3" encType="multipart/form-data">
        <input type="hidden" name="supplier_id" value={supplierId} />
        <input type="hidden" name="back_to" value={`/app/perfil/${supplierId}`} />
        <div>
          <Label>Categoria</Label>
          <Select name="category_id" required>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.categories?.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Título</Label>
          <Input type="text" name="title" required placeholder="Ex: Marcenaria planejada para sala" />
        </div>
        <div>
          <Label>Descrição</Label>
          <textarea
            name="description"
            rows={3}
            placeholder="Detalhe o que você precisa"
            className="w-full bg-wood/10 border border-wood/25 rounded-lg px-3.5 py-2.5 text-sm text-cream placeholder:text-muted focus:outline-none focus:border-cream/40"
          />
        </div>
        <div>
          <Label>Fotos ou arquivos (até 5 MB cada)</Label>
          <input
            type="file"
            name="files"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            className="w-full text-xs text-muted file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border file:border-wood/25 file:bg-wood/10 file:text-cream file:text-xs"
          />
        </div>
        <Button type="submit">Enviar solicitação</Button>
      </form>
    </Card>
  );
}
