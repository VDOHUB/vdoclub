export type LegalSlug = "termos" | "privacidade";

export const LEGAL_TITLES: Record<LegalSlug, string> = {
  termos: "Termos de Uso",
  privacidade: "Política de Privacidade",
};

// Textos padrão (usados enquanto o admin não salvar uma versão própria).
// Formato: "## Título" = subtítulo, "- item" = lista, linha em branco separa parágrafos,
// **texto** = negrito.
export const LEGAL_DEFAULTS: Record<LegalSlug, string> = {
  termos: `## 1. Sobre o VDO CLUB
O VDO CLUB é uma plataforma fechada que conecta arquitetos e fornecedores, reunindo cadastro, reputação, categorias e o fluxo de solicitação de orçamentos entre as partes. Ao criar uma conta, você declara ter lido e concordado com estes Termos.

## 2. Cadastro e aprovação
- As informações fornecidas no cadastro devem ser verdadeiras, completas e atualizadas.
- Todo cadastro passa por análise e aprovação do time VDO CLUB, que pode aprovar ou recusar solicitações a seu critério, sem obrigação de justificar a decisão.
- Você é responsável por manter a confidencialidade da sua senha e por toda atividade realizada na sua conta.

## 3. Orçamentos e negociações
A plataforma organiza a solicitação, a resposta e o acompanhamento de orçamentos entre arquitetos e fornecedores. A negociação, o pagamento e a execução dos serviços são de responsabilidade exclusiva das partes envolvidas. O VDO CLUB não é parte dos contratos firmados entre arquitetos e fornecedores e não garante a qualidade, o prazo ou o resultado de qualquer serviço.

## 4. Avaliações
- As avaliações devem refletir a experiência real do usuário, de forma respeitosa e verdadeira.
- Todas as avaliações e comentários passam por moderação antes de serem publicados.
- O VDO CLUB pode recusar ou remover conteúdo ofensivo, falso, discriminatório ou que viole direitos de terceiros.

## 5. Conteúdo enviado por você
Fotos, descrições, links e arquivos que você enviar (como projetos de portfólio e anexos de orçamento) devem ser de sua autoria ou utilizados com autorização. Você mantém a titularidade do conteúdo e concede ao VDO CLUB licença para exibi-lo dentro da plataforma, conforme a finalidade do serviço.

## 6. Condutas proibidas
- Usar a plataforma para fins ilícitos, fraudulentos ou enganosos;
- Criar contas falsas ou se passar por outra pessoa ou empresa;
- Tentar acessar áreas restritas, burlar a segurança ou sobrecarregar o sistema;
- Manipular avaliações, notas ou indicações.

## 7. Suspensão e encerramento
O VDO CLUB pode suspender ou encerrar contas que violem estes Termos. Você também pode solicitar o encerramento da sua conta a qualquer momento.

## 8. Disponibilidade
Trabalhamos para manter a plataforma disponível, mas não garantimos funcionamento ininterrupto. Podem ocorrer manutenções, instabilidades ou mudanças de funcionalidades.

## 9. Alterações destes Termos
Estes Termos podem ser atualizados periodicamente. Quando houver mudanças relevantes, avisaremos pela plataforma. O uso continuado após a atualização indica concordância com a nova versão.

## 10. Privacidade e foro
O tratamento de dados pessoais segue a nossa Política de Privacidade. Estes Termos são regidos pelas leis brasileiras.`,

  privacidade: `## 1. Quem somos
O VDO CLUB é o controlador dos dados pessoais tratados nesta plataforma, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD). Esta política explica quais dados coletamos, para que os usamos e quais são os seus direitos.

## 2. Dados que coletamos
- **Cadastro:** nome, telefone, e-mail, senha (armazenada de forma criptografada), tipo de perfil (arquiteto ou fornecedor) e, para fornecedores, as categorias de atuação;
- **Perfil:** foto de perfil, projetos de portfólio (títulos, descrições, fotos e links) que você decidir publicar;
- **Uso da plataforma:** orçamentos solicitados e respondidos, anexos, avaliações e comentários, indicações realizadas;
- **Aceite dos termos:** data e hora em que você aceitou os Termos de Uso e esta Política.

## 3. Para que usamos seus dados
- Criar e gerenciar sua conta, e analisar sua solicitação de entrada no Club;
- Permitir a busca de perfis, a solicitação de orçamentos e o acompanhamento de cada etapa;
- Moderar avaliações e manter a confiança da comunidade;
- Enviar e-mails do sistema, como confirmação de cadastro e redefinição de senha;
- Garantir a segurança da plataforma e cumprir obrigações legais.

## 4. Com quem compartilhamos
Seu nome, foto, categorias, portfólio e avaliações aprovadas ficam visíveis para os demais membros aprovados do Club. Seu telefone e e-mail não são exibidos publicamente. Para operar o serviço, utilizamos prestadores de infraestrutura que tratam dados em nosso nome: hospedagem (Vercel), banco de dados e autenticação (Supabase) e envio de e-mails (Resend). Não vendemos seus dados.

## 5. Bases legais
Tratamos seus dados para execução do serviço que você solicitou ao criar a conta, para cumprimento de obrigações legais, para o legítimo interesse de manter a plataforma segura e, quando aplicável, com o seu consentimento.

## 6. Por quanto tempo guardamos
Mantemos os dados enquanto sua conta estiver ativa e pelo período necessário para cumprir obrigações legais. Ao encerrar a conta, os dados são excluídos ou anonimizados, salvo quando a lei exigir a guarda.

## 7. Seus direitos
Você pode, a qualquer momento, solicitar:
- Confirmação de que tratamos seus dados e acesso a eles;
- Correção de dados incompletos, inexatos ou desatualizados;
- Anonimização, bloqueio ou eliminação de dados desnecessários;
- Portabilidade e informação sobre compartilhamentos;
- Revogação de consentimento e exclusão da sua conta.

Para exercer seus direitos, entre em contato com o time VDO CLUB pelos canais oficiais informados na plataforma.

## 8. Segurança
Adotamos medidas técnicas para proteger seus dados, como conexão criptografada (HTTPS), senhas armazenadas de forma segura e controle de acesso por perfil. Nenhum sistema é totalmente imune a falhas, e trabalhamos continuamente para reduzir riscos.

## 9. Alterações
Esta política pode ser atualizada. Mudanças relevantes serão comunicadas pela plataforma.`,
};

export const LEGAL_DEFAULT_DATE = "Outubro de 2026";
