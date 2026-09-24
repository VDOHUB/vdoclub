import { notFound } from "next/navigation";
import Link from "next/link";
import { getSessionProfile } from "@/lib/auth";
import { approveOrcamento, marcarConcluido, submitOrcamento, submitRating } from "@/lib/actions/crm";
import {
  Badge,
  Button,
  Card,
  ErrorNote,
  Input,
  Label,
  StarPicker,
  StatusStepper,
  Stars,
} from "@/components/ui";

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
  const { data: settings } = await supabase
    .from("app_settings")
    .select("commission_percent")
    .eq("id", "default")
    .single();

  const { data: attachments } = await supabase
    .from("business_request_attachments")
    .select("id, storage_path, file_name")
    .eq("business_request_id", id);

  const attachmentLinks = await Promise.all(
    (attachments ?? []).map(async (a) => {
      const { data } = await supabase.storage
        .from("orcamento-anexos")
        .createSignedUrl(a.storage_path, 60 * 60);
      return { id: a.id, name: a.file_name, url: data?.signedUrl ?? null };
    })
  );

  const isSupplier = profile.role === "supplier" && req.supplier_id === user.id;
  const isArchitect = profile.role === "architect" && req.architect_id === user.id;
  const commissionPercent = settings?.commission_percent ?? 0;
  const commissionValue = req.valor_proposto
    ? (Number(req.valor_proposto) * commissionPercent) / 100
    : null;

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <div className="text-xs text-muted mb-1">{category?.name}</div>
        <h1 className="font-serif text-2xl text-white mb-4">{req.title}</h1>
        <StatusStepper status={req.status} />
      </div>

      <ErrorNote message={error} />

      {req.description && (
        <Card className="mb-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-cream/70 mb-1.5">
            Observações
          </div>
          <p className="text-sm text-cream/80">{req.description}</p>
        </Card>
      )}

      <Card className="mb-4">
        <dl className="text-sm space-y-3">
          <div className="flex justify-between">
            <dt className="text-muted">Fornecedor</dt>
            <dd className="text-white font-medium">
              <Link href={`/app/perfil/${req.supplier_id}`} className="hover:underline">
                {supplier?.name}
              </Link>
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Arquiteto</dt>
            <dd className="text-white font-medium">{architect?.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Valor</dt>
            <dd className="text-[#d4b896] font-bold">
              {req.valor_proposto
                ? `R$ ${Number(req.valor_proposto).toLocaleString("pt-BR")}`
                : "—"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Comissão VDO ({commissionPercent}%)</dt>
            <dd className="text-cream/80">
              {commissionValue !== null
                ? `R$ ${commissionValue.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}`
                : "—"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Prazo</dt>
            <dd className="text-cream/80">{req.prazo_dias ? `${req.prazo_dias} dias` : "—"}</dd>
          </div>
        </dl>

        {attachmentLinks.length > 0 && (
          <div className="mt-4 pt-4 border-t border-wood/20">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-cream/70 mb-2">
              Anexo
            </div>
            <div className="flex flex-wrap gap-2">
              {attachmentLinks.map(
                (a) =>
                  a.url && (
                    <a
                      key={a.id}
                      href={a.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs bg-wood/10 border border-wood/25 rounded-lg px-2.5 py-1.5 text-[#d4b896] hover:underline"
                    >
                      📎 {a.name}
                    </a>
                  )
              )}
            </div>
          </div>
        )}
      </Card>

      {isSupplier && req.status === "orcado" && (
        <Card className="mb-4">
          <h2 className="text-sm font-semibold text-white mb-3">Responder com valor e prazo</h2>
          <form action={submitOrcamento} className="space-y-3">
            <input type="hidden" name="id" value={req.id} />
            <div className="flex gap-2">
              <div className="flex-1">
                <Label>Valor (R$)</Label>
                <Input type="number" name="valor_proposto" step="0.01" min="0" required />
              </div>
              <div className="w-28">
                <Label>Prazo (dias)</Label>
                <Input type="number" name="prazo_dias" min="1" />
              </div>
            </div>
            <Button type="submit">Enviar orçamento</Button>
          </form>
        </Card>
      )}

      {isArchitect && req.status === "pendente_aprovacao" && (
        <Card className="mb-4">
          <h2 className="text-sm font-semibold text-white mb-3">Aprovar orçamento</h2>
          <p className="text-xs text-muted mb-3">
            O pagamento ainda não é feito pelo app nesta fase — combine diretamente com o
            fornecedor.
          </p>
          <form action={approveOrcamento}>
            <input type="hidden" name="id" value={req.id} />
            <Button type="submit">Aprovar</Button>
          </form>
        </Card>
      )}

      {isArchitect && req.status === "aprovado" && (
        <Card className="mb-4">
          <h2 className="text-sm font-semibold text-white mb-3">Marcar como concluído</h2>
          <p className="text-xs text-muted mb-3">Quando o serviço combinado estiver finalizado.</p>
          <form action={marcarConcluido}>
            <input type="hidden" name="id" value={req.id} />
            <Button type="submit">Marcar concluído</Button>
          </form>
        </Card>
      )}

      {isArchitect && req.status === "concluido" && !rating && (
        <Card className="mb-4">
          <h2 className="text-sm font-semibold text-white mb-3">Avaliar fornecedor</h2>
          <form action={submitRating} className="space-y-3">
            <input type="hidden" name="business_request_id" value={req.id} />
            <input type="hidden" name="supplier_id" value={req.supplier_id} />
            <input type="hidden" name="back_to" value={`/app/orcamentos/${req.id}`} />
            <div>
              <Label>Nota</Label>
              <StarPicker name="stars" required />
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
          <h2 className="text-sm font-semibold text-white mb-2">Avaliação</h2>
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
