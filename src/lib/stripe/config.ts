import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiVersion: "2025-03-31.basil" as any,
  typescript: true,
});

export const PLATFORM_FEE_PERCENT = Number(
  process.env.STRIPE_PLATFORM_FEE_PERCENT || "10"
);

export function calculatePlatformFee(amountCentavos: number): number {
  return Math.round(amountCentavos * (PLATFORM_FEE_PERCENT / 100));
}
