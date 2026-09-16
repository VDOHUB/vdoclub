"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";

export async function createBusinessRequest(formData: FormData) {
  const session = await getSessionProfile();
  if (!session || session.profile.role !== "architect") redirect("/login");

  const supplierId = String(formData.get("supplier_id"));
  const categoryId = String(formData.get("category_id"));

  const { error } = await session.supabase.from("business_requests").insert({
    architect_id: session.user.id,
    supplier_id: supplierId,
    category_id: categoryId,
  });

  if (error) {
    redirect(`/app/fornecedores?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/app/orcamentos");
  redirect("/app/orcamentos");
}

export async function submitOrcamento(formData: FormData) {
  const session = await getSessionProfile();
  if (!session || session.profile.role !== "supplier") redirect("/login");

  const id = String(formData.get("id"));
  const valor = Number(formData.get("valor_proposto"));

  const { error } = await session.supabase
    .from("business_requests")
    .update({
      status: "orcamento",
      valor_proposto: valor,
      orcamento_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("supplier_id", session.user.id)
    .eq("status", "indicou");

  if (error) redirect(`/app/orcamentos/${id}?error=${encodeURIComponent(error.message)}`);

  revalidatePath(`/app/orcamentos/${id}`);
  redirect(`/app/orcamentos/${id}`);
}

export async function marcarFechado(formData: FormData) {
  const session = await getSessionProfile();
  if (!session || session.profile.role !== "architect") redirect("/login");

  const id = String(formData.get("id"));

  const { error } = await session.supabase
    .from("business_requests")
    .update({ status: "fechado", fechado_at: new Date().toISOString() })
    .eq("id", id)
    .eq("architect_id", session.user.id)
    .eq("status", "orcamento");

  if (error) redirect(`/app/orcamentos/${id}?error=${encodeURIComponent(error.message)}`);

  revalidatePath(`/app/orcamentos/${id}`);
  redirect(`/app/orcamentos/${id}`);
}

export async function submitRating(formData: FormData) {
  const session = await getSessionProfile();
  if (!session || session.profile.role !== "architect") redirect("/login");

  const businessRequestId = String(formData.get("business_request_id"));
  const supplierId = String(formData.get("supplier_id"));
  const stars = Number(formData.get("stars"));
  const comment = String(formData.get("comment") ?? "").trim();

  const { error } = await session.supabase.from("ratings").insert({
    business_request_id: businessRequestId,
    architect_id: session.user.id,
    supplier_id: supplierId,
    stars,
    comment: comment || null,
  });

  if (error) {
    redirect(`/app/orcamentos/${businessRequestId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/app/orcamentos/${businessRequestId}`);
  redirect(`/app/orcamentos/${businessRequestId}`);
}
