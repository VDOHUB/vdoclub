-- VDO CLUB — Fase 3: avatar, config de comissão, fluxo em 5 etapas,
-- avaliação sem orçamento, indicação por arquiteto

-- ── PROFILES: avatar + indicação ───────────────────────────────────

alter table public.profiles
  add column avatar_url text,
  add column referred_by uuid references public.profiles (id);

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars_select_public" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "avatars_write_own" on storage.objects
  for insert with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_update_own" on storage.objects
  for update using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_delete_own" on storage.objects
  for delete using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ── CONFIGURAÇÃO ÚNICA DO CLUB ──────────────────────────────────────

create table public.app_settings (
  id text primary key default 'default',
  commission_percent numeric not null default 10,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (id) values ('default');

alter table public.app_settings enable row level security;

create policy "app_settings_select_all" on public.app_settings
  for select using (true);
create policy "app_settings_admin_update" on public.app_settings
  for update using (public.is_admin()) with check (public.is_admin());

-- ── BUSINESS_REQUESTS: prazo + novos timestamps ─────────────────────

alter table public.business_requests
  add column prazo_dias integer,
  add column aprovado_at timestamptz,
  add column avaliado_at timestamptz;

alter table public.business_requests rename column orcamento_at to pendente_aprovacao_at;
alter table public.business_requests rename column fechado_at to concluido_at;

-- ── ENUM business_status: 3 -> 5 etapas ─────────────────────────────

alter table public.business_requests alter column status type text;
alter table public.business_requests alter column status drop default;

update public.business_requests set status = case status
  when 'indicou' then 'orcado'
  when 'orcamento' then 'pendente_aprovacao'
  when 'fechado' then 'concluido'
  else status
end;

drop type public.business_status;

create type public.business_status as enum (
  'orcado', 'pendente_aprovacao', 'aprovado', 'concluido', 'avaliado'
);

alter table public.business_requests
  alter column status type business_status using status::business_status,
  alter column status set default 'orcado';

-- ── RATINGS: avaliação sem orçamento ────────────────────────────────

alter table public.ratings alter column business_request_id drop not null;

-- ── REFERRAL_LINKS: passa a ser por arquiteto, sem auto-aprovação ──

alter table public.referral_links
  add column invited_name text,
  add column invited_phone text,
  add column invited_activity text;

drop policy "referral_links_admin_all" on public.referral_links;

create policy "referral_links_select_own_or_admin" on public.referral_links
  for select using (created_by = auth.uid() or public.is_admin());
create policy "referral_links_insert_own" on public.referral_links
  for insert with check (created_by = auth.uid());
create policy "referral_links_update_own_or_admin" on public.referral_links
  for update using (created_by = auth.uid() or public.is_admin());

-- handle_new_user: referral agora só marca "indicado por", não aprova mais sozinho
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_role profile_role;
  v_ref_token text;
  v_referred_by uuid;
  v_category_ids uuid[];
  v_cat uuid;
begin
  v_role := coalesce((new.raw_user_meta_data ->> 'role')::profile_role, 'architect');
  v_ref_token := new.raw_user_meta_data ->> 'referral_token';

  if v_ref_token is not null then
    select created_by into v_referred_by
    from public.referral_links
    where token = v_ref_token and active = true;

    if v_referred_by is not null then
      update public.referral_links set uses_count = uses_count + 1 where token = v_ref_token;
    end if;
  end if;

  insert into public.profiles (id, role, name, phone, status, referral_token_used, referred_by)
  values (
    new.id,
    v_role,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    'pending_review',
    v_ref_token,
    v_referred_by
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
