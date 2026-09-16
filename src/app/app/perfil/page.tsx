import { getSessionProfile } from "@/lib/auth";
import { Badge, Card } from "@/components/ui";

const roleLabel: Record<string, string> = {
  architect: "Arquiteto",
  supplier: "Fornecedor",
  admin: "Admin VDO",
};

export default async function PerfilPage() {
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

  return (
    <div className="max-w-xl">
      <h1 className="font-serif text-2xl text-white mb-6">Meu perfil</h1>

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
    </div>
  );
}
