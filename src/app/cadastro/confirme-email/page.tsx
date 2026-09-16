import Link from "next/link";
import { Card } from "@/components/ui";

export default function ConfirmeEmailPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        <Card>
          <h1 className="font-serif text-xl text-white mb-3">Confirme seu e-mail</h1>
          <p className="text-sm text-muted leading-relaxed">
            Enviamos um link de confirmação para o e-mail informado. Depois de confirmar, seu
            cadastro entra na fila de aprovação do time VDO — você recebe acesso assim que for
            aprovado.
          </p>
          <Link href="/login" className="inline-block mt-6 text-sm text-[#d4b896] font-medium hover:underline">
            Voltar para o login
          </Link>
        </Card>
      </div>
    </div>
  );
}
