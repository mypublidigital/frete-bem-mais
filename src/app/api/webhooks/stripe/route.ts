import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/config";
import { createAdminClient } from "@/lib/supabase/admin";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  switch (event.type) {
    case "payment_intent.succeeded": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const freightId = intent.metadata.freight_id;
      const carrierId = intent.metadata.carrier_id;
      const shipperId = intent.metadata.shipper_id;
      const chargeId = (intent as Stripe.PaymentIntent & { latest_charge?: string }).latest_charge ?? null;

      if (!freightId) break;

      // Update payment status
      await admin
        .from("payments")
        .update({
          status: "succeeded",
          stripe_charge_id: chargeId,
        })
        .eq("stripe_payment_intent_id", intent.id);

      // Update freight status to 'paid'
      await admin
        .from("freights")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
        })
        .eq("id", freightId);

      // Audit log
      await admin.from("audit_log").insert({
        actor_id: shipperId,
        actor_role: "shipper",
        entity_type: "freight",
        entity_id: freightId,
        action: "payment_succeeded",
        new_status: "paid",
      });

      // Notify carrier: payment done, PII revealed
      if (carrierId) {
        await admin.from("notifications").insert({
          user_id: carrierId,
          type: "payment_succeeded",
          title: "Pagamento Confirmado!",
          body: "O pagamento foi aprovado. Você já pode ver o endereço de retirada.",
          link: `/fretes/${freightId}`,
        });
      }

      // Notify shipper: PII revealed, can now see carrier contact
      await admin.from("notifications").insert({
        user_id: shipperId,
        type: "payment_succeeded",
        title: "Pagamento Confirmado!",
        body: "Pagamento aprovado. Os dados do transportador estão disponíveis.",
        link: `/fretes/${freightId}`,
      });

      break;
    }

    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const freightId = intent.metadata.freight_id;

      if (!freightId) break;

      await admin
        .from("payments")
        .update({ status: "failed" })
        .eq("stripe_payment_intent_id", intent.id);

      // Revert freight to 'accepted' so shipper can retry payment
      await admin
        .from("freights")
        .update({ status: "accepted" })
        .eq("id", freightId);

      break;
    }

    default:
      // Unhandled event types are OK
      break;
  }

  return NextResponse.json({ received: true });
}
