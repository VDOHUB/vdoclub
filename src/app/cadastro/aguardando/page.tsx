import { signOut } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { Badge, Button, Card } from "@/components/ui";

export default async function AguardandoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("status").eq("id", user.id).single()
    : { data: null };

  const status = profile?.status ?? "pending_review";

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        <Card>
          {status === "rejected" ? (
            <>
              <Badge tone="red">Cadastro não aprovado</Badge>
              <h1 className="font-serif text-xl text-white mt-4 mb-3">
                Seu cadastro não foi aprovado
              </h1>
              <p className="text-sm text-muted leading-relaxed">
                Fale com o time VDO CLUB para entender os próximos passos.
              </p>
            </>
          ) : (
            <>
              <Badge tone="yellow">Aguardando aprovação</Badge>
              <h1 className="font-serif text-xl text-white mt-4 mb-3">
                Seu e-mail foi confirmado
              </h1>
              <p className="text-sm text-muted leading-relaxed">
                Agora seu cadastro está em análise pelo time VDO CLUB. Assim que for aprovado,
                você recebe acesso completo à plataforma.
              </p>
            </>
          )}
          <form action={signOut} className="mt-6">
            <Button variant="ghost" type="submit">
              Sair
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
