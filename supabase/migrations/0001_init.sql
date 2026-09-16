-- VDO CLUB — schema inicial (Fase 1)

create extension if not exists "pgcrypto";

create type profile_role as enum ('architect', 'supplier', 'admin');
create type profile_status as enum ('pending_review', 'approved', 'rejected');
create type business_status as enum ('indicou', 'orcamento', 'fechado');
create type rating_status as enum ('pending_review', 'approved', 'rejected');

-- ── TABLES ──────────────────────────────────────────────────────────

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role profile_role not null default 'architect',
  name text not null default '',
  phone text not null default '',
  status profile_status not null default 'pending_review',
  approved_by uuid references public.profiles (id),
  approved_at timestamptz,
  referral_token_used text,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  active boolean not null default true,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.supplier_categories (
  supplier_id uuid not null references public.profiles (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  primary key (supplier_id, category_id)
);

create table public.referral_links (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  created_by uuid not null references public.profiles (id),
  active boolean not null default true,
  uses_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.business_requests (
  id uuid primary key default gen_random_uuid(),
  architect_id uuid not null references public.profiles (id),
  supplier_id uuid not null references public.profiles (id),
  category_id uuid not null references public.categories (id),
  status business_status not null default 'indicou',
  valor_proposto numeric(12, 2),
  created_at timestamptz not null default now(),
  orcamento_at timestamptz,
  fechado_at timestamptz
);

create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  business_request_id uuid not null unique references public.business_requests (id),
  architect_id uuid not null references public.profiles (id),
  supplier_id uuid not null references public.profiles (id),
  stars smallint not null check (stars between 1 and 5),
  comment text,
  status rating_status not null default 'pending_review',
  reviewed_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index on public.supplier_categories (category_id);
create index on public.business_requests (architect_id);
create index on public.business_requests (supplier_id);
create index on public.ratings (supplier_id, status);

-- ── HELPERS ─────────────────────────────────────────────────────────

create or replace function public.is_admin()
returns boolean
language sql security definer set search_path = public stable
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ── NEW USER TRIGGER ────────────────────────────────────────────────
-- Cria o profile a partir dos metadados enviados no signUp (name, phone, role,
-- referral_token opcional, category_ids opcional p/ fornecedor). Cadastro via
-- link de indicação válido entra direto como 'approved'.

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_role profile_role;
  v_status profile_status := 'pending_review';
  v_ref_token text;
  v_category_ids uuid[];
  v_cat uuid;
begin
  v_role := coalesce((new.raw_user_meta_data ->> 'role')::profile_role, 'architect');
  v_ref_token := new.raw_user_meta_data ->> 'referral_token';

  if v_ref_token is not null and exists (
    select 1 from public.referral_links where token = v_ref_token and active = true
  ) then
    v_status := 'approved';
    update public.referral_links set uses_count = uses_count + 1 where token = v_ref_token;
  end if;

  insert into public.profiles (id, role, name, phone, status, referral_token_used, approved_at)
  values (
    new.id,
    v_role,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    v_status,
    case when v_status = 'approved' then v_ref_token else null end,
    case when v_status = 'approved' then now() else null end
  );

  if v_role = 'supplier' and (new.raw_user_meta_data ? 'category_ids') then
    v_category_ids := array(
      select jsonb_array_elements_text(new.raw_user_meta_data -> 'category_ids')
    )::uuid[];

    foreach v_cat in array v_category_ids loop
      insert into public.supplier_categories (supplier_id, category_id)
      values (new.id, v_cat)
      on conflict do nothing;
    end loop;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Impede que um usuário comum eleve o próprio papel/status via update direto na tabela.
create or replace function public.prevent_profile_privilege_escalation()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    new.role := old.role;
    new.status := old.status;
    new.approved_by := old.approved_by;
    new.approved_at := old.approved_at;
  end if;
  return new;
end;
$$;

create trigger profiles_guard_privileged_fields
  before update on public.profiles
  for each row execute function public.prevent_profile_privilege_escalation();

-- ── RLS ─────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.supplier_categories enable row level security;
alter table public.referral_links enable row level security;
alter table public.business_requests enable row level security;
alter table public.ratings enable row level security;

-- profiles
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());
create policy "profiles_select_admin" on public.profiles
  for select using (public.is_admin());
create policy "profiles_select_public_suppliers" on public.profiles
  for select using (role = 'supplier' and status = 'approved');
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- categories
create policy "categories_select_all" on public.categories
  for select using (true);
create policy "categories_admin_write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- supplier_categories
create policy "supplier_categories_select_all" on public.supplier_categories
  for select using (true);
create policy "supplier_categories_manage_own" on public.supplier_categories
  for all using (supplier_id = auth.uid() or public.is_admin())
  with check (supplier_id = auth.uid() or public.is_admin());

-- referral_links (uso interno do admin; leitura pública do token acontece via RPC/trigger, não via select direto)
create policy "referral_links_admin_all" on public.referral_links
  for all using (public.is_admin()) with check (public.is_admin());

-- business_requests
create policy "business_requests_select_participants" on public.business_requests
  for select using (architect_id = auth.uid() or supplier_id = auth.uid() or public.is_admin());
create policy "business_requests_insert_architect" on public.business_requests
  for insert with check (architect_id = auth.uid());
create policy "business_requests_update_participants" on public.business_requests
  for update using (architect_id = auth.uid() or supplier_id = auth.uid() or public.is_admin());

-- ratings
create policy "ratings_select_approved_or_own" on public.ratings
  for select using (
    status = 'approved'
    or architect_id = auth.uid()
    or supplier_id = auth.uid()
    or public.is_admin()
  );
create policy "ratings_insert_architect" on public.ratings
  for insert with check (architect_id = auth.uid());
create policy "ratings_update_admin" on public.ratings
  for update using (public.is_admin());

-- ── SEED: categorias da reunião de kickoff ─────────────────────────

insert into public.categories (name, slug) values
  ('Gesso', 'gesso'),
  ('Marcenaria', 'marcenaria'),
  ('Automação', 'automacao'),
  ('Cortinas', 'cortinas'),
  ('Papel de Parede', 'papel-de-parede'),
  ('Madeira', 'madeira'),
  ('Carpintaria', 'carpintaria');
