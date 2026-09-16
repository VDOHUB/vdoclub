import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CadastroForm } from "./cadastro-form";

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; role?: string; ref?: string }>;
}) {
  const { error, role, ref } = await searchParams;
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("active", true)
    .order("name");

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-wood mx-auto mb-3 flex items-center justify-center font-serif text-lg font-bold text-white">
            VC
          </div>
          <h1 className="font-serif text-xl text-white">Faça seu cadastro</h1>
          <p className="text-xs text-muted mt-1">
            {ref ? "Cadastro por convite — aprovação automática" : "Sujeito à aprovação do time VDO"}
          </p>
        </div>

        <CadastroForm
          categories={categories ?? []}
          errorMessage={error}
          defaultRole={role === "supplier" ? "supplier" : "architect"}
          referralToken={ref}
        />

        <p className="text-center text-sm text-muted mt-6">
          Já tem conta?{" "}
          <Link href="/login" className="text-[#d4b896] font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
