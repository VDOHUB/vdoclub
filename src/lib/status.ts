import type { BusinessStatus } from "@/lib/supabase/types";

export const statusTone: Record<BusinessStatus, "yellow" | "wood" | "green"> = {
  orcado: "yellow",
  pendente_aprovacao: "wood",
  aprovado: "wood",
  concluido: "green",
  avaliado: "green",
};

export const statusLabel: Record<BusinessStatus, string> = {
  orcado: "Aguardando orçamento",
  pendente_aprovacao: "Pendente aprovação",
  aprovado: "Aprovado",
  concluido: "Concluído",
  avaliado: "Avaliado",
};
