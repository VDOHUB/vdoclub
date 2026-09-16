import { getSessionProfile } from "@/lib/auth";
import { createCategory, toggleCategory } from "@/lib/actions/admin";
import { Badge, Button, Card, Input } from "@/components/ui";

export default async function CategoriasPage() {
  const session = await getSessionProfile();
  if (!session) return null;

  const { data: categories } = await session.supabase
    .from("categories")
    .select("id, name, active")
    .order("name");

  return (
    <div className="max-w-xl">
      <h1 className="font-serif text-2xl text-white mb-6">Categorias</h1>

      <Card className="mb-6">
        <form action={createCategory} className="flex gap-2">
          <Input type="text" name="name" placeholder="Nova categoria" required className="flex-1" />
          <Button type="submit">Adicionar</Button>
        </form>
      </Card>

      <div className="space-y-2">
        {(categories ?? []).map((c) => (
          <Card key={c.id} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-white">{c.name}</span>
              <Badge tone={c.active ? "green" : "red"}>{c.active ? "Ativa" : "Inativa"}</Badge>
            </div>
            <form action={toggleCategory}>
              <input type="hidden" name="id" value={c.id} />
              <input type="hidden" name="active" value={String(c.active)} />
              <Button type="submit" variant="ghost">
                {c.active ? "Desativar" : "Ativar"}
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
