import { getSessionProfile } from "@/lib/auth";
import { updateCommissionPercent } from "@/lib/actions/admin";
import { Button, Card, ErrorNote, Input, Label } from "@/components/ui";

export default async function ConfiguracoesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const session = await getSessionProfile();
  if (!session) return null;

  const { data: settings } = await session.supabase
    .from("app_settings")
    .select("commission_percent")
    .eq("id", "default")
    .single();

  return (
    <div className="max-w-md">
      <h1 className="font-serif text-2xl text-white mb-6">Configurações</h1>

      <ErrorNote message={error} />

      <Card>
        <h2 className="text-sm font-semibold text-white mb-1">Comissão do Club</h2>
        <p className="text-xs text-muted mb-4">
          Percentual exibido como referência na tela de cada orçamento, calculado em cima do valor
          proposto pelo fornecedor. Ainda não processa pagamento.
        </p>
        <form action={updateCommissionPercent} className="flex gap-2">
          <div className="flex-1">
            <Label>Percentual (%)</Label>
            <Input
              type="number"
              name="commission_percent"
              step="0.1"
              min="0"
              max="100"
              defaultValue={settings?.commission_percent ?? 10}
              required
            />
          </div>
          <Button type="submit" className="self-end">
            Salvar
          </Button>
        </form>
      </Card>
    </div>
  );
}
