import { redirect } from "next/navigation";
import { updatePassword } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, ErrorNote, Input, Label } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";

export default async function RedefinirSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/esqueci-senha?error=${encodeURIComponent("O link expirou. Peça um novo para redefinir sua senha.")}`
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-wood mx-auto mb-3 flex items-center justify-center font-serif text-lg font-bold text-white">
            VC
          </div>
          <h1 className="font-serif text-xl text-white">Criar nova senha</h1>
          <p className="text-xs text-muted mt-1">{user.email}</p>
        </div>

        <Card>
          <ErrorNote message={error} />
          <form action={updatePassword} className="space-y-4">
            <div>
              <Label>Nova senha</Label>
              <Input type="password" name="password" required minLength={6} autoComplete="new-password" />
            </div>
            <div>
              <Label>Confirmar nova senha</Label>
              <Input type="password" name="confirm" required minLength={6} autoComplete="new-password" />
            </div>
            <SubmitButton className="w-full" pendingText="Salvando...">
              Salvar nova senha
            </SubmitButton>
          </form>
        </Card>
      </div>
    </div>
  );
}
