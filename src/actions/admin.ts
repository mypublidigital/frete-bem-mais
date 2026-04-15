"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { resend, FROM_EMAIL } from "@/lib/resend/client";
import { ApprovalEmail } from "@/emails/ApprovalEmail";
import { RejectionEmail } from "@/emails/RejectionEmail";

async function getUserEmailAndName(admin: ReturnType<typeof createAdminClient>, userId: string) {
  const { data: profile } = await admin
    .from("profiles")
    .select("email, role")
    .eq("id", userId)
    .single();

  if (!profile) return { email: null, name: "Usuário", role: "shipper" as const };

  // Get name from shipper or carrier profile
  let name = "Usuário";
  if (profile.role === "shipper") {
    const { data } = await admin
      .from("shipper_profiles")
      .select("responsavel_nome")
      .eq("id", userId)
      .single();
    if (data?.responsavel_nome) name = data.responsavel_nome;
  } else if (profile.role === "carrier") {
    const { data } = await admin
      .from("carrier_profiles")
      .select("nome_completo, razao_social")
      .eq("id", userId)
      .single();
    if (data?.nome_completo) name = data.nome_completo;
    else if (data?.razao_social) name = data.razao_social;
  }

  return { email: profile.email, name, role: profile.role as "shipper" | "carrier" };
}

export async function approveRegistration(userId: string) {
  const supabase = await createClient();
  const admin = createAdminClient();

  // Verify caller is admin
  const { data: { user: caller } } = await supabase.auth.getUser();
  if (!caller || caller.user_metadata?.role !== "admin") {
    return { error: "Acesso negado." };
  }

  // Update profile status
  const { error: profileError } = await admin
    .from("profiles")
    .update({ status: "approved" })
    .eq("id", userId);

  if (profileError) {
    return { error: "Erro ao atualizar perfil." };
  }

  // Update auth user app_metadata so middleware can read status from JWT
  const { error: authError } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: { status: "approved" },
  });

  if (authError) {
    console.error("Auth metadata update error:", authError);
  }

  // Create audit log entry
  await admin.from("audit_log").insert({
    actor_id: caller.id,
    actor_role: "admin",
    entity_type: "profile",
    entity_id: userId,
    action: "status_change",
    old_status: "pending",
    new_status: "approved",
  });

  // Create notification
  await admin.from("notifications").insert({
    user_id: userId,
    type: "registration_approved",
    title: "Cadastro Aprovado",
    body: "Seu cadastro foi aprovado! Voce ja pode acessar a plataforma.",
    link: "/painel",
  });

  // Send approval email (non-blocking, fail silently if not configured)
  const { email, name, role } = await getUserEmailAndName(admin, userId);
  if (email && process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "your_resend_api_key") {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fretebemmais.com.br";
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Seu cadastro na Frete Bem+ foi aprovado!",
      react: ApprovalEmail({ name, role, loginUrl: `${appUrl}/login` }),
    }).catch((err) => console.error("Email send error (approval):", err));
  }

  return { success: true };
}

export async function rejectRegistration(userId: string, reason: string) {
  const supabase = await createClient();
  const admin = createAdminClient();

  // Verify caller is admin
  const { data: { user: caller } } = await supabase.auth.getUser();
  if (!caller || caller.user_metadata?.role !== "admin") {
    return { error: "Acesso negado." };
  }

  // Update profile status
  const { error: profileError } = await admin
    .from("profiles")
    .update({ status: "rejected" })
    .eq("id", userId);

  if (profileError) {
    return { error: "Erro ao atualizar perfil." };
  }

  // Update auth user app_metadata
  const { error: authError } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: { status: "rejected" },
  });

  if (authError) {
    console.error("Auth metadata update error:", authError);
  }

  // Create audit log entry with reason
  await admin.from("audit_log").insert({
    actor_id: caller.id,
    actor_role: "admin",
    entity_type: "profile",
    entity_id: userId,
    action: "status_change",
    old_status: "pending",
    new_status: "rejected",
    reason,
  });

  // Create notification
  await admin.from("notifications").insert({
    user_id: userId,
    type: "registration_rejected",
    title: "Cadastro Reprovado",
    body: `Seu cadastro foi reprovado. Motivo: ${reason}`,
    link: "/pendente",
  });

  // Send rejection email (non-blocking, fail silently if not configured)
  const { email, name, role } = await getUserEmailAndName(admin, userId);
  if (email && process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "your_resend_api_key") {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Atualização sobre seu cadastro na Frete Bem+",
      react: RejectionEmail({ name, role, reason }),
    }).catch((err) => console.error("Email send error (rejection):", err));
  }

  return { success: true };
}
