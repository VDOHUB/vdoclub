"use client";

import { useState } from "react";
import { signUp } from "@/lib/actions/auth";
import { Button, Card, ErrorNote, Input, Label } from "@/components/ui";

type Category = { id: string; name: string };

export function CadastroForm({
  categories,
  errorMessage,
  defaultRole,
  referralToken,
}: {
  categories: Category[];
  errorMessage?: string;
  defaultRole: "architect" | "supplier";
  referralToken?: string;
}) {
  const [role, setRole] = useState<"architect" | "supplier">(defaultRole);

  return (
    <Card>
      <ErrorNote message={errorMessage} />

      <div className="flex gap-2 mb-5">
        <button
          type="button"
          onClick={() => setRole("architect")}
          className={`flex-1 text-center py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
            role === "architect"
              ? "bg-[#d4b896]/20 border-[#d4b896]/50 text-[#d4b896]"
              : "bg-wood/10 border-wood/25 text-muted"
          }`}
        >
          Arquiteto
        </button>
        <button
          type="button"
          onClick={() => setRole("supplier")}
          className={`flex-1 text-center py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
            role === "supplier"
              ? "bg-[#d4b896]/20 border-[#d4b896]/50 text-[#d4b896]"
              : "bg-wood/10 border-wood/25 text-muted"
          }`}
        >
          Fornecedor
        </button>
      </div>

      <form action={signUp} className="space-y-4">
        <input type="hidden" name="role" value={role} />
        {referralToken && <input type="hidden" name="referral_token" value={referralToken} />}

        <div>
          <Label>Nome</Label>
          <Input type="text" name="name" required />
        </div>
        <div>
          <Label>Telefone</Label>
          <Input type="tel" name="phone" required placeholder="(00) 00000-0000" />
        </div>
        <div>
          <Label>E-mail</Label>
          <Input type="email" name="email" required autoComplete="email" />
        </div>
        <div>
          <Label>Senha</Label>
          <Input type="password" name="password" required minLength={6} autoComplete="new-password" />
        </div>

        {role === "supplier" && (
          <div>
            <Label>Categorias (selecione uma ou mais)</Label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center gap-2 text-xs text-cream bg-wood/10 border border-wood/25 rounded-lg px-3 py-2 cursor-pointer"
                >
                  <input type="checkbox" name="category_ids" value={cat.id} className="accent-[#d4b896]" />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>
        )}

        <Button type="submit" className="w-full mt-2">
          Criar cadastro
        </Button>
      </form>
    </Card>
  );
}
