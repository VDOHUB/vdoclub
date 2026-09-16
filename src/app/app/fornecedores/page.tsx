import { getSessionProfile } from "@/lib/auth";
import { createBusinessRequest } from "@/lib/actions/crm";
import { Badge, Button, Card, ErrorNote, Select, Stars } from "@/components/ui";

export default async function FornecedoresPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; error?: string }>;
}) {
  const { category, error } = await searchParams;
  const session = await getSessionProfile();
  if (!session) return null;
  const { supabase, profile } = session;

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("active", true)
    .order("name");

  const { data: suppliers } = await supabase
    .from("profiles")
    .select("id, name, phone")
    .eq("role", "supplier")
    .eq("status", "approved")
    .order("name");

  const { data: supplierCategories } = await supabase
    .from("supplier_categories")
    .select("supplier_id, category_id, categories(id, name)");

  const { data: approvedRatings } = await supabase
    .from("ratings")
    .select("supplier_id, stars")
    .eq("status", "approved");

  const categoryMap = new Map((categories ?? []).map((c) => [c.id, c.name]));

  const supplierCatsBySupplier = new Map<string, { id: string; name: string }[]>();
  (supplierCategories ?? []).forEach((row) => {
    const list = supplierCatsBySupplier.get(row.supplier_id) ?? [];
    const catName = categoryMap.get(row.category_id) ?? "";
    list.push({ id: row.category_id, name: catName });
    supplierCatsBySupplier.set(row.supplier_id, list);
  });

  const ratingsBySupplier = new Map<string, number[]>();
  (approvedRatings ?? []).forEach((r) => {
    const list = ratingsBySupplier.get(r.supplier_id) ?? [];
    list.push(r.stars);
    ratingsBySupplier.set(r.supplier_id, list);
  });

  let visibleSuppliers = suppliers ?? [];
  if (category) {
    visibleSuppliers = visibleSuppliers.filter((s) =>
      (supplierCatsBySupplier.get(s.id) ?? []).some((c) => c.id === category)
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl text-white mb-1">Fornecedores</h1>
        <p className="text-sm text-muted">{visibleSuppliers.length} ativos no Club</p>
      </div>

      <ErrorNote message={error} />

      <div className="flex flex-wrap gap-2 mb-8">
        <a
          href="/app/fornecedores"
          className={`text-xs font-medium px-3 py-1.5 rounded-lg border ${
            !category ? "bg-[#d4b896]/20 border-[#d4b896]/40 text-[#d4b896]" : "bg-wood/10 border-wood/25 text-muted"
          }`}
        >
          Todas
        </a>
        {(categories ?? []).map((cat) => (
          <a
            key={cat.id}
            href={`/app/fornecedores?category=${cat.id}`}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg border ${
              category === cat.id
                ? "bg-[#d4b896]/20 border-[#d4b896]/40 text-[#d4b896]"
                : "bg-wood/10 border-wood/25 text-muted"
            }`}
          >
            {cat.name}
          </a>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {visibleSuppliers.map((s) => {
          const cats = supplierCatsBySupplier.get(s.id) ?? [];
          const ratings = ratingsBySupplier.get(s.id) ?? [];
          const avg = ratings.length
            ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length)
            : 0;

          return (
            <Card key={s.id}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="font-semibold text-white text-sm">{s.name}</div>
                  <div className="text-xs text-muted mt-0.5">{ratings.length} avaliações</div>
                </div>
                {avg > 0 && <Stars value={avg} />}
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {cats.map((c) => (
                  <Badge key={c.id}>{c.name}</Badge>
                ))}
              </div>

              {profile.role === "architect" && cats.length > 0 && (
                <form action={createBusinessRequest} className="flex gap-2">
                  <input type="hidden" name="supplier_id" value={s.id} />
                  <Select name="category_id" required className="flex-1">
                    {cats.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                  <Button type="submit">Solicitar</Button>
                </form>
              )}
            </Card>
          );
        })}
      </div>

      {visibleSuppliers.length === 0 && (
        <p className="text-sm text-muted">Nenhum fornecedor encontrado nessa categoria.</p>
      )}
    </div>
  );
}
