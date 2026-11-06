-- VDO CLUB — Fase 6: upload direto do navegador para o Storage (sem passar pela Vercel,
-- que recusa corpos acima de 4,5 MB). Arquivos de orçamento passam a ser enviados em
-- {uid}/... ANTES de o orçamento existir; o acesso dos participantes é resolvido pela
-- tabela business_request_attachments (mantendo as políticas antigas {request_id}/...).

-- Quem enviou pode enviar, ler e apagar o que está na própria pasta.
create policy "orcamento_anexos_insert_own_folder" on storage.objects
  for insert with check (
    bucket_id = 'orcamento-anexos' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "orcamento_anexos_select_own_folder" on storage.objects
  for select using (
    bucket_id = 'orcamento-anexos' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "orcamento_anexos_delete_own_folder" on storage.objects
  for delete using (
    bucket_id = 'orcamento-anexos' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Participantes do orçamento (e admin) leem os anexos registrados na tabela.
create policy "orcamento_anexos_select_via_attachments" on storage.objects
  for select using (
    bucket_id = 'orcamento-anexos'
    and exists (
      select 1
      from public.business_request_attachments a
      join public.business_requests br on br.id = a.business_request_id
      where a.storage_path = name
        and (br.architect_id = auth.uid() or br.supplier_id = auth.uid() or public.is_admin())
    )
  );

-- Limites por bucket (aplicados pelo próprio Storage, não dá para burlar pelo cliente).
update storage.buckets set file_size_limit = 20 * 1024 * 1024 where id = 'orcamento-anexos';

update storage.buckets
set file_size_limit = 20 * 1024 * 1024,
    allowed_mime_types = array[
      'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif', 'image/avif'
    ]
where id = 'portfolio';

update storage.buckets
set file_size_limit = 10 * 1024 * 1024,
    allowed_mime_types = array[
      'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif', 'image/avif'
    ]
where id = 'avatars';

update storage.buckets
set file_size_limit = 5 * 1024 * 1024,
    allowed_mime_types = array[
      'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif'
    ]
where id = 'sponsors';
