"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// ── Types ─────────────────────────────────────────────────────────────────────

export type FreightWithMasking = {
  id: string;
  status: string;
  natureza_carga: string;
  especificacao: string;
  volume_m3: number;
  peso_kg: number;
  valor_carga: number;
  valor_frete: number;
  retirada_cidade: string;
  retirada_uf: string;
  retirada_data: string;
  entrega_cidade: string;
  entrega_uf: string;
  entrega_data: string;
  observacoes: string | null;
  published_at: string;
  // PII-gated fields (null when masked)
  retirada_endereco: string | null;
  retirada_cep: string | null;
  retirada_horario_inicio: string | null;
  retirada_horario_fim: string | null;
  entrega_endereco: string | null;
  entrega_cep: string | null;
  shipper?: {
    razao_social: string;
    cnpj: string | null;       // masked until paid
    responsavel_nome: string | null;  // masked until paid
    responsavel_cargo: string | null; // masked until paid
    natureza_cargas: string;
  };
  applications_count?: number;
  my_application?: { id: string; status: string; vehicle_id: string } | null;
  selected_carrier?: {
    pessoa: string;
    cpf_cnpj: string | null; // masked until paid
    phone: string | null;    // masked until paid
  } | null;
  pii_revealed: boolean;
};

// ── Create Freight ────────────────────────────────────────────────────────────

export async function createFreight(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Nao autenticado." };

  const role = user.user_metadata?.role;
  const status = user.app_metadata?.status || user.user_metadata?.status;
  if (role !== "shipper" || status !== "approved") {
    return { error: "Apenas embarcadores aprovados podem publicar fretes." };
  }

  const retirada_horario_inicio = formData.get("retirada_horario_inicio") as string;
  const retirada_horario_fim = formData.get("retirada_horario_fim") as string;

  const { data, error } = await supabase.from("freights").insert({
    shipper_id: user.id,
    natureza_carga: formData.get("natureza_carga") as string,
    especificacao: formData.get("especificacao") as string,
    volume_m3: parseFloat(formData.get("volume_m3") as string) || 0,
    peso_kg: parseFloat(formData.get("peso_kg") as string) || 0,
    valor_carga: parseFloat(formData.get("valor_carga") as string) || 0,
    valor_frete: parseFloat(formData.get("valor_frete") as string) || 0,
    retirada_endereco: formData.get("retirada_endereco") as string,
    retirada_cidade: formData.get("retirada_cidade") as string,
    retirada_uf: formData.get("retirada_uf") as string,
    retirada_cep: (formData.get("retirada_cep") as string)?.replace(/\D/g, ""),
    retirada_data: formData.get("retirada_data") as string,
    retirada_horario_inicio: retirada_horario_inicio || null,
    retirada_horario_fim: retirada_horario_fim || null,
    entrega_endereco: formData.get("entrega_endereco") as string,
    entrega_cidade: formData.get("entrega_cidade") as string,
    entrega_uf: formData.get("entrega_uf") as string,
    entrega_cep: (formData.get("entrega_cep") as string)?.replace(/\D/g, ""),
    entrega_data: formData.get("entrega_data") as string,
    observacoes: (formData.get("observacoes") as string) || null,
  }).select("id").single();

  if (error) {
    console.error("createFreight error:", error);
    return { error: "Erro ao publicar frete. Verifique os dados e tente novamente." };
  }

  revalidatePath("/fretes");
  revalidatePath("/meus-fretes");
  return { success: true, freightId: data.id };
}

// ── List Published Freights (Marketplace) ────────────────────────────────────

