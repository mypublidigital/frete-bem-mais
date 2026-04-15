"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe/config";
import { revalidatePath } from "next/cache";

// Shipper confirms the cargo was boarded → triggers carrier payout
export async function confirmBoarding(freightId: string) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Nao autenticado." };

  // Verify ownership and status
  const { data: freight } = await supabase
    .from("freights")
    .select("id, shipper_id, selected_carrier_id, status")
    .eq("id", freightId)
    .single();

  if (!freight || freight.shipper_id !== user.id) {
    return { error: "Acesso negado." };
  }
  if (freight.status !== "paid") {
    return { error: "Frete deve estar pago para confirmar embarque." };
  }

  // Get payment record
  const { data: payment } = await admin
    .from("payments")
    .select("*")
    .eq("freight_id", freightId)
    .eq("status", "succeeded")
    .single();

  if (!payment) {
    return { error: "Pagamento nao encontrado." };
  }

  // Get carrier's Stripe account (for transfer)
  // Note: In production, carrier must have a Stripe Connect account
  // For now, mark payout as triggered and handle manually
  try {
    // If carrier has a stripe_account_id, do the transfer
    const { data: carrierProfile } = await admin
      .from("profiles")
      .select("stripe_account_id")
      .eq("id", freight.selected_carrier_id)
      .maybeSingle();

    let transferId: string | null = null;

    if (carrierProfile?.stripe_account_id) {
      const transfer = await stripe.transfers.create({
        amount: payment.carrier_payout_amount,
        currency: "brl",
        destination: carrierProfile.stripe_account_id,
        transfer_group: freightId,
        description: `Payout frete ${freightId.slice(0, 8)}`,
      });
      transferId = transfer.id;
    }

    const now = new Date().toISOString();

    // Update payment
    await admin.from("payments").update({
      status: transferId ? "payout_completed" : "payout_triggered",
      payout_triggered_at: now,
      payout_completed_at: transferId ? now : null,
      stripe_transfer_id: transferId,
    }).eq("id", payment.id);

    // Update freight status
    await admin.from("freights").update({
      status: "in_transit",
      boarded_at: now,
    }).eq("id", freightId);

    // Audit log
    await admin.from("audit_log").insert({
      actor_id: user.id,
      actor_role: "shipper",
      entity_type: "freight",
      entity_id: freightId,
      action: "status_change",
      old_status: "paid",
      new_status: "in_transit",
    });

    // Notify carrier
    await admin.from("notifications").insert({
      user_id: freight.selected_carrier_id,
      type: "boarding_confirmed",
      title: "Embarque Confirmado!",
      body: "O embarcador confirmou o embarque. Pagamento em processamento.",
      link: `/fretes/${freightId}`,
    });

    revalidatePath(`/fretes/${freightId}`);
    return { success: true };

  } catch (err) {
    console.error("confirmBoarding error:", err);
    return { error: "Erro ao processar embarque." };
  }
}

// Carrier marks freight as delivered
export async function confirmDelivery(freightId: string) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Nao autenticado." };

  const { data: freight } = await supabase
    .from("freights")
    .select("id, selected_carrier_id, shipper_id, status")
    .eq("id", freightId)
    .single();

  if (!freight || freight.selected_carrier_id !== user.id) {
    return { error: "Acesso negado." };
  }
  if (freight.status !== "in_transit") {
    return { error: "Frete deve estar em transito." };
  }

  const now = new Date().toISOString();
  await admin.from("freights").update({
    status: "delivered",
    delivered_at: now,
  }).eq("id", freightId);

  await admin.from("audit_log").insert({
    actor_id: user.id,
    actor_role: "carrier",
    entity_type: "freight",
    entity_id: freightId,
    action: "status_change",
    old_status: "in_transit",
    new_status: "delivered",
  });

  await admin.from("notifications").insert({
    user_id: freight.shipper_id,
    type: "delivery_confirmed",
    title: "Entrega Confirmada",
    body: "O transportador confirmou a entrega da carga.",
    link: `/fretes/${freightId}`,
  });

  revalidatePath(`/fretes/${freightId}`);
  return { success: true };
}
