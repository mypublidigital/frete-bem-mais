-- Payments (escrow tracking)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  freight_id UUID NOT NULL UNIQUE REFERENCES freights(id),
  shipper_id UUID NOT NULL REFERENCES profiles(id),
  carrier_id UUID NOT NULL REFERENCES profiles(id),
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  amount_total INTEGER NOT NULL, -- BRL centavos
  platform_fee INTEGER NOT NULL DEFAULT 0,
  carrier_payout_amount INTEGER NOT NULL DEFAULT 0,
  status payment_status NOT NULL DEFAULT 'pending',
  payout_triggered_at TIMESTAMPTZ,
  payout_completed_at TIMESTAMPTZ,
  stripe_transfer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_freight ON payments(freight_id);
CREATE INDEX idx_payments_status ON payments(status);
