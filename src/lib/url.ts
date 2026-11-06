// Aceita links "práticos" (instagram.com/fulano, www.site.com.br) e completa com https://.
// Retorna null para vazio e lança erro para algo que não parece um endereço de site.
export function normalizeUrl(input: string): string | null {
  const value = input.trim();
  if (!value) return null;

  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`;

  let url: URL;
  try {
    url = new URL(withProtocol);
  } catch {
    throw new Error("Link inválido. Exemplo: instagram.com/seuperfil");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("O link precisa ser de um site (http ou https).");
  }
  if (!url.hostname.includes(".")) {
    throw new Error("Link inválido. Exemplo: instagram.com/seuperfil");
  }

  return url.toString();
}
