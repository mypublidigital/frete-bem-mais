import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe, calculatePlatformFee } from "@/lib/stripe/config";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    const { freightId } = await req.json();
    if (!freightId) {
      return NextResponse.json({ error: "freightId obrigatorio" }, { status: 400 });
    }

    // Fetch freight and verify ownership
    const { data: freight } = await supabase
      .from("freights")
      .select("id, shipper_id, selected_carrier_id, valor_frete, status")
      .eq("id", freightId)
      .single();

    if (!freight) {
      return NextResponse.json({ error: "Frete nao encontrado" }, { status: 404 });
    }
    if (freight.shipper_id !== user.id) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }
    if (freight.status !== "accepted") {
      return NextResponse.json({ error: "Frete nao esta em status de pagamento" }, { status: 400 });
    }
    if (!freight.selected_carrier_id) {
      return NextResponse.json({ error: "Nenhum transportador selecionado" }, { status: 400 });
    }

    // Check if payment already exists
    const admin = createAdminClient();
    const { data: existingPayment } = await admin
      .from("payments")
      .select("id, stripe_payment_intent_id, status")
      .eq("freight_id", freightId)
      .maybeSingle();

    if (existingPayment && existingPayment.stripe_payment_intent_id && existingPayment.status === "processing") {
      // Return existing payment intent
      const intent = await stripe.paymentIntents.retrieve(existingPayment.stripe_payment_intent_id);
      return NextResponse.json({ clientSecret: intent.client_secret, paymentId: existingPayment.id });
    }

    // Calculate amounts (in centavos)
    const amountTotal = Math.round(freight.valor_frete * 100);
    const platformFee = calculatePlatformFee(amountTotal);
    const carrierPayout = amountTotal - platformFee;

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountTotal,
      currency: "brl",
      payment_method_types: ["card"],
      metadata: {
        freight_id: freightId,
        shipper_id: freight.shipper_id,
        carrier_id: freight.selected_carrier_id,
      },
      description: `Frete Bem+ - Frete #${freightId.slice(0, 8)}`,
    });

    // Upsert payment record
    const { data: payment, error: paymentError } = await admin
      .from("payments")
      .upsert({
        freight_id: freightId,
        shipper_id: freight.shipper_id,
        carrier_id: freight.selected_carrier_id,
        stripe_payment_intent_id: paymentIntent.id,
        amount_total: amountTotal,
        platform_fee: platformFee,
        carrier_payout_amount: carrierPayout,
        status: "processing",
      }, { onConflict: "freight_id" })
      .select("id")
      .single();

    if (paymentError) {
      console.error("Payment record error:", paymentError);
      return NextResponse.json({ error: "Erro ao registrar pagamento" }, { status: 500 });
    }

    // Update freight status to awaiting_payment
    await admin
      .from("freights")
      .update({ status: "awaiting_payment" })
      .eq("id", freightId);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id,
    });
  } catch (err) {
    console.error("create-payment-intent error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
