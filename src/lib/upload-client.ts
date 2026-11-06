import { createClient } from "@/lib/supabase/client";

function friendlyError(status: number, body: string): string {
  let message = "";
  try {
    message = (JSON.parse(body) as { message?: string }).message ?? "";
  } catch {
    // corpo não-JSON
  }
  if (status === 413 || /exceeded the maximum allowed size/i.test(message)) {
    return "O arquivo passa do tamanho máximo permitido.";
  }
  if (status === 415 || /mime type/i.test(message)) {
    return "Esse tipo de arquivo não é aceito aqui.";
  }
  if (status === 401 || status === 403) {
    return "Sessão expirada ou sem permissão. Entre novamente e tente de novo.";
  }
  return message || `Falha no envio (código ${status}).`;
}

// Envia o arquivo direto do navegador para o Supabase Storage (sem passar pelo servidor do
// app, que na Vercel só aceita corpos de até 4,5 MB), com progresso real de envio.
export async function uploadToBucket(params: {
  bucket: string;
  path: string;
  file: File;
  onProgress?: (fraction: number) => void;
}): Promise<void> {
  const { bucket, path, file, onProgress } = params;

  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Sessão expirada. Entre novamente.");

  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${bucket}/${encodedPath}`;

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
    xhr.setRequestHeader("apikey", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    xhr.setRequestHeader("x-upsert", "false");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(1);
        resolve();
      } else {
        reject(new Error(friendlyError(xhr.status, xhr.responseText)));
      }
    };
    xhr.onerror = () => reject(new Error("Falha de conexão durante o envio. Verifique a internet e tente de novo."));
    xhr.ontimeout = () => reject(new Error("O envio demorou demais. Tente novamente."));

    const body = new FormData();
    body.append("cacheControl", "3600");
    body.append("", file);
    xhr.send(body);
  });
}

export async function removeFromBucket(bucket: string, paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const supabase = createClient();
  await supabase.storage.from(bucket).remove(paths);
}
