import Link from "next/link";

export function LegalLayout({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/cadastro" className="text-xs text-muted hover:text-cream hover:underline">
          ← Voltar
        </Link>
        <h1 className="font-serif text-3xl text-white mt-4 mb-1">{title}</h1>
        <p className="text-xs text-muted mb-8">Última atualização: {updatedAt}</p>
        <div className="space-y-6 text-sm text-cream/85 leading-relaxed [&_h2]:font-serif [&_h2]:text-lg [&_h2]:text-white [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
          {children}
        </div>
      </div>
    </div>
  );
}
