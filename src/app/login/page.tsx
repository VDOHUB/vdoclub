import Link from "next/link";
import { signIn } from "@/lib/actions/auth";
import { Card, ErrorNote, Input, Label } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-wood mx-auto mb-3 flex items-center justify-center font-serif text-lg font-bold text-white">
            VC
          </div>
          <h1 className="font-serif text-xl text-white">VDO CLUB</h1>
          <p className="text-xs text-muted mt-1">Arquitetos & Fornecedores</p>
        </div>

        <Card>
          <ErrorNote message={error} />
          <form action={signIn} className="space-y-4">
            <div>
              <Label>E-mail</Label>
              <Input type="email" name="email" required autoComplete="email" />
            </div>
            <div>
              <Label>Senha</Label>
              <Input type="password" name="password" required autoComplete="current-password" />
            </div>
            <SubmitButton className="w-full" pendingText="Entrando...">
              Entrar no Club
            </SubmitButton>
            <div className="text-center">
              <Link href="/esqueci-senha" className="text-xs text-muted hover:text-cream hover:underline">
                Esqueci minha senha
              </Link>
            </div>
          </form>
        </Card>

        <p className="text-center text-sm text-muted mt-6">
          Ainda não é membro?{" "}
          <Link href="/cadastro" className="text-[#d4b896] font-medium hover:underline">
            Faça seu cadastro
          </Link>
        </p>
      </div>
    </div>
  );
}
