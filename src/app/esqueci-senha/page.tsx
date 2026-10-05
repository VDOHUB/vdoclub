import Link from "next/link";
import { requestPasswordReset } from "@/lib/actions/auth";
import { Card, ErrorNote, Input, Label } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";

export default async function EsqueciSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { error, sent } = await searchParams;

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-wood mx-auto mb-3 flex items-center justify-center font-serif text-lg font-bold text-white">
            VC
          </div>
          <h1 className="font-serif text-xl text-white">Esqueci minha senha</h1>
          <p className="text-xs text-muted mt-1">Enviaremos um link para você criar uma nova</p>
        </div>

        <Card>
          <ErrorNote message={error} />
          {sent ? (
            <p className="text-sm text-cream/80 leading-relaxed">
              Se existir uma conta com esse e-mail, você receberá em instantes um link para
              redefinir a senha. Confira também a caixa de spam.
            </p>
          ) : (
            <form action={requestPasswordReset} className="space-y-4">
              <div>
                <Label>E-mail</Label>
                <Input type="email" name="email" required autoComplete="email" />
              </div>
              <SubmitButton className="w-full" pendingText="Enviando...">
                Enviar link
              </SubmitButton>
            </form>
          )}
        </Card>

        <p className="text-center text-sm text-muted mt-6">
          <Link href="/login" className="text-[#d4b896] font-medium hover:underline">
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  );
}
