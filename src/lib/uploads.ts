export type UploadedFile = { path: string; name: string; type: string; size: number };

export const MB = 1024 * 1024;

export const UPLOAD_LIMITS = {
  attachments: { bucket: "orcamento-anexos", maxBytes: 20 * MB, maxFiles: 10 },
  portfolio: { bucket: "portfolio", maxBytes: 20 * MB, maxFiles: 10 },
  avatar: { bucket: "avatars", maxBytes: 10 * MB, maxFiles: 1 },
  sponsor: { bucket: "sponsors", maxBytes: 5 * MB, maxFiles: 1 },
} as const;

export function sanitizeFileName(name: string): string {
  const cleaned = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");
  return (cleaned || "arquivo").slice(-80);
}

export class UploadError extends Error {}

// Lê e valida a lista de arquivos já enviados direto ao Storage pelo navegador.
// O servidor nunca recebe os bytes — só os caminhos, que precisam estar na pasta permitida.
export function parseUploaded(
  formData: FormData,
  opts: { prefix: string; maxBytes: number; maxFiles: number }
): UploadedFile[] {
  const raw = String(formData.get("uploaded") ?? "[]");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new UploadError("Lista de arquivos inválida.");
  }
  if (!Array.isArray(parsed)) throw new UploadError("Lista de arquivos inválida.");
  if (parsed.length > opts.maxFiles) {
    throw new UploadError(`Envie no máximo ${opts.maxFiles} arquivo(s).`);
  }

  return parsed.map((item) => {
    const f = item as Partial<UploadedFile>;
    if (
      typeof f.path !== "string" ||
      typeof f.name !== "string" ||
      typeof f.size !== "number" ||
      !f.path.startsWith(opts.prefix) ||
      f.path.includes("..")
    ) {
      throw new UploadError("Arquivo inválido.");
    }
    if (f.size > opts.maxBytes) {
      throw new UploadError(`"${f.name}" passa de ${Math.round(opts.maxBytes / MB)} MB.`);
    }
    return {
      path: f.path,
      name: f.name.slice(0, 200),
      type: typeof f.type === "string" ? f.type : "",
      size: f.size,
    };
  });
}
