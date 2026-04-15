-- Profiles: extends auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  status registration_status NOT NULL DEFAULT 'pending',
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Shipper profiles
CREATE TABLE shipper_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  cnpj TEXT NOT NULL UNIQUE,
  razao_social TEXT NOT NULL,
  endereco_cep TEXT NOT NULL,
  endereco_logradouro TEXT NOT NULL,
  endereco_numero TEXT NOT NULL,
  endereco_complemento TEXT,
  endereco_bairro TEXT NOT NULL,
  endereco_cidade TEXT NOT NULL,
  endereco_uf TEXT NOT NULL CHECK (length(endereco_uf) = 2),
  responsavel_nome TEXT NOT NULL,
  responsavel_cargo TEXT,
  natureza_cargas TEXT NOT NULL,
  valor_medio_carga NUMERIC(12,2) DEFAULT 0
);

-- Carrier profiles
CREATE TABLE carrier_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  person_type person_type NOT NULL,
  cpf TEXT,
  nome_completo TEXT,
  cnpj TEXT,
  razao_social TEXT,
  cnh_numero TEXT NOT NULL,
  cnh_categoria TEXT NOT NULL,
  cnh_validade DATE NOT NULL,
  cnh_documento_url TEXT,
  seguro_apolice TEXT NOT NULL,
  seguro_seguradora TEXT NOT NULL,
  endereco_cep TEXT,
  endereco_cidade TEXT,
  endereco_uf TEXT,
  CONSTRAINT chk_pf CHECK (
    person_type != 'pf' OR (cpf IS NOT NULL AND nome_completo IS NOT NULL)
  ),
  CONSTRAINT chk_pj CHECK (
    person_type != 'pj' OR (cnpj IS NOT NULL AND razao_social IS NOT NULL)
  )
);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
