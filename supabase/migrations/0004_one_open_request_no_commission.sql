-- VDO CLUB — Fase 4: um orçamento em aberto por vez + remoção da comissão

-- Só pode existir 1 orçamento em andamento por par (arquiteto, fornecedor).
-- Trigger (e não unique index) para não quebrar com duplicatas já existentes;
-- o advisory lock serializa requisições simultâneas do mesmo par.
create or replace function public.prevent_duplicate_open_request()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  perform pg_advisory_xact_lock(
    hashtextextended(new.architect_id::text || ':' || new.supplier_id::text, 0)
  );

  if exists (
    select 1 from public.business_requests
    where architect_id = new.architect_id
      and supplier_id = new.supplier_id
      and status in ('orcado', 'pendente_aprovacao', 'aprovado')
  ) then
    raise exception 'Você já tem um orçamento em andamento com este fornecedor.';
  end if;

  return new;
end;
$$;

create trigger business_requests_one_open_per_supplier
  before insert on public.business_requests
  for each row execute function public.prevent_duplicate_open_request();

-- Comissão removida do produto.
drop table if exists public.app_settings;
