-- Vehicles
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_id UUID NOT NULL REFERENCES carrier_profiles(id) ON DELETE CASCADE,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  ano INTEGER NOT NULL CHECK (ano >= 1980 AND ano <= extract(year from now()) + 1),
  placa TEXT NOT NULL,
  renavam TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vehicles_carrier ON vehicles(carrier_id);

-- Implements
CREATE TABLE implements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  capacidade_kg NUMERIC(10,2) NOT NULL DEFAULT 0,
  comprimento_m NUMERIC(5,2) DEFAULT 0,
  largura_m NUMERIC(5,2) DEFAULT 0,
  altura_m NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_implements_vehicle ON implements(vehicle_id);

-- Implement photos
CREATE TABLE implement_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  implement_id UUID NOT NULL REFERENCES implements(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_implement_photos_implement ON implement_photos(implement_id);
