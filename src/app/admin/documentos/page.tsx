import Link from "next/link";
import { getSessionProfile } from "@/lib/auth";
import { resetLegalDocument, saveLegalDocument } from "@/lib/actions/legal";
import { LEGAL_DEFAULTS, LEGAL_TITLES, type LegalSlug } from "@/lib/legal-defaults";
import { formatUpdatedAt } from "@/lib/legal";
import { Badge, Button, Card, ErrorNote } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";

export default async function DocumentosPage({
  searchParams,
}: {
  searchParams: Promise<{ doc?: string; error?: string; saved?: string; reset?: string }>;
}) {
  const { doc, error, saved, reset } = await searchParams;
  const slug: LegalSlug = doc === "privacidade" ? "privacidade" : "termos";

  const session = await getSessionProfile();
  if (!session) return null;

  const { data: row } = await session.supabase
    .from("legal_documents")
    .select("content, updated_at")
    .eq("slug", slug)
    .maybeSingle();

  const content = row?.content ?? LEGAL_DEFAULTS[slug];
  const isCustom = Boolean(row);

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-2xl text-white mb-1">Documentos legais</h1>
      <p className="text-sm text-muted mb-6">
        Edite os textos que aparecem para os usuários no cadastro, no login e no perfil.
      </p>

      <div className="flex gap-2 mb-6">
        {(["termos", "privacidade"] as const).map((s) => (
          <Link
            key={s}
            href={`/admin/documentos?doc=${s}`}
            className={`text-sm font-medium px-4 py-2 rounded-lg border ${
              s === slug
                ? "bg-[#d4b896]/20 border-[#d4b896]/40 text-[#d4b896]"
                : "bg-wood/10 border-wood/25 text-muted hover:text-cream"
            }`}
          >
            {LEGAL_TITLES[s]}
          </Link>
        ))}
      </div>

      <ErrorNote message={error} />
      {saved && (
        <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/30 rounded-lg px-3.5 py-2.5 mb-4">
          Alterações salvas. O texto já está publicado.
        </p>
      )}
      {reset && (
        <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/30 rounded-lg px-3.5 py-2.5 mb-4">
          Texto original restaurado.
        </p>
      )}

      <Card className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="text-xs text-muted">
            {isCustom && row
              ? `Versão editada · atualizada em ${formatUpdatedAt(row.updated_at)}`
              : "Texto original do sistema (ainda não editado)"}
          </div>
          <Link
            href={`/${slug}`}
            target="_blank"
            className="text-xs text-[#d4b896] font-medium hover:underline"
          >
            Ver página pública ↗
          </Link>
        </div>

        <form action={saveLegalDocument} className="space-y-3">
          <input type="hidden" name="slug" value={slug} />
          <textarea
            name="content"
            defaultValue={content}
            rows={26}
            spellCheck
            className="w-full bg-white border border-line rounded-lg px-3.5 py-3 text-sm text-ink leading-relaxed font-mono focus:outline-none focus:border-wood-light"
          />
          <div className="flex flex-wrap items-center gap-2">
            <SubmitButton pendingText="Salvando...">Salvar alterações</SubmitButton>
          </div>
        </form>

        {isCustom && (
          <form action={resetLegalDocument} className="mt-3">
            <input type="hidden" name="slug" value={slug} />
            <Button type="submit" variant="danger">
              Restaurar texto original
            </Button>
          </form>
        )}
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold text-white">Como formatar</h2>
          <Badge>guia rápido</Badge>
        </div>
        <ul className="text-xs text-cream/80 space-y-1.5 leading-relaxed">
          <li>
            <code className="text-[#d4b896]">## Título</code> cria um subtítulo (ex.:{" "}
            <code className="text-[#d4b896]">## 1. Sobre o VDO CLUB</code>)
          </li>
          <li>
            <code className="text-[#d4b896]">- item</code> cria uma lista (um item por linha)
          </li>
          <li>
            <code className="text-[#d4b896]">**texto**</code> deixa o texto em negrito
          </li>
          <li>Uma linha em branco separa um parágrafo do outro.</li>
          <li>A data de “Última atualização” da página pública é preenchida sozinha ao salvar.</li>
        </ul>
      </Card>
    </div>
  );
}
