import Link from "next/link";
import { getSessionProfile } from "@/lib/auth";
import { Avatar, Badge, Card, ErrorNote, Input, Label, Stars } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { createArchitectReferral } from "@/lib/actions/referrals";

export default async function FornecedoresPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; error?: string }>;
}) {
  const { category, error } = await searchParams;
  const session = await getSessionProfile();
  if (!session) return null;
  const { supabase, profile, user } = session;

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

  const { data: myReferrals } =
    profile.role === "architect"
      ? await supabase
          .from("referral_links")
          .select("id, token, invited_name, invited_activity, uses_count")
          .eq("created_by", user.id)
          .order("created_at", { ascending: false })
      : { data: [] };

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

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

      {profile.role === "architect" && (
        <details className="mb-8" open={(myReferrals ?? []).length > 0}>
          <summary className="cursor-pointer list-none inline-flex items-center gap-2 text-sm font-semibold text-[#d4b896] hover:underline">
            <span className="text-base leading-none">+</span> Indicar fornecedor
          </summary>

          <Card className="mt-4">
            <p className="text-xs text-muted mb-4">
              Preencha os dados do fornecedor que você quer indicar. Vamos gerar um link — ele
              ainda passa pela aprovação do time VDO, mas já fica marcado como indicado por você.
            </p>
            <form action={createArchitectReferral} className="space-y-3">
              <div>
                <Label>Nome</Label>
                <Input type="text" name="invited_name" required />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input type="tel" name="invited_phone" placeholder="(00) 00000-0000" />
              </div>
              <div>
                <Label>Atividade</Label>
                <Input type="text" name="invited_activity" placeholder="Ex: Marcenaria sob medida" />
              </div>
              <SubmitButton pendingText="Gerando link...">Gerar link de indicação</SubmitButton>
            </form>
          </Card>

          <div className="space-y-2 mt-3">
            {(myReferrals ?? []).map((r) => (
              <Card key={r.id} className="py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white">{r.invited_name}</div>
                    {r.invited_activity && (
                      <div className="text-xs text-muted">{r.invited_activity}</div>
                    )}
                  </div>
                  <Badge tone={r.uses_count > 0 ? "green" : "wood"}>
                    {r.uses_count > 0 ? "Cadastrado" : "Aguardando"}
                  </Badge>
                </div>
                <div className="text-xs text-cream/70 font-mono mt-2 break-all">
                  {`${site}/cadastro?ref=${r.token}`}
                </div>
              </Card>
            ))}
          </div>
        </details>
      )}

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
