-- VDO CLUB — Fase 2: portfólio, orçamento detalhado (título/descrição/anexos)

alter table public.business_requests
  add column title text not null default '',
  add column description text;

-- ── PORTFÓLIO ───────────────────────────────────────────────────────

create table public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  link_url text,
  photo_paths text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index on public.portfolio_items (profile_id);

alter table public.portfolio_items enable row level security;

create policy "portfolio_items_select_all" on public.portfolio_items
  for select using (true);
create policy "portfolio_items_manage_own" on public.portfolio_items
  for all using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());

-- ── ANEXOS DE ORÇAMENTO ─────────────────────────────────────────────

create table public.business_request_attachments (
  id uuid primary key default gen_random_uuid(),
  business_request_id uuid not null references public.business_requests (id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create index on public.business_request_attachments (business_request_id);

alter table public.business_request_attachments enable row level security;

create policy "attachments_select_participants" on public.business_request_attachments
  for select using (
    exists (
      select 1 from public.business_requests br
      where br.id = business_request_id
        and (br.architect_id = auth.uid() or br.supplier_id = auth.uid() or public.is_admin())
    )
  );
create policy "attachments_insert_architect" on public.business_request_attachments
  for insert with check (
    exists (
      select 1 from public.business_requests br
      where br.id = business_request_id and br.architect_id = auth.uid()
    )
  );

-- ── STORAGE BUCKETS ─────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('orcamento-anexos', 'orcamento-anexos', false)
on conflict (id) do nothing;

create policy "portfolio_bucket_select_public" on storage.objects
  for select using (bucket_id = 'portfolio');
create policy "portfolio_bucket_write_own" on storage.objects
  for insert with check (
    bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "portfolio_bucket_delete_own" on storage.objects
  for delete using (
    bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "orcamento_anexos_select_participants" on storage.objects
  for select using (
    bucket_id = 'orcamento-anexos'
    and exists (
      select 1 from public.business_requests br
      where br.id::text = (storage.foldername(name))[1]
        and (br.architect_id = auth.uid() or br.supplier_id = auth.uid() or public.is_admin())
    )
  );
create policy "orcamento_anexos_insert_architect" on storage.objects
  for insert with check (
    bucket_id = 'orcamento-anexos'
    and exists (
      select 1 from public.business_requests br
      where br.id::text = (storage.foldername(name))[1] and br.architect_id = auth.uid()
    )
  );
