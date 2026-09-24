import Link from "next/link";
import { getSessionProfile } from "@/lib/auth";
import { Avatar, Badge, Card, ErrorNote, Stars } from "@/components/ui";

export default async function FornecedoresPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; error?: string }>;
}) {
  const { category, error } = await searchParams;
  const session = await getSessionProfile();
  if (!session) return null;
  const { supabase } = session;

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("active", true)
    .order("name");

  const { data: suppliers } = await supabase
    .from("profiles")
    .select("id, name, phone, avatar_url")
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
            <Link key={s.id} href={`/app/perfil/${s.id}`}>
              <Card className="hover:border-wood/60 transition-colors h-full">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar url={s.avatar_url} name={s.name} size={36} />
                    <div className="min-w-0">
                      <div className="font-semibold text-white text-sm truncate">{s.name}</div>
                      <div className="text-xs text-muted mt-0.5 whitespace-nowrap">{ratings.length} avaliações</div>
                      {avg > 0 && <Stars value={avg} />}
                    </div>
                  </div>
                  {cats.length > 0 && (
                    <Badge>
                      <span className="whitespace-nowrap">
                        {cats[0].name}
                        {cats.length > 1 ? ` e +${cats.length - 1}` : ""}
                      </span>
                    </Badge>
                  )}
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {visibleSuppliers.length === 0 && (
        <p className="text-sm text-muted">Nenhum fornecedor encontrado nessa categoria.</p>
      )}
    </div>
  );
}
