import { createClient } from "@supabase/supabase-js";
import { LEGAL_DEFAULTS, LEGAL_DEFAULT_DATE, type LegalSlug } from "@/lib/legal-defaults";

export type LegalDocument = { content: string; updatedLabel: string; isCustom: boolean };

export function formatUpdatedAt(iso: string): string {
  const label = new Date(iso).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

// Leitura pública (as páginas /termos e /privacidade abrem sem login). Se o banco estiver
// fora do ar ou ainda não houver versão salva, cai no texto padrão — a página nunca quebra.
export async function getLegalDocument(slug: LegalSlug): Promise<LegalDocument> {
  const fallback: LegalDocument = {
    content: LEGAL_DEFAULTS[slug],
    updatedLabel: LEGAL_DEFAULT_DATE,
    isCustom: false,
  };

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from("legal_documents")
      .select("content, updated_at")
      .eq("slug", slug)
      .maybeSingle();

    if (!data?.content?.trim()) return fallback;
    return { content: data.content, updatedLabel: formatUpdatedAt(data.updated_at), isCustom: true };
  } catch {
    return fallback;
  }
}
