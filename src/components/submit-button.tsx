"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui";

export function SubmitButton({
  children,
  pendingText = "Enviando...",
  variant,
  className,
}: {
  children: React.ReactNode;
  pendingText?: string;
  variant?: "primary" | "ghost" | "danger";
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} variant={variant} className={className}>
      {pending ? pendingText : children}
    </Button>
  );
}
