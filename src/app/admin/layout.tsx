import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { signOut } from "@/lib/actions/auth";
import { MobileTabBar } from "@/components/mobile-tab-bar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionProfile();
  if (!session || session.profile.role !== "admin") redirect("/login");

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-wood/25 bg-black/20">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin/aprovacoes" className="font-serif text-white text-sm font-bold">
              VDO CLUB · Admin
            </Link>
            <nav className="hidden sm:flex items-center gap-6 text-sm text-muted">
              <Link href="/admin/aprovacoes" className="hover:text-cream transition-colors">
                Aprovações
              </Link>
              <Link href="/admin/avaliacoes" className="hover:text-cream transition-colors">
                Avaliações
              </Link>
              <Link href="/admin/categorias" className="hover:text-cream transition-colors">
                Categorias
              </Link>
              <Link href="/admin/indicacoes" className="hover:text-cream transition-colors">
                Indicações
              </Link>
              <Link href="/app/orcamentos" className="hover:text-cream transition-colors">
                Ver como membro
              </Link>
            </nav>
          </div>
          <form action={signOut}>
            <button className="text-xs text-muted hover:text-cream transition-colors">Sair</button>
          </form>
        </div>
        <nav className="sm:hidden flex items-center gap-4 px-6 h-11 overflow-x-auto text-xs text-muted border-t border-wood/15">
          <Link href="/admin/aprovacoes" className="whitespace-nowrap hover:text-cream transition-colors">
            Aprovações
          </Link>
          <Link href="/admin/avaliacoes" className="whitespace-nowrap hover:text-cream transition-colors">
            Avaliações
          </Link>
          <Link href="/admin/categorias" className="whitespace-nowrap hover:text-cream transition-colors">
            Categorias
          </Link>
          <Link href="/admin/indicacoes" className="whitespace-nowrap hover:text-cream transition-colors">
            Indicações
          </Link>
          <Link href="/app/orcamentos" className="whitespace-nowrap hover:text-cream transition-colors">
            Ver como membro
          </Link>
        </nav>
      </header>
      <main className="flex-1 pb-20 sm:pb-0">
        <div className="max-w-5xl mx-auto px-6 py-10 w-full">{children}</div>
      </main>
      <MobileTabBar isAdmin />
    </div>
  );
}
