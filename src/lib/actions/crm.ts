"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

export async function createBusinessRequest(formData: FormData) {
  const session = await getSessionProfile();
  if (!session || session.profile.role !== "architect") redirect("/login");
  const { supabase, user } = session;

  const supplierId = String(formData.get("supplier_id"));
  const categoryId = String(formData.get("category_id"));
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const backTo = String(formData.get("back_to") ?? "/app/fornecedores");

  if (!title) redirect(`${backTo}?error=${encodeURIComponent("Informe um título")}`);

  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) {
      redirect(`${backTo}?error=${encodeURIComponent(`"${file.name}" passa de 5 MB`)}`);
    }
  }

  const { data: request, error } = await supabase
    .from("business_requests")
    .insert({
      architect_id: user.id,
      supplier_id: supplierId,
      category_id: categoryId,
      title,
      description: description || null,
    })
    .select("id")
    .single();

  if (error || !request) {
    redirect(`${backTo}?error=${encodeURIComponent(error?.message ?? "Erro ao criar orçamento")}`);
  }

  for (const file of files) {
    const ext = file.name.split(".").pop() ?? "bin";
    const path = `${request.id}/${randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("orcamento-anexos")
      .upload(path, file, { contentType: file.type });
    if (!uploadError) {
      await supabase.from("business_request_attachments").insert({
        business_request_id: request.id,
        storage_path: path,
        file_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
      });
    }
  }

  revalidatePath("/app/orcamentos");
  redirect(`/app/orcamentos/${request.id}`);
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
