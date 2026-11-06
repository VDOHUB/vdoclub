"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui";
import { removeFromBucket, uploadToBucket } from "@/lib/upload-client";
import { MB, sanitizeFileName, type UploadedFile } from "@/lib/uploads";

function formatSize(bytes: number) {
  return bytes >= MB ? `${(bytes / MB).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  bucket: string;
  pathPrefix: string;
  label: string;
  accept?: string;
  maxBytes: number;
  maxFiles: number;
  required?: boolean;
  submitLabel: string;
  pendingText?: string;
  variant?: "primary" | "ghost";
  compact?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export function UploadForm({
  action,
  bucket,
  pathPrefix,
  label,
  accept,
  maxBytes,
  maxFiles,
  required = false,
  submitLabel,
  pendingText = "Salvando...",
  variant,
  compact = false,
  className = "",
  children,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "uploading" | "saving">("idle");
  const [, startTransition] = useTransition();

  const busy = phase !== "idle";
  const single = maxFiles === 1;
  const maxMb = Math.round(maxBytes / MB);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setError(null);
    const next = single ? [] : [...files];
    for (const file of Array.from(list)) {
      if (file.size > maxBytes) {
        setError(`"${file.name}" tem ${formatSize(file.size)} e passa do limite de ${maxMb} MB.`);
        continue;
      }
      if (next.some((f) => f.name === file.name && f.size === file.size)) continue;
      if (next.length >= maxFiles) {
        setError(`Você pode enviar no máximo ${maxFiles} arquivo(s).`);
        break;
      }
      next.push(file);
    }
    setFiles(next);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, i) => i !== index));
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    if (required && files.length === 0) {
      setError("Escolha um arquivo para continuar.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const uploaded: UploadedFile[] = [];
    setError(null);

    try {
      if (files.length > 0) {
        setPhase("uploading");
        setProgress(files.map(() => 0));
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const path = `${pathPrefix}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
          await uploadToBucket({
            bucket,
            path,
            file,
            onProgress: (fraction) =>
              setProgress((current) => current.map((p, idx) => (idx === i ? fraction : p))),
          });
          uploaded.push({
            path,
            name: file.name,
            type: file.type || "application/octet-stream",
            size: file.size,
          });
        }
      }

      formData.set("uploaded", JSON.stringify(uploaded));
      setPhase("saving");
      startTransition(async () => {
        try {
          await action(formData);
          // Os arquivos já foram consumidos pelo servidor (ou descartados por ele em caso de erro).
          setFiles([]);
          setProgress([]);
        } catch (e) {
          // redirect() do servidor pode chegar aqui como exceção especial — deixa passar.
          if (e && typeof e === "object" && "digest" in e && String((e as { digest: unknown }).digest).startsWith("NEXT_REDIRECT")) {
            throw e;
          }
          await removeFromBucket(bucket, uploaded.map((u) => u.path)).catch(() => {});
          setError("Não foi possível salvar. Tente novamente.");
        } finally {
          setPhase("idle");
        }
      });
    } catch (e) {
      await removeFromBucket(bucket, uploaded.map((u) => u.path)).catch(() => {});
      setError(e instanceof Error ? e.message : "Falha no envio. Tente novamente.");
      setPhase("idle");
    }
  }

  const overall =
    files.length > 0 && progress.length === files.length
      ? Math.round((progress.reduce((a, b) => a + b, 0) / files.length) * 100)
      : 0;

  const buttonText =
    phase === "uploading" ? `Enviando arquivos... ${overall}%` : phase === "saving" ? pendingText : submitLabel;

  const picker = (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={!single}
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />
      <Button
        type="button"
        variant="ghost"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {files.length === 0 ? (single ? "Escolher foto" : "Escolher arquivos") : single ? "Trocar escolha" : "Adicionar mais"}
      </Button>
    </>
  );

  const fileList =
    files.length > 0 ? (
      <ul className="space-y-1.5 w-full min-w-0">
        {files.map((file, i) => (
          <li
            key={`${file.name}-${file.size}`}
            className="bg-wood/10 border border-wood/25 rounded-lg px-3 py-2"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-cream truncate flex-1 min-w-0">{file.name}</span>
              <span className="text-[11px] text-muted flex-shrink-0">{formatSize(file.size)}</span>
              {!busy && (
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  aria-label={`Remover ${file.name}`}
                  className="text-red-300 hover:text-red-200 text-base leading-none px-1 flex-shrink-0"
                >
                  ×
                </button>
              )}
            </div>
            {phase === "uploading" && (
              <div className="mt-1.5 h-1 rounded-full bg-wood/30 overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-[width] duration-150"
                  style={{ width: `${Math.round((progress[i] ?? 0) * 100)}%` }}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    ) : null;

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}

      {compact ? (
        <div className="flex flex-wrap items-center gap-2">
          {picker}
          <Button type="submit" variant={variant} disabled={busy || files.length === 0}>
            {buttonText}
          </Button>
          {fileList}
          {error && <p className="text-xs text-red-300 w-full">{error}</p>}
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <div className="block text-[11px] font-semibold uppercase tracking-wider text-cream/70 mb-1.5">
              {label}
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-2">{picker}</div>
            {fileList}
          </div>
          {error && (
            <p className="text-sm text-red-300 bg-red-950/30 border border-red-900/40 rounded-lg px-3.5 py-2.5">
              {error}
            </p>
          )}
          <Button type="submit" variant={variant} disabled={busy}>
            {buttonText}
          </Button>
        </div>
      )}
    </form>
  );
}
