import Link from "next/link";
import { Badge, Card } from "@/components/ui";

export default function ConfirmadoPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        <Card>
          <Badge tone="green">E-mail confirmado com sucesso</Badge>
          <h1 className="font-serif text-xl text-white mt-4 mb-3">Tudo certo!</h1>
          <p className="text-sm text-muted leading-relaxed">
            Seu e-mail foi confirmado. Agora é só fazer login — se o seu cadastro ainda estiver em
            análise pelo time VDO, você verá o status assim que entrar.
          </p>
          <Link
            href="/login"
            className="inline-block mt-6 text-sm text-[#d4b896] font-medium hover:underline"
          >
            Ir para o login
          </Link>
        </Card>
      </div>
    </div>
  );
}
