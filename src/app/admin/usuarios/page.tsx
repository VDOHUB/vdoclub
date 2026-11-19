import Link from "next/link";
import { getSessionProfile } from "@/lib/auth";
import { Avatar, Badge, Card, ErrorNote } from "@/components/ui";
import type { ProfileRole, ProfileStatus } from "@/lib/supabase/types";

const roleLabel: Record<ProfileRole, string> = {
  architect: "Arquiteto",
  supplier: "Fornecedor",
  admin: "Admin",
};

const statusLabel: Record<ProfileStatus, { text: string; tone: "green" | "yellow" | "red" }> = {
  approved: { text: "Aprovado", tone: "green" },
  pending_review: { text: "Em análise", tone: "yellow" },
  rejected: { text: "Rejeitado", tone: "red" },
};

const filters: { key: "todos" | ProfileRole; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "architect", label: "Arquitetos" },
  { key: "supplier", label: "Fornecedores" },
  { key: "admin", label: "Admins" },
];

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const session = await getSessionProfile();
  if (!session) return null;

  const { data: users, error } = await session.supabase.rpc("admin_list_users");
  const all = users ?? [];

  const counts = {
    todos: all.length,
    architect: all.filter((u) => u.role === "architect").length,
    supplier: all.filter((u) => u.role === "supplier").length,
    admin: all.filter((u) => u.role === "admin").length,
  };

  const active = filters.find((f) => f.key === role)?.key ?? "todos";
  const visible = active === "todos" ? all : all.filter((u) => u.role === active);

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-2xl text-white mb-1">Usuários</h1>
      <p className="text-sm text-muted mb-6">Todas as contas cadastradas no VDO CLUB.</p>

      <ErrorNote message={error?.message} />

      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <Link
            key={f.key}
            href={f.key === "todos" ? "/admin/usuarios" : `/admin/usuarios?role=${f.key}`}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg border ${
              active === f.key
                ? "bg-[#d4b896]/20 border-[#d4b896]/40 text-[#d4b896]"
                : "bg-wood/10 border-wood/25 text-muted hover:text-cream"
            }`}
          >
            {f.label} ({counts[f.key]})
          </Link>
        ))}
      </div>

      <div className="space-y-2">
        {visible.map((u) => (
          <Card key={u.id} className="py-3 sm:py-4">
            <div className="flex items-start gap-3">
              <Avatar url={u.avatar_url} name={u.name || u.email} size={40} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-white">{u.name || "(sem nome)"}</span>
                  <Badge>{roleLabel[u.role]}</Badge>
                  <Badge tone={statusLabel[u.status].tone}>{statusLabel[u.status].text}</Badge>
                </div>
                <div className="text-xs text-cream/80 mt-1 break-all">{u.email}</div>
                <div className="text-xs text-muted mt-0.5">
                  {u.phone || "sem telefone"} · cadastrado em {formatDate(u.created_at)} · último acesso{" "}
                  {formatDate(u.last_sign_in_at)}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {visible.length === 0 && !error && (
        <p className="text-sm text-muted">Nenhum usuário nessa categoria.</p>
      )}
    </div>
  );
}
