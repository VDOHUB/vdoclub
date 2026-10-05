-- VDO CLUB — Fase 5: heartbeat anti-pausa + patrocinadores

-- ── HEARTBEAT ───────────────────────────────────────────────────────
-- Cada ping faz uma ESCRITA real no banco (e deixa rastro para conferirmos
-- que o cron está de fato rodando). Mantém só os últimos 200 registros.

create table public.keep_alive_log (
  id bigint generated always as identity primary key,
  pinged_at timestamptz not null default now()
);

alter table public.keep_alive_log enable row level security;

create or replace function public.keep_alive_ping()
returns timestamptz
language plpgsql security definer set search_path = public
as $$
declare
  v_now timestamptz := now();
begin
  insert into public.keep_alive_log (pinged_at) values (v_now);
  delete from public.keep_alive_log
  where id <= (select max(id) from public.keep_alive_log) - 200;
  return v_now;
end;
$$;

grant execute on function public.keep_alive_ping() to anon, authenticated;

-- ── PATROCINADORES ──────────────────────────────────────────────────

create table public.sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text not null,
  logo_path text,
  link_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.sponsors enable row level security;

create policy "sponsors_select_all" on public.sponsors
  for select using (true);
create policy "sponsors_admin_write" on public.sponsors
  for all using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('sponsors', 'sponsors', true)
on conflict (id) do nothing;

create policy "sponsors_bucket_select_public" on storage.objects
  for select using (bucket_id = 'sponsors');
create policy "sponsors_bucket_admin_insert" on storage.objects
  for insert with check (bucket_id = 'sponsors' and public.is_admin());
create policy "sponsors_bucket_admin_update" on storage.objects
  for update using (bucket_id = 'sponsors' and public.is_admin());
create policy "sponsors_bucket_admin_delete" on storage.objects
  for delete using (bucket_id = 'sponsors' and public.is_admin());