export async function listFreights(filters?: {
  uf?: string;
  natureza?: string;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Nao autenticado." };

  let query = supabase
    .from("freights")
    .select(`
      id, status, natureza_carga, especificacao,
      volume_m3, peso_kg, valor_carga, valor_frete,
      retirada_cidade, retirada_uf, retirada_data,
      entrega_cidade, entrega_uf, entrega_data,
      observacoes, published_at,
      shipper_profiles!inner(razao_social, natureza_cargas)
    `)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (filters?.uf) {
    query = query.or(`retirada_uf.eq.${filters.uf},entrega_uf.eq.${filters.uf}`);
  }
  if (filters?.natureza) {
    query = query.ilike("natureza_carga", `%${filters.natureza}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("listFreights error:", error);
    return { error: "Erro ao carregar fretes." };
  }

  // Check carrier's own applications
  const role = user.user_metadata?.role;
  let myApplications: { freight_id: string; id: string; status: string; vehicle_id: string }[] = [];
  if (role === "carrier" && data && data.length > 0) {
    const freightIds = data.map((f: { id: string }) => f.id);
    const { data: apps } = await supabase
      .from("freight_applications")
      .select("id, freight_id, status, vehicle_id")
      .eq("carrier_id", user.id)
      .in("freight_id", freightIds);
    myApplications = apps || [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const freights = ((data || []) as any[]).map((f) => {
    const sp = Array.isArray(f.shipper_profiles) ? f.shipper_profiles[0] : f.shipper_profiles;
    const myApp = myApplications.find((a) => a.freight_id === f.id);
    return {
      id: f.id,
      status: f.status,
      natureza_carga: f.natureza_carga,
      especificacao: f.especificacao,
      volume_m3: f.volume_m3,
      peso_kg: f.peso_kg,
      valor_carga: f.valor_carga,
      valor_frete: f.valor_frete,
      retirada_cidade: f.retirada_cidade,
      retirada_uf: f.retirada_uf,
      retirada_data: f.retirada_data,
      entrega_cidade: f.entrega_cidade,
      entrega_uf: f.entrega_uf,
      entrega_data: f.entrega_data,
      observacoes: f.observacoes,
      published_at: f.published_at,
      shipper: {
        razao_social: sp?.razao_social ?? "Embarcador",
        natureza_cargas: sp?.natureza_cargas ?? "",
        cnpj: null,
        responsavel_nome: null,
        responsavel_cargo: null,
      },
      pii_revealed: false,
      my_application: myApp ? { id: myApp.id, status: myApp.status, vehicle_id: myApp.vehicle_id } : null,
    };
  });

  return { freights };
}

// ── Get Shipper's Own Freights ────────────────────────────────────────────────

export async function getMyFreights() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Nao autenticado." };

  const { data, error } = await supabase
    .from("freights")
    .select(`
      id, status, natureza_carga, especificacao,
      valor_frete, retirada_cidade, retirada_uf, retirada_data,
      entrega_cidade, entrega_uf, entrega_data, published_at, created_at
    `)
    .eq("shipper_id", user.id)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false });

  if (error) return { error: "Erro ao carregar seus fretes." };

  // Count applications per freight
  const freightIds = (data || []).map((f: { id: string }) => f.id);
  let applicationCounts: Record<string, number> = {};
  if (freightIds.length > 0) {
    const { data: apps } = await supabase
      .from("freight_applications")
      .select("freight_id")
      .in("freight_id", freightIds)
      .eq("status", "pending");

    (apps || []).forEach((a: { freight_id: string }) => {
      applicationCounts[a.freight_id] = (applicationCounts[a.freight_id] || 0) + 1;
    });
  }

  const freights = (data || []).map((f: {
    id: string;
    status: string;
    natureza_carga: string;
    especificacao: string;
    valor_frete: number;
    retirada_cidade: string;
    retirada_uf: string;
    retirada_data: string;
    entrega_cidade: string;
    entrega_uf: string;
    entrega_data: string;
    published_at: string;
    created_at: string;
  }) => ({
    ...f,
    applications_count: applicationCounts[f.id] || 0,
  }));

  return { freights };
}

// ── Get Freight Detail ────────────────────────────────────────────────────────

export async function getFreightDetail(freightId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Nao autenticado." };

  const { data: freight, error } = await supabase
    .from("freights")
    .select(`
      *,
      shipper_profiles!inner(
        razao_social, cnpj, responsavel_nome, responsavel_cargo, natureza_cargas
      )
    `)
    .eq("id", freightId)
    .single();

  if (error || !freight) return { error: "Frete nao encontrado." };

  // Check if payment was made
  const { data: payment } = await supabase
    .from("payments")
    .select("status")
    .eq("freight_id", freightId)
    .eq("status", "succeeded")
    .maybeSingle();

  const piiRevealed = !!payment;
  const isOwner = freight.shipper_id === user.id;

  // Get applications if shipper owns this freight
  let applications = null;
  if (isOwner) {
    const { data: apps } = await supabase
      .from("freight_applications")
      .select(`
        id, status, applied_at, vehicle_id,
        carrier_profiles!inner(
          nome_completo, razao_social, person_type, cnh_categoria
        ),
        vehicles!inner(marca, modelo, ano, placa)
      `)
      .eq("freight_id", freightId)
      .order("applied_at", { ascending: false });
    applications = apps || [];
  }

  // Get carrier's own application if carrier
  let myApplication = null;
  const role = user.user_metadata?.role;
  if (role === "carrier") {
    const { data: myApp } = await supabase
      .from("freight_applications")
      .select("id, status, vehicle_id")
      .eq("freight_id", freightId)
      .eq("carrier_id", user.id)
      .maybeSingle();
    myApplication = myApp;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const _sp = freight.shipper_profiles as any;
  const shipperData = (Array.isArray(_sp) ? _sp[0] : _sp) as {
    razao_social: string;
    cnpj: string;
    responsavel_nome: string;
    responsavel_cargo: string;
    natureza_cargas: string;
  };

  return {
    freight: {
      ...freight,
      // Mask PII fields
      retirada_endereco: piiRevealed || isOwner ? freight.retirada_endereco : null,
      retirada_cep: piiRevealed || isOwner ? freight.retirada_cep : null,
      entrega_endereco: piiRevealed || isOwner ? freight.entrega_endereco : null,
      entrega_cep: piiRevealed || isOwner ? freight.entrega_cep : null,
      shipper: {
        razao_social: shipperData.razao_social,
        cnpj: piiRevealed || isOwner ? shipperData.cnpj : null,
        responsavel_nome: piiRevealed || isOwner ? shipperData.responsavel_nome : null,
        responsavel_cargo: piiRevealed || isOwner ? shipperData.responsavel_cargo : null,
        natureza_cargas: shipperData.natureza_cargas,
      },
      pii_revealed: piiRevealed,
    },
    applications,
    myApplication,
  };
}

// ── Apply to Freight ──────────────────────────────────────────────────────────

export async function applyToFreight(freightId: string, vehicleId: string) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Nao autenticado." };

  const role = user.user_metadata?.role;
  const status = user.app_metadata?.status || user.user_metadata?.status;
  if (role !== "carrier" || status !== "approved") {
    return { error: "Apenas transportadores aprovados podem se candidatar." };
  }

  // Verify freight is still published
  const { data: freight } = await supabase
    .from("freights")
    .select("id, status, shipper_id")
    .eq("id", freightId)
    .single();

  if (!freight) return { error: "Frete nao encontrado." };
  if (!["published", "applied"].includes(freight.status)) {
    return { error: "Este frete nao esta disponivel para candidaturas." };
  }

  // Verify vehicle belongs to carrier
  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id")
    .eq("id", vehicleId)
    .eq("carrier_id", user.id)
    .single();

  if (!vehicle) return { error: "Veiculo invalido." };

  // Create application
  const { error: appError } = await supabase
    .from("freight_applications")
    .insert({
      freight_id: freightId,
      carrier_id: user.id,
      vehicle_id: vehicleId,
    });

  if (appError) {
    if (appError.code === "23505") {
      return { error: "Voce ja se candidatou a este frete." };
    }
    return { error: "Erro ao enviar candidatura." };
  }

  // Update freight status to 'applied' if still 'published'
  if (freight.status === "published") {
    await admin.from("freights").update({ status: "applied" }).eq("id", freightId);
  }

  // Notify shipper
  await admin.from("notifications").insert({
    user_id: freight.shipper_id,
    type: "new_application",
    title: "Nova Candidatura",
    body: "Um transportador se candidatou ao seu frete.",
    link: `/fretes/${freightId}`,
  });

  revalidatePath(`/fretes/${freightId}`);
  revalidatePath("/fretes");
  return { success: true };
}

// ── Accept Application ────────────────────────────────────────────────────────

export async function acceptApplication(freightId: string, applicationId: string) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Nao autenticado." };

  // Verify ownership
  const { data: freight } = await supabase
    .from("freights")
    .select("id, shipper_id, status")
    .eq("id", freightId)
    .single();

  if (!freight || freight.shipper_id !== user.id) {
    return { error: "Acesso negado." };
  }
  if (!["published", "applied"].includes(freight.status)) {
    return { error: "Este frete nao pode ser alterado agora." };
  }

  // Get the accepted application
  const { data: app } = await supabase
    .from("freight_applications")
    .select("id, carrier_id, vehicle_id")
    .eq("id", applicationId)
    .eq("freight_id", freightId)
    .eq("status", "pending")
    .single();

  if (!app) return { error: "Candidatura nao encontrada." };

  // Accept the chosen application and reject others
  await admin
    .from("freight_applications")
    .update({ status: "rejected", responded_at: new Date().toISOString() })
    .eq("freight_id", freightId)
    .neq("id", applicationId);

  await admin
    .from("freight_applications")
    .update({ status: "accepted", responded_at: new Date().toISOString() })
    .eq("id", applicationId);

  // Update freight
  await admin.from("freights").update({
    status: "accepted",
    selected_carrier_id: app.carrier_id,
    selected_vehicle_id: app.vehicle_id,
    accepted_at: new Date().toISOString(),
  }).eq("id", freightId);

  // Audit log
  await admin.from("audit_log").insert({
    actor_id: user.id,
    actor_role: "shipper",
    entity_type: "freight",
    entity_id: freightId,
    action: "status_change",
    old_status: freight.status,
    new_status: "accepted",
  });

  // Notify carrier
  await admin.from("notifications").insert({
    user_id: app.carrier_id,
    type: "application_accepted",
    title: "Candidatura Aceita!",
    body: "Sua candidatura foi aceita. Aguarde o pagamento do embarcador.",
    link: `/fretes/${freightId}`,
  });

  revalidatePath(`/fretes/${freightId}`);
  revalidatePath("/meus-fretes");
  return { success: true };
}

// ── Cancel Freight ────────────────────────────────────────────────────────────

export async function cancelFreight(freightId: string) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Nao autenticado." };

  const { data: freight } = await supabase
    .from("freights")
    .select("id, shipper_id, status")
    .eq("id", freightId)
    .single();

  if (!freight || freight.shipper_id !== user.id) return { error: "Acesso negado." };
  if (["paid", "in_transit", "delivered", "completed"].includes(freight.status)) {
    return { error: "Este frete nao pode ser cancelado." };
  }

  await admin.from("freights").update({
    status: "cancelled",
    cancelled_at: new Date().toISOString(),
  }).eq("id", freightId);

  revalidatePath("/meus-fretes");
  return { success: true };
}
