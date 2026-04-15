-- Custom ENUMs for Frete Bem+
CREATE TYPE user_role AS ENUM ('shipper', 'carrier', 'admin');
CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE person_type AS ENUM ('pf', 'pj');

CREATE TYPE freight_status AS ENUM (
  'published',
  'applied',
  'accepted',
  'awaiting_payment',
  'paid',
  'in_transit',
  'delivered',
  'completed',
  'cancelled'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'processing',
  'succeeded',
  'payout_triggered',
  'payout_completed',
  'failed',
  'refunded'
);

CREATE TYPE cnh_category AS ENUM ('A','B','C','D','E','AB','AC','AD','AE');
