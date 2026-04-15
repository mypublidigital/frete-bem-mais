export const FREIGHT_STATUS_LABELS: Record<string, string> = {
  published: "Publicado",
  applied: "Com Interessados",
  accepted: "Aceito",
  awaiting_payment: "Aguardando Pagamento",
  paid: "Pago",
  in_transit: "Em Transito",
  delivered: "Entregue",
  completed: "Finalizado",
  cancelled: "Cancelado",
};

export const FREIGHT_STATUS_COLORS: Record<string, string> = {
  published: "bg-blue-100 text-blue-800",
  applied: "bg-yellow-100 text-yellow-800",
  accepted: "bg-purple-100 text-purple-800",
  awaiting_payment: "bg-orange-100 text-orange-800",
  paid: "bg-green-100 text-green-800",
  in_transit: "bg-brand-100 text-brand-800",
  delivered: "bg-emerald-100 text-emerald-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

export const REGISTRATION_STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Reprovado",
};

export const REGISTRATION_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export const ROLE_LABELS: Record<string, string> = {
  shipper: "Embarcador",
  carrier: "Transportador",
  admin: "Administrador",
};

export const PERSON_TYPE_LABELS: Record<string, string> = {
  pf: "Pessoa Fisica",
  pj: "Pessoa Juridica",
};

export const CNH_CATEGORIES = ["A", "B", "C", "D", "E", "AB", "AC", "AD", "AE"] as const;

export const BR_STATES = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapa" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceara" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espirito Santo" },
  { value: "GO", label: "Goias" },
  { value: "MA", label: "Maranhao" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Para" },
  { value: "PB", label: "Paraiba" },
  { value: "PR", label: "Parana" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piaui" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondonia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "Sao Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
] as const;

export const IMPLEMENT_TYPES = [
  "Carreta Bau",
  "Carreta Sider",
  "Carreta Graneleira",
  "Carreta Plataforma",
  "Carreta Tanque",
  "Carreta Refrigerada",
  "Carreta Cegonha",
  "Carreta Prancha",
  "Bitrem",
  "Rodotrem",
  "Truck Bau",
  "Truck Sider",
  "Toco",
  "VLC",
  "Outro",
] as const;

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  processing: "Processando",
  succeeded: "Aprovado",
  payout_triggered: "Payout Iniciado",
  payout_completed: "Payout Concluido",
  failed: "Falhou",
  refunded: "Reembolsado",
};
