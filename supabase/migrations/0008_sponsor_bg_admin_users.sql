-- VDO CLUB — Fase 8: cor de fundo dos logos + lista de usuários para o admin

alter table public.sponsors
  add column bg_color text not null default '#fffaf3';

-- Lista de usuários com e-mail e último acesso (dados que ficam em auth.users, fora do alcance
-- do cliente). Só administradores conseguem executar.
create or replace function public.admin_list_users()
returns table (
  id uuid,
  name text,
  email text,
  phone text,
  role profile_role,
  status profile_status,
  avatar_url text,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
language plpgsql security definer set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    raise exception 'Acesso restrito a administradores.';
  end if;

  return query
  select p.id, p.name, u.email::text, p.phone, p.role, p.status, p.avatar_url,
         p.created_at, u.last_sign_in_at
  from public.profiles p
  join auth.users u on u.id = p.id
  order by p.created_at desc;
end;
$$;

revoke all on function public.admin_list_users() from public, anon;
grant execute on function public.admin_list_users() to authenticated;
