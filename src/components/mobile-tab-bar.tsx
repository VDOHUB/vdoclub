"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const icons = {
  home: (
    <path d="M3 12l9-9 9 9M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
  ),
  suppliers: (
    <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 11h.01M15 11h.01M9 15h.01M15 15h.01" />
  ),
  requests: (
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M9 13h6 M9 17h6" />
  ),
  search: <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35" />,
  profile: <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />,
};

const tabs: { href: string; label: string; icon: keyof typeof icons }[] = [
  { href: "/app", label: "Home", icon: "home" },
  { href: "/app/fornecedores", label: "Fornecedores", icon: "suppliers" },
  { href: "/app/orcamentos", label: "Orçamentos", icon: "requests" },
  { href: "/app/busca", label: "Buscar", icon: "search" },
  { href: "/app/perfil", label: "Perfil", icon: "profile" },
];

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#150b03] border-t border-wood/25 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-around">
        {tabs.map((tab) => {
          const active =
            tab.href === "/app" ? pathname === "/app" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5"
            >
              <svg
                viewBox="0 0 24 24"
                className={`w-5 h-5 ${active ? "stroke-[#d4b896]" : "stroke-muted"}`}
                fill="none"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {icons[tab.icon]}
              </svg>
              <span className={`text-[10px] font-medium ${active ? "text-[#d4b896]" : "text-muted"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
