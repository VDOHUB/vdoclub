# VDO CLUB

Web App do VDO CLUB — plataforma que conecta arquitetos e fornecedores (cadastro com aprovação,
categorias, avaliações e CRM de orçamentos). Fase 1 do projeto (sem pagamento integrado).

A proposta comercial original está em [`/proposta`](./proposta/index.html).

## Stack

- Next.js (App Router, TypeScript) + Tailwind CSS
- Supabase (Auth + Postgres + RLS)
- Resend (e-mail transacional, via SMTP customizado do Supabase Auth)
- Deploy: Vercel + GitHub

## Setup local

1. Copie `.env.local.example` para `.env.local` e preencha com os dados do seu projeto Supabase:

   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

2. Rode a migration em `supabase/migrations/0001_init.sql` no SQL Editor do seu projeto Supabase
   (ou via `supabase db push` se estiver usando o CLI). Ela cria as tabelas, RLS, triggers e já
   semeia as 7 categorias combinadas na reunião de kickoff.

3. Configure o e-mail de confirmação de cadastro:
   - Supabase → Authentication → Emails → habilite "Confirm email".
   - Supabase → Project Settings → Auth → SMTP Settings → configure como custom SMTP usando as
     credenciais do Resend (host `smtp.resend.com`, porta 465, usuário `resend`, senha = sua API
     key do Resend) e o domínio já verificado `vdohub.viverdeobra.com` como remetente.
   - Em Authentication → URL Configuration, adicione `NEXT_PUBLIC_SITE_URL/api/auth/callback`
     como Redirect URL permitida.

4. Crie o primeiro admin manualmente (não existe fluxo de auto-cadastro como admin, por segurança):
   - Cadastre-se normalmente como Arquiteto pelo app.
   - No SQL Editor do Supabase, rode:
     ```sql
     update public.profiles set role = 'admin', status = 'approved' where id = '<seu-user-id>';
     ```
   - O `user-id` está em Authentication → Users no dashboard do Supabase.

5. Instale as dependências e rode o projeto:

   ```bash
   npm install
   npm run dev
   ```

## Fluxo implementado (Fase 1)

- Login com e-mail/senha.
- Cadastro com escolha de perfil (Arquiteto/Fornecedor), confirmação por e-mail e aprovação por
  admin — exceto quando o cadastro vem de um link de indicação (`/cadastro?ref=TOKEN`), que aprova
  automaticamente.
- Fornecedor pode se cadastrar em múltiplas categorias.
- Diretório de fornecedores com filtro por categoria e nota média (apenas avaliações aprovadas).
- CRM simples: arquiteto solicita orçamento → fornecedor responde com valor → arquiteto marca como
  fechado (sem pagamento no app nesta fase).
- Avaliação por estrelas (1–5) + comentário após negócio fechado, sujeita à aprovação de admin.
- Painel admin: aprovações de cadastro, aprovações de avaliação, gestão de categorias e geração de
  links de indicação.

## Deploy

1. Suba o repositório no GitHub.
2. Importe o projeto na Vercel, configure as mesmas variáveis de ambiente do `.env.local`
   (trocando `NEXT_PUBLIC_SITE_URL` pelo domínio de produção).
3. Atualize a Redirect URL de confirmação de e-mail no Supabase para o domínio de produção.
