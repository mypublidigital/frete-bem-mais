-- Freights
CREATE TABLE freights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipper_id UUID NOT NULL REFERENCES shipper_profiles(id),
  status freight_status NOT NULL DEFAULT 'published',
  natureza_carga TEXT NOT NULL,
  especificacao TEXT NOT NULL,
  volume_m3 NUMERIC(10,2) NOT NULL,
  peso_kg NUMERIC(10,2) NOT NULL,
  valor_carga NUMERIC(12,2) NOT NULL,
  valor_frete NUMERIC(12,2) NOT NULL,
  retirada_endereco TEXT NOT NULL,
  retirada_cidade TEXT NOT NULL,
  retirada_uf TEXT NOT NULL CHECK (length(retirada_uf) = 2),
  retirada_cep TEXT NOT NULL,
  retirada_data DATE NOT NULL,
  retirada_horario_inicio TIME,
  retirada_horario_fim TIME,
  entrega_endereco TEXT NOT NULL,
  entrega_cidade TEXT NOT NULL,
  entrega_uf TEXT NOT NULL CHECK (length(entrega_uf) = 2),
  entrega_cep TEXT NOT NULL,
  entrega_data DATE NOT NULL,
  observacoes TEXT,
  selected_carrier_id UUID REFERENCES carrier_profiles(id),
  selected_vehicle_id UUID REFERENCES vehicles(id),
  published_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  boarded_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_freights_shipper ON freights(shipper_id);
CREATE INDEX idx_freights_status ON freights(status);
CREATE INDEX idx_freights_carrier ON freights(selected_carrier_id);

-- Freight applications
CREATE TABLE freight_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  freight_id UUID NOT NULL REFERENCES freights(id) ON DELETE CASCADE,
  carrier_id UUID NOT NULL REFERENCES carrier_profiles(id),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ,
  UNIQUE(freight_id, carrier_id)
);

CREATE INDEX idx_freight_applications_freight ON freight_applications(freight_id);
CREATE INDEX idx_freight_applications_carrier ON freight_applications(carrier_id);
