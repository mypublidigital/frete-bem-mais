export type UserRole = "shipper" | "carrier" | "admin";
export type RegistrationStatus = "pending" | "approved" | "rejected";
export type PersonType = "pf" | "pj";

export type FreightStatus =
  | "published"
  | "applied"
  | "accepted"
  | "awaiting_payment"
  | "paid"
  | "in_transit"
  | "delivered"
  | "completed"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "succeeded"
  | "payout_triggered"
  | "payout_completed"
  | "failed"
  | "refunded";

export interface UserProfile {
  id: string;
  role: UserRole;
  status: RegistrationStatus;
  email: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShipperProfile {
  id: string;
  cnpj: string;
  razao_social: string;
  endereco_cep: string;
  endereco_logradouro: string;
  endereco_numero: string;
  endereco_complemento: string | null;
  endereco_bairro: string;
  endereco_cidade: string;
  endereco_uf: string;
  responsavel_nome: string;
  responsavel_cargo: string | null;
  natureza_cargas: string;
  valor_medio_carga: number;
}

export interface CarrierProfile {
  id: string;
  person_type: PersonType;
  cpf: string | null;
  nome_completo: string | null;
  cnpj: string | null;
  razao_social: string | null;
  cnh_numero: string;
  cnh_categoria: string;
  cnh_validade: string;
  cnh_documento_url: string | null;
  seguro_apolice: string;
  seguro_seguradora: string;
  endereco_cep: string | null;
  endereco_cidade: string | null;
  endereco_uf: string | null;
}

export interface Vehicle {
  id: string;
  carrier_id: string;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  renavam: string;
  is_active: boolean;
}

export interface Implement {
  id: string;
  vehicle_id: string;
  tipo: string;
  capacidade_kg: number;
  comprimento_m: number;
  largura_m: number;
  altura_m: number;
}

export interface Freight {
  id: string;
  shipper_id: string;
  status: FreightStatus;
  natureza_carga: string;
  especificacao: string;
  volume_m3: number;
  peso_kg: number;
  valor_carga: number;
  valor_frete: number;
  retirada_endereco: string;
  retirada_cidade: string;
  retirada_uf: string;
  retirada_cep: string;
  retirada_data: string;
  retirada_horario_inicio: string | null;
  retirada_horario_fim: string | null;
  entrega_endereco: string;
  entrega_cidade: string;
  entrega_uf: string;
  entrega_cep: string;
  entrega_data: string;
  observacoes: string | null;
  selected_carrier_id: string | null;
  selected_vehicle_id: string | null;
  published_at: string | null;
  accepted_at: string | null;
  paid_at: string | null;
  boarded_at: string | null;
  delivered_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
}

export interface FreightApplication {
  id: string;
  freight_id: string;
  carrier_id: string;
  vehicle_id: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  applied_at: string;
  responded_at: string | null;
}

export interface Payment {
  id: string;
  freight_id: string;
  shipper_id: string;
  carrier_id: string;
  stripe_payment_intent_id: string;
  stripe_charge_id: string | null;
  amount_total: number;
  platform_fee: number;
  carrier_payout_amount: number;
  status: PaymentStatus;
  payout_triggered_at: string | null;
  payout_completed_at: string | null;
  stripe_transfer_id: string | null;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  actor_id: string | null;
  actor_role: UserRole;
  entity_type: string;
  entity_id: string;
  action: string;
  old_status: string | null;
  new_status: string | null;
  reason: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  is_read: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
