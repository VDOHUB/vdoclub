"use client";

import { UploadForm } from "@/components/upload-form";
import { trimLogo } from "@/lib/trim-logo";

type Props = Omit<React.ComponentProps<typeof UploadForm>, "processFile">;

// Corta as margens do logo e detecta a cor de fundo antes de enviar.
export function SponsorUploadForm(props: Props) {
  return (
    <UploadForm
      {...props}
      processFile={async (file) => {
        const { file: trimmed, bgColor } = await trimLogo(file);
        return { file: trimmed, fields: { bg_color: bgColor } };
      }}
    />
  );
}
