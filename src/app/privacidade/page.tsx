import { LegalLayout } from "@/components/legal-layout";

export const metadata = { title: "Política de Privacidade · VDO CLUB" };

export default function PrivacidadePage() {
  return (
    <LegalLayout title="Política de Privacidade" updatedAt="Outubro de 2026">
      <section>
        <h2>1. Quem somos</h2>
        <p>
          O VDO CLUB é o controlador dos dados pessoais tratados nesta plataforma, conforme a Lei
          Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD). Esta política explica quais dados
          coletamos, para que os usamos e quais são os seus direitos.
        </p>
      </section>

      <section>
        <h2>2. Dados que coletamos</h2>
        <ul>
          <li>
            <strong>Cadastro:</strong> nome, telefone, e-mail, senha (armazenada de forma
            criptografada), tipo de perfil (arquiteto ou fornecedor) e, para fornecedores, as
            categorias de atuação;
          </li>
          <li>
            <strong>Perfil:</strong> foto de perfil, projetos de portfólio (títulos, descrições,
            fotos e links) que você decidir publicar;
          </li>
          <li>
            <strong>Uso da plataforma:</strong> orçamentos solicitados e respondidos, anexos,
            avaliações e comentários, indicações realizadas;
          </li>
          <li>
            <strong>Aceite dos termos:</strong> data e hora em que você aceitou os Termos de Uso e
            esta Política.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Para que usamos seus dados</h2>
        <ul>
          <li>Criar e gerenciar sua conta, e analisar sua solicitação de entrada no Club;</li>
          <li>Permitir a busca de perfis, a solicitação de orçamentos e o acompanhamento de cada etapa;</li>
          <li>Moderar avaliações e manter a confiança da comunidade;</li>
          <li>Enviar e-mails do sistema, como confirmação de cadastro e redefinição de senha;</li>
          <li>Garantir a segurança da plataforma e cumprir obrigações legais.</li>
        </ul>
      </section>

      <section>
        <h2>4. Com quem compartilhamos</h2>
        <p>
          Seu nome, foto, categorias, portfólio e avaliações aprovadas ficam visíveis para os
          demais membros aprovados do Club. Seu telefone e e-mail não são exibidos publicamente.
          Para operar o serviço, utilizamos prestadores de infraestrutura que tratam dados em nosso
          nome: hospedagem (Vercel), banco de dados e autenticação (Supabase) e envio de e-mails
          (Resend). Não vendemos seus dados.
        </p>
      </section>

      <section>
        <h2>5. Bases legais</h2>
        <p>
          Tratamos seus dados para execução do serviço que você solicitou ao criar a conta, para
          cumprimento de obrigações legais, para o legítimo interesse de manter a plataforma segura
          e, quando aplicável, com o seu consentimento.
        </p>
      </section>

      <section>
        <h2>6. Por quanto tempo guardamos</h2>
        <p>
          Mantemos os dados enquanto sua conta estiver ativa e pelo período necessário para cumprir
          obrigações legais. Ao encerrar a conta, os dados são excluídos ou anonimizados, salvo
          quando a lei exigir a guarda.
        </p>
      </section>

      <section>
        <h2>7. Seus direitos</h2>
        <p>Você pode, a qualquer momento, solicitar:</p>
        <ul>
          <li>Confirmação de que tratamos seus dados e acesso a eles;</li>
          <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
          <li>Anonimização, bloqueio ou eliminação de dados desnecessários;</li>
          <li>Portabilidade e informação sobre compartilhamentos;</li>
          <li>Revogação de consentimento e exclusão da sua conta.</li>
        </ul>
        <p className="mt-2">
          Para exercer seus direitos, entre em contato com o time VDO CLUB pelos canais oficiais
          informados na plataforma.
        </p>
      </section>

      <section>
        <h2>8. Segurança</h2>
        <p>
          Adotamos medidas técnicas para proteger seus dados, como conexão criptografada (HTTPS),
          senhas armazenadas de forma segura e controle de acesso por perfil. Nenhum sistema é
          totalmente imune a falhas, e trabalhamos continuamente para reduzir riscos.
        </p>
      </section>

      <section>
        <h2>9. Alterações</h2>
        <p>
          Esta política pode ser atualizada. Mudanças relevantes serão comunicadas pela plataforma.
        </p>
      </section>
    </LegalLayout>
  );
}
