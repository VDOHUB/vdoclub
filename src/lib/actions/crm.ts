"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { UPLOAD_LIMITS, UploadError, parseUploaded, type UploadedFile } from "@/lib/uploads";

export async function createBusinessRequest(formData: FormData) {
  const session = await getSessionProfile();
  if (!session || session.profile.role !== "architect") redirect("/login");
  const { supabase, user } = session;

  const supplierId = String(formData.get("supplier_id"));
  const categoryId = String(formData.get("category_id"));
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const backTo = String(formData.get("back_to") ?? "/app/fornecedores");

  let files: UploadedFile[] = [];
  try {
    files = parseUploaded(formData, {
      prefix: `${user.id}/`,
      maxBytes: UPLOAD_LIMITS.attachments.maxBytes,
      maxFiles: UPLOAD_LIMITS.attachments.maxFiles,
    });
  } catch (e) {
    redirect(`${backTo}?error=${encodeURIComponent(e instanceof UploadError ? e.message : "Arquivos inválidos.")}`);
  }

  // Os arquivos já foram enviados direto ao Storage; se algo falhar aqui, descartamos.
  const discardFiles = async () => {
    if (files.length > 0) {
      await supabase.storage.from(UPLOAD_LIMITS.attachments.bucket).remove(files.map((f) => f.path));
    }
  };

  if (!title) {
    await discardFiles();
    redirect(`${backTo}?error=${encodeURIComponent("Informe um título")}`);
  }

  const findOpenRequest = async () => {
    const { data } = await supabase
      .from("business_requests")
      .select("id")
      .eq("architect_id", user.id)
      .eq("supplier_id", supplierId)
      .in("status", ["orcado", "pendente_aprovacao", "aprovado"])
      .limit(1)
      .maybeSingle();
    return data;
  };

  const existing = await findOpenRequest();
  if (existing) {
    await discardFiles();
    redirect(`/app/orcamentos/${existing.id}`);
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
    await discardFiles();
    // Requisição simultânea que passou da checagem acima: a trava do banco
    // barrou, então levamos o usuário ao orçamento que já foi criado.
    const raced = await findOpenRequest();
    if (raced) redirect(`/app/orcamentos/${raced.id}`);
    redirect(`${backTo}?error=${encodeURIComponent(error?.message ?? "Erro ao criar orçamento")}`);
  }

  if (files.length > 0) {
    await supabase.from("business_request_attachments").insert(
      files.map((f) => ({
        business_request_id: request.id,
        storage_path: f.path,
        file_name: f.name,
        mime_type: f.type || null,
        size_bytes: f.size,
      }))
    );
  }

  revalidatePath("/app/orcamentos");
  redirect(`/app/orcamentos/${request.id}`);
}

export async function submitOrcamento(formData: FormData) {
  const session = await getSessionProfile();
  if (!session || session.profile.role !== "supplier") redirect("/login");

  const id = String(formData.get("id"));
  const valor = Number(formData.get("valor_proposto"));
  const prazoDias = formData.get("prazo_dias") ? Number(formData.get("prazo_dias")) : null;

  const { error } = await session.supabase
    .from("business_requests")
    .update({
      status: "pendente_aprovacao",
      valor_proposto: valor,
      prazo_dias: prazoDias,
      pendente_aprovacao_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("supplier_id", session.user.id)
    .eq("status", "orcado");

  if (error) redirect(`/app/orcamentos/${id}?error=${encodeURIComponent(error.message)}`);

  revalidatePath(`/app/orcamentos/${id}`);
  redirect(`/app/orcamentos/${id}`);
}

export async function approveOrcamento(formData: FormData) {
  const session = await getSessionProfile();
  if (!session || session.profile.role !== "architect") redirect("/login");

  const id = String(formData.get("id"));

  const { error } = await session.supabase
    .from("business_requests")
    .update({ status: "aprovado", aprovado_at: new Date().toISOString() })
    .eq("id", id)
    .eq("architect_id", session.user.id)
    .eq("status", "pendente_aprovacao");

  if (error) redirect(`/app/orcamentos/${id}?error=${encodeURIComponent(error.message)}`);

  revalidatePath(`/app/orcamentos/${id}`);
  redirect(`/app/orcamentos/${id}`);
}

export async function marcarConcluido(formData: FormData) {
  const session = await getSessionProfile();
  if (!session || session.profile.role !== "architect") redirect("/login");

  const id = String(formData.get("id"));

  const { error } = await session.supabase
    .from("business_requests")
    .update({ status: "concluido", concluido_at: new Date().toISOString() })
    .eq("id", id)
    .eq("architect_id", session.user.id)
    .eq("status", "aprovado");

  if (error) redirect(`/app/orcamentos/${id}?error=${encodeURIComponent(error.message)}`);

  revalidatePath(`/app/orcamentos/${id}`);
  redirect(`/app/orcamentos/${id}`);
}

export async function submitRating(formData: FormData) {
  const session = await getSessionProfile();
  if (!session || session.profile.role !== "architect") redirect("/login");

  const businessRequestId = String(formData.get("business_request_id") ?? "").trim() || null;
  const supplierId = String(formData.get("supplier_id"));
  const stars = Number(formData.get("stars"));
  const comment = String(formData.get("comment") ?? "").trim();
  const backTo = String(formData.get("back_to") ?? `/app/perfil/${supplierId}`);

  const { error } = await session.supabase.from("ratings").insert({
    business_request_id: businessRequestId,
    architect_id: session.user.id,
    supplier_id: supplierId,
    stars,
    comment: comment || null,
  });

  if (error) {
    redirect(`${backTo}?error=${encodeURIComponent(error.message)}`);
  }

  if (businessRequestId) {
    await session.supabase
      .from("business_requests")
      .update({ status: "avaliado", avaliado_at: new Date().toISOString() })
      .eq("id", businessRequestId)
      .eq("architect_id", session.user.id)
      .eq("status", "concluido");
    revalidatePath(`/app/orcamentos/${businessRequestId}`);
  }

  revalidatePath(backTo);
  redirect(backTo);
}
