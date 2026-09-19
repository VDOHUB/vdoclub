import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { signOut } from "@/lib/actions/auth";
import { MobileTabBar } from "@/components/mobile-tab-bar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionProfile();
  if (!session) redirect("/login");

  const { profile } = session;

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-wood/25 bg-black/20">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/app" className="font-serif text-white text-sm font-bold">
              VDO CLUB
            </Link>
            <nav className="hidden sm:flex items-center gap-6 text-sm text-muted">
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
            <Link
              href="/app/busca"
              aria-label="Buscar"
              className="text-muted hover:text-cream transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </Link>
            <span className="hidden sm:inline text-xs text-muted">{profile.name}</span>
            <form action={signOut}>
              <button className="text-xs text-muted hover:text-cream transition-colors">Sair</button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 pb-20 sm:pb-0">
        <div className="max-w-5xl mx-auto px-6 py-10 w-full">{children}</div>
      </main>
      <MobileTabBar isAdmin={profile.role === "admin"} />
    </div>
  );
}
