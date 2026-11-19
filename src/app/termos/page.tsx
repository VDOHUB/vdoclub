import { LegalLayout } from "@/components/legal-layout";
import { LegalContent } from "@/components/legal-content";
import { getLegalDocument } from "@/lib/legal";

export const metadata = { title: "Termos de Uso · VDO CLUB" };
export const dynamic = "force-dynamic";

export default async function TermosPage() {
  const doc = await getLegalDocument("termos");
  return (
    <LegalLayout title="Termos de Uso" updatedAt={doc.updatedLabel}>
      <LegalContent content={doc.content} />
    </LegalLayout>
  );
}
