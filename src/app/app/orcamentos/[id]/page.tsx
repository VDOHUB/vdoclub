import { notFound } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { marcarFechado, submitOrcamento, submitRating } from "@/lib/actions/crm";
import { Badge, Button, Card, ErrorNote, Input, Label, Stars } from "@/components/ui";
import type { BusinessStatus } from "@/lib/supabase/types";

const statusTone: Record<BusinessStatus, "yellow" | "wood" | "green"> = {
  indicou: "yellow",
  orcamento: "wood",
  fechado: "green",
};
const statusLabel: Record<BusinessStatus, string> = {
  indicou: "Aguardando resposta",
  orcamento: "Aguardando aprovação",
  fechado: "Fechado",
};

export default async function OrcamentoDetalhePage({
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
  const { supabase, profile, user } = session;

  const { data: req } = await supabase
    .from("business_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (!req) notFound();
  if (req.architect_id !== user.id && req.supplier_id !== user.id && profile.role !== "admin") {
    notFound();
  }

  const { data: architect } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", req.architect_id)
    .single();
  const { data: supplier } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", req.supplier_id)
    .single();
  const { data: category } = await supabase
    .from("categories")
    .select("name")
    .eq("id", req.category_id)
    .single();
  const { data: rating } = await supabase
    .from("ratings")
    .select("*")
    .eq("business_request_id", id)
    .maybeSingle();

  const isSupplier = profile.role === "supplier" && req.supplier_id === user.id;
  const isArchitect = profile.role === "architect" && req.architect_id === user.id;

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <div className="text-xs text-muted mb-1">{category?.name}</div>
        <h1 className="font-serif text-2xl text-white mb-2">
          {isSupplier ? architect?.name : supplier?.name}
        </h1>
        <Badge tone={statusTone[req.status]}>{statusLabel[req.status]}</Badge>
      </div>

      <ErrorNote message={error} />

      <Card className="mb-4">
        {req.valor_proposto ? (
          <div className="flex justify-between items-center">
            <span className="text-sm text-cream/80">Valor proposto</span>
            <span className="text-lg font-bold text-[#d4b896]">
              R$ {Number(req.valor_proposto).toLocaleString("pt-BR")}
            </span>
          </div>
        ) : (
          <p className="text-sm text-muted">Ainda sem valor proposto.</p>
        )}
      </Card>

      {isSupplier && req.status === "indicou" && (
        <Card className="mb-4">
          <h2 className="text-sm font-semibold text-white mb-3">Responder com valor</h2>
          <form action={submitOrcamento} className="flex gap-2">
            <input type="hidden" name="id" value={req.id} />
            <div className="flex-1">
              <Label>Valor (R$)</Label>
              <Input type="number" name="valor_proposto" step="0.01" min="0" required />
            </div>
            <Button type="submit" className="self-end">
              Enviar orçamento
            </Button>
          </form>
        </Card>
      )}

      {isArchitect && req.status === "orcamento" && (
        <Card className="mb-4">
          <h2 className="text-sm font-semibold text-white mb-3">Aprovar fechamento</h2>
          <p className="text-xs text-muted mb-3">
            O pagamento ainda não é feito pelo app nesta fase — combine diretamente com o
            fornecedor e marque como fechado quando o negócio for concluído.
          </p>
          <form action={marcarFechado}>
            <input type="hidden" name="id" value={req.id} />
            <Button type="submit">Marcar como fechado</Button>
          </form>
        </Card>
      )}

      {isArchitect && req.status === "fechado" && !rating && (
        <Card className="mb-4">
          <h2 className="text-sm font-semibold text-white mb-3">Avaliar fornecedor</h2>
          <form action={submitRating} className="space-y-3">
            <input type="hidden" name="business_request_id" value={req.id} />
            <input type="hidden" name="supplier_id" value={req.supplier_id} />
            <div>
              <Label>Nota</Label>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <label key={n} className="flex items-center gap-1 text-sm text-cream">
                    <input type="radio" name="stars" value={n} required className="accent-[#d4b896]" />
                    {n}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label>Comentário</Label>
              <textarea
                name="comment"
                rows={3}
                className="w-full bg-wood/10 border border-wood/25 rounded-lg px-3.5 py-2.5 text-sm text-cream placeholder:text-muted focus:outline-none focus:border-cream/40"
              />
            </div>
            <Button type="submit">Enviar avaliação</Button>
          </form>
        </Card>
      )}

      {rating && (
        <Card>
          <h2 className="text-sm font-semibold text-white mb-2">Sua avaliação</h2>
          <div className="flex items-center gap-3 mb-2">
            <Stars value={rating.stars} />
            <Badge tone={rating.status === "approved" ? "green" : rating.status === "rejected" ? "red" : "yellow"}>
              {rating.status === "approved"
                ? "Aprovada"
                : rating.status === "rejected"
                ? "Rejeitada"
                : "Em análise"}
            </Badge>
          </div>
          {rating.comment && <p className="text-sm text-muted">{rating.comment}</p>}
        </Card>
      )}
    </div>
  );
}
