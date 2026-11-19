import { LegalLayout } from "@/components/legal-layout";
import { LegalContent } from "@/components/legal-content";
import { getLegalDocument } from "@/lib/legal";

export const metadata = { title: "Política de Privacidade · VDO CLUB" };
export const dynamic = "force-dynamic";

export default async function PrivacidadePage() {
  const doc = await getLegalDocument("privacidade");
  return (
    <LegalLayout title="Política de Privacidade" updatedAt={doc.updatedLabel}>
      <LegalContent content={doc.content} />
    </LegalLayout>
  );
}
