import { LegalLayout } from "@/components/legal-layout";

export const metadata = { title: "Termos de Uso · VDO CLUB" };

export default function TermosPage() {
  return (
    <LegalLayout title="Termos de Uso" updatedAt="Outubro de 2026">
      <section>
        <h2>1. Sobre o VDO CLUB</h2>
        <p>
          O VDO CLUB é uma plataforma fechada que conecta arquitetos e fornecedores, reunindo
          cadastro, reputação, categorias e o fluxo de solicitação de orçamentos entre as partes.
          Ao criar uma conta, você declara ter lido e concordado com estes Termos.
        </p>
      </section>

      <section>
        <h2>2. Cadastro e aprovação</h2>
        <ul>
          <li>As informações fornecidas no cadastro devem ser verdadeiras, completas e atualizadas.</li>
          <li>
            Todo cadastro passa por análise e aprovação do time VDO CLUB, que pode aprovar ou
            recusar solicitações a seu critério, sem obrigação de justificar a decisão.
          </li>
          <li>Você é responsável por manter a confidencialidade da sua senha e por toda atividade realizada na sua conta.</li>
        </ul>
      </section>

      <section>
        <h2>3. Orçamentos e negociações</h2>
        <p>
          A plataforma organiza a solicitação, a resposta e o acompanhamento de orçamentos entre
          arquitetos e fornecedores. A negociação, o pagamento e a execução dos serviços são de
          responsabilidade exclusiva das partes envolvidas. O VDO CLUB não é parte dos contratos
          firmados entre arquitetos e fornecedores e não garante a qualidade, o prazo ou o
          resultado de qualquer serviço.
        </p>
      </section>

      <section>
        <h2>4. Avaliações</h2>
        <ul>
          <li>As avaliações devem refletir a experiência real do usuário, de forma respeitosa e verdadeira.</li>
          <li>Todas as avaliações e comentários passam por moderação antes de serem publicados.</li>
          <li>
            O VDO CLUB pode recusar ou remover conteúdo ofensivo, falso, discriminatório ou que
            viole direitos de terceiros.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Conteúdo enviado por você</h2>
        <p>
          Fotos, descrições, links e arquivos que você enviar (como projetos de portfólio e anexos
          de orçamento) devem ser de sua autoria ou utilizados com autorização. Você mantém a
          titularidade do conteúdo e concede ao VDO CLUB licença para exibi-lo dentro da
          plataforma, conforme a finalidade do serviço.
        </p>
      </section>

      <section>
        <h2>6. Condutas proibidas</h2>
        <ul>
          <li>Usar a plataforma para fins ilícitos, fraudulentos ou enganosos;</li>
          <li>Criar contas falsas ou se passar por outra pessoa ou empresa;</li>
          <li>Tentar acessar áreas restritas, burlar a segurança ou sobrecarregar o sistema;</li>
          <li>Manipular avaliações, notas ou indicações.</li>
        </ul>
      </section>

      <section>
        <h2>7. Suspensão e encerramento</h2>
        <p>
          O VDO CLUB pode suspender ou encerrar contas que violem estes Termos. Você também pode
          solicitar o encerramento da sua conta a qualquer momento.
        </p>
      </section>

      <section>
        <h2>8. Disponibilidade</h2>
        <p>
          Trabalhamos para manter a plataforma disponível, mas não garantimos funcionamento
          ininterrupto. Podem ocorrer manutenções, instabilidades ou mudanças de funcionalidades.
        </p>
      </section>

      <section>
        <h2>9. Alterações destes Termos</h2>
        <p>
          Estes Termos podem ser atualizados periodicamente. Quando houver mudanças relevantes,
          avisaremos pela plataforma. O uso continuado após a atualização indica concordância com a
          nova versão.
        </p>
      </section>

      <section>
        <h2>10. Privacidade e foro</h2>
        <p>
          O tratamento de dados pessoais segue a nossa Política de Privacidade. Estes Termos são
          regidos pelas leis brasileiras.
        </p>
      </section>
    </LegalLayout>
  );
}
