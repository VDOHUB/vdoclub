-- VDO CLUB — Fase 7: Termos de Uso e Política de Privacidade editáveis pelo admin.
-- Enquanto não houver linha para um documento, o app usa o texto padrão do código.

create table public.legal_documents (
  slug text primary key check (slug in ('termos', 'privacidade')),
  content text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

alter table public.legal_documents enable row level security;

-- Páginas públicas (inclusive para quem ainda não tem conta).
create policy "legal_documents_select_all" on public.legal_documents
  for select using (true);
create policy "legal_documents_admin_write" on public.legal_documents
  for all using (public.is_admin()) with check (public.is_admin());
