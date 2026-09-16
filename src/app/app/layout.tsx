import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { signOut } from "@/lib/actions/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionProfile();
  if (!session) redirect("/login");

  const { profile } = session;

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-wood/25 bg-black/20">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/app/orcamentos" className="font-serif text-white text-sm font-bold">
              VDO CLUB
            </Link>
            <nav className="flex items-center gap-6 text-sm text-muted">
              <Link href="/app/fornecedores" className="hover:text-cream transition-colors">
                Fornecedores
              </Link>
              <Link href="/app/orcamentos" className="hover:text-cream transition-colors">
                Orçamentos
              </Link>
              <Link href="/app/perfil" className="hover:text-cream transition-colors">
                Perfil
              </Link>
              {profile.role === "admin" && (
                <Link href="/admin/aprovacoes" className="hover:text-cream transition-colors">
                  Admin
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted">{profile.name}</span>
            <form action={signOut}>
              <button className="text-xs text-muted hover:text-cream transition-colors">Sair</button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-6 py-10 w-full">{children}</div>
      </main>
    </div>
  );
}
