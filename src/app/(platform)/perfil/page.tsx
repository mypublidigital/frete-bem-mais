import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Building2, Truck, Calendar, FileText } from "lucide-react";
import {
  REGISTRATION_STATUS_LABELS,
  REGISTRATION_STATUS_COLORS,
  ROLE_LABELS,
  CNH_CATEGORIES,
} from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const role = user.user_metadata?.role as "shipper" | "carrier";

  const { data: profile } = await supabase
    .from("profiles")
    .select("status, email, phone, created_at")
    .eq("id", user.id)
    .single();

  if (role === "shipper") {
    const { data: shipperProfile } = await supabase
      .from("shipper_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return (
      <ShipperProfileView
        profile={profile}
        shipperProfile={shipperProfile}
        email={user.email || ""}
      />
    );
  }

  const { data: carrierProfile } = await supabase
    .from("carrier_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, placa, tipo_implemento, capacidade_ton, created_at")
    .eq("carrier_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <CarrierProfileView
      profile={profile}
      carrierProfile={carrierProfile}
      vehicles={vehicles || []}
      email={user.email || ""}
    />
  );
}

function ProfileField({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-neutral-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-neutral-800">{value}</p>
    </div>
  );
}

function ShipperProfileView({
  profile,
  shipperProfile,
  email,
}: {
  profile: { status: string; phone?: string | null; created_at: string } | null;
  shipperProfile: {
    razao_social: string;
    cnpj: string;
    responsavel_nome: string;
    responsavel_cargo?: string | null;
    endereco_logradouro: string;
    endereco_numero: string;
    endereco_complemento?: string | null;
    endereco_bairro: string;
    endereco_cidade: string;
    endereco_uf: string;
    endereco_cep: string;
    natureza_cargas: string;
    valor_medio_carga?: number | null;
  } | null;
  email: string;
}) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Meu Perfil</h1>
        {profile?.status && (
          <Badge className={REGISTRATION_STATUS_COLORS[profile.status]}>
            {REGISTRATION_STATUS_LABELS[profile.status]}
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-neutral-500" />
            Dados da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ProfileField label="Razão Social" value={shipperProfile?.razao_social} />
          <ProfileField label="CNPJ" value={shipperProfile?.cnpj} />
          <ProfileField label="Responsável" value={shipperProfile?.responsavel_nome} />
          <ProfileField label="Cargo" value={shipperProfile?.responsavel_cargo} />
          <ProfileField label="Natureza das Cargas" value={shipperProfile?.natureza_cargas} />
          {shipperProfile?.valor_medio_carga && (
            <ProfileField
              label="Valor Médio da Carga"
              value={(shipperProfile.valor_medio_carga).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4 text-neutral-500" />
            Contato
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ProfileField label="E-mail" value={email} />
          <ProfileField label="Telefone" value={profile?.phone} />
        </CardContent>
      </Card>

      {shipperProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-neutral-500" />
              Endereço
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ProfileField
              label="Logradouro"
              value={`${shipperProfile.endereco_logradouro}, ${shipperProfile.endereco_numero}${shipperProfile.endereco_complemento ? ` – ${shipperProfile.endereco_complemento}` : ""}`}
            />
            <ProfileField label="Bairro" value={shipperProfile.endereco_bairro} />
            <ProfileField label="Cidade/UF" value={`${shipperProfile.endereco_cidade}/${shipperProfile.endereco_uf}`} />
            <ProfileField label="CEP" value={shipperProfile.endereco_cep} />
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-neutral-400">
        Membro desde {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("pt-BR") : "–"}
        {" · "}
        {ROLE_LABELS["shipper"]}
      </p>
    </div>
  );
}

function CarrierProfileView({
  profile,
  carrierProfile,
  vehicles,
  email,
}: {
  profile: { status: string; phone?: string | null; created_at: string } | null;
  carrierProfile: {
    person_type: string;
    cpf?: string | null;
    nome_completo?: string | null;
    cnpj?: string | null;
    razao_social?: string | null;
    cnh_numero: string;
    cnh_categoria: string;
    cnh_validade: string;
    seguro_apolice: string;
    seguro_seguradora: string;
    endereco_cidade?: string | null;
    endereco_uf?: string | null;
    endereco_cep?: string | null;
  } | null;
  vehicles: { id: string; placa: string; tipo_implemento: string; capacidade_ton: number }[];
  email: string;
}) {
  const name = carrierProfile?.nome_completo || carrierProfile?.razao_social || "–";

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Meu Perfil</h1>
        {profile?.status && (
          <Badge className={REGISTRATION_STATUS_COLORS[profile.status]}>
            {REGISTRATION_STATUS_LABELS[profile.status]}
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4 text-neutral-500" />
            Dados Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ProfileField label="Nome / Razão Social" value={name} />
          {carrierProfile?.cpf && <ProfileField label="CPF" value={carrierProfile.cpf} />}
          {carrierProfile?.cnpj && <ProfileField label="CNPJ" value={carrierProfile.cnpj} />}
          <ProfileField label="E-mail" value={email} />
          <ProfileField label="Telefone" value={profile?.phone} />
          {carrierProfile?.endereco_cidade && (
            <ProfileField
              label="Cidade/UF"
              value={`${carrierProfile.endereco_cidade}/${carrierProfile.endereco_uf}`}
            />
          )}
        </CardContent>
      </Card>

      {carrierProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-neutral-500" />
              CNH e Seguro
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ProfileField label="Número da CNH" value={carrierProfile.cnh_numero} />
            <ProfileField label="Categoria" value={carrierProfile.cnh_categoria} />
            <ProfileField
              label="Validade"
              value={new Date(carrierProfile.cnh_validade + "T12:00:00").toLocaleDateString("pt-BR")}
            />
            <ProfileField label="Seguradora" value={carrierProfile.seguro_seguradora} />
            <ProfileField label="Apólice" value={carrierProfile.seguro_apolice} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="h-4 w-4 text-neutral-500" />
            Veículos ({vehicles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vehicles.length === 0 ? (
            <p className="text-sm text-neutral-500 py-2">Nenhum veículo cadastrado.</p>
          ) : (
            <div className="divide-y divide-neutral-100">
              {vehicles.map((v) => (
                <div key={v.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium font-mono">{v.placa}</p>
                    <p className="text-xs text-neutral-500">{v.tipo_implemento}</p>
                  </div>
                  <p className="text-sm text-neutral-600">{v.capacidade_ton} ton</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-neutral-400">
        Membro desde {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("pt-BR") : "–"}
        {" · "}
        {ROLE_LABELS["carrier"]}
      </p>
    </div>
  );
}
