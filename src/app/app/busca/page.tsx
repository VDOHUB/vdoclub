import Link from "next/link";
import { getSessionProfile } from "@/lib/auth";
import { Badge, Card } from "@/components/ui";

const roleLabel: Record<string, string> = {
  architect: "Arquiteto",
  supplier: "Fornecedor",
  admin: "Admin VDO",
};

export default async function BuscaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const session = await getSessionProfile();
  if (!session) return null;
  const { supabase } = session;

  let results: { id: string; name: string; role: string; matchedCategory?: string }[] = [];

  if (query) {
    const { data: byName } = await supabase
      .from("profiles")
      .select("id, name, role")
      .eq("status", "approved")
      .in("role", ["architect", "supplier"])
      .ilike("name", `%${query}%`);

    const { data: byCategory } = await supabase
      .from("categories")
      .select("id, name")
      .ilike("name", `%${query}%`);

    let suppliersByCategory: { id: string; name: string; role: string; matchedCategory?: string }[] = [];
    if ((byCategory ?? []).length > 0) {
      const categoryIds = (byCategory ?? []).map((c) => c.id);
      const { data: links } = await supabase
        .from("supplier_categories")
        .select("supplier_id, category_id")
        .in("category_id", categoryIds);

      const supplierIds = Array.from(new Set((links ?? []).map((l) => l.supplier_id)));
      if (supplierIds.length > 0) {
        const { data: suppliers } = await supabase
          .from("profiles")
          .select("id, name, role")
          .eq("status", "approved")
          .in("id", supplierIds);

        const catNameById = new Map((byCategory ?? []).map((c) => [c.id, c.name]));
        const catBySupplier = new Map<string, string>();
        (links ?? []).forEach((l) => {
          if (!catBySupplier.has(l.supplier_id)) {
            catBySupplier.set(l.supplier_id, catNameById.get(l.category_id) ?? "");
          }
        });

        suppliersByCategory = (suppliers ?? []).map((s) => ({
          ...s,
          matchedCategory: catBySupplier.get(s.id),
        }));
      }
    }

    const merged = new Map<string, { id: string; name: string; role: string; matchedCategory?: string }>();
    (byName ?? []).forEach((p) => merged.set(p.id, p));
    suppliersByCategory.forEach((p) => {
      if (!merged.has(p.id)) merged.set(p.id, p);
    });

    results = Array.from(merged.values());
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-serif text-2xl text-white mb-1">Busca</h1>
      <p className="text-sm text-muted mb-8">
        {query ? `Resultados para "${query}"` : "Digite algo na busca do topo para encontrar fornecedores e arquitetos."}
      </p>

      <div className="space-y-3">
        {results.map((r) => (
          <Link key={r.id} href={`/app/perfil/${r.id}`}>
            <Card className="hover:border-wood/60 transition-colors flex items-center justify-between">
              <div>
                <div className="font-semibold text-white text-sm">{r.name}</div>
                {r.matchedCategory && (
                  <div className="text-xs text-muted mt-0.5">Categoria: {r.matchedCategory}</div>
                )}
              </div>
              <Badge>{roleLabel[r.role]}</Badge>
            </Card>
          </Link>
        ))}
      </div>

      {query && results.length === 0 && (
        <p className="text-sm text-muted">Nada encontrado para &quot;{query}&quot;.</p>
      )}
    </div>
  );
}
