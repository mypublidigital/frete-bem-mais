"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { FREIGHT_STATUS_LABELS, FREIGHT_STATUS_COLORS } from "@/lib/constants";
import { getFreightDetail, applyToFreight, acceptApplication, cancelFreight } from "@/actions/freight";
import { confirmBoarding, confirmDelivery } from "@/actions/payment";
import { createClient } from "@/lib/supabase/client";

type FreightDetail = NonNullable<Awaited<ReturnType<typeof getFreightDetail>>["freight"]>;
type ApplicationsList = NonNullable<Awaited<ReturnType<typeof getFreightDetail>>["applications"]>;

export default function FreightDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const freightId = params.id as string;

  const [freight, setFreight] = useState<FreightDetail | null>(null);
  const [applications, setApplications] = useState<ApplicationsList | null>(null);
  const [myApplication, setMyApplication] = useState<{ id: string; status: string; vehicle_id: string } | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<{ id: string; marca: string; modelo: string; placa: string }[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  async function loadData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.user_metadata?.role;
    setUserRole(role);

    const result = await getFreightDetail(freightId);
    if (result.error || !result.freight) {
      toast({ type: "error", title: result.error || "Frete não encontrado." });
      router.push(role === "shipper" ? "/meus-fretes" : "/fretes");
      return;
    }

    setFreight(result.freight as FreightDetail);
    setApplications(result.applications);
    setMyApplication(result.myApplication);

    if (role === "carrier") {
      const { data: vList } = await supabase
        .from("vehicles")
        .select("id, marca, modelo, placa")
        .eq("carrier_id", user!.id);
      setVehicles(vList || []);
      if (vList && vList.length > 0) setSelectedVehicle(vList[0].id);
    }

    setLoading(false);
  }

  useEffect(() => { loadData(); }, [freightId]);

  async function handleApply() {
    if (!selectedVehicle) {
      toast({ type: "error", title: "Selecione um veículo." });
      return;
    }
    setActionLoading(true);
    const result = await applyToFreight(freightId, selectedVehicle);
    if (result.error) {
      toast({ type: "error", title: result.error });
    } else {
      toast({ type: "success", title: "Candidatura enviada com sucesso!" });
      loadData();
    }
    setActionLoading(false);
  }

  async function handleAccept(applicationId: string) {
    setActionLoading(true);
    const result = await acceptApplication(freightId, applicationId);
    if (result.error) {
      toast({ type: "error", title: result.error });
    } else {
      toast({ type: "success", title: "Transportador selecionado! Agora realize o pagamento." });
      loadData();
    }
    setActionLoading(false);
  }

  async function handleCancel() {
    if (!confirm("Deseja cancelar este frete?")) return;
    setActionLoading(true);
    const result = await cancelFreight(freightId);
    if (result.error) {
      toast({ type: "error", title: result.error });
    } else {
      toast({ type: "success", title: "Frete cancelado." });
      router.push("/meus-fretes");
    }
    setActionLoading(false);
  }

  async function handleConfirmBoarding() {
    if (!confirm("Confirmar que a carga foi embarcada? O pagamento será liberado ao transportador.")) return;
    setActionLoading(true);
    const result = await confirmBoarding(freightId);
    if (result.error) {
      toast({ type: "error", title: result.error });
    } else {
      toast({ type: "success", title: "Embarque confirmado! Transportador notificado." });
      loadData();
    }
    setActionLoading(false);
  }

  async function handleConfirmDelivery() {
    if (!confirm("Confirmar que a carga foi entregue?")) return;
    setActionLoading(true);
    const result = await confirmDelivery(freightId);
    if (result.error) {
      toast({ type: "error", title: result.error });
    } else {
      toast({ type: "success", title: "Entrega confirmada!" });
      loadData();
    }
    setActionLoading(false);
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!freight) return null;

  const retiradaDate = new Date(freight.retirada_data + "T12:00:00").toLocaleDateString("pt-BR");
  const entregaDate = new Date(freight.entrega_data + "T12:00:00").toLocaleDateString("pt-BR");
  const isOwner = userRole === "shipper";
  const isCarrier = userRole === "carrier";
  const canApply = isCarrier && !myApplication && ["published", "applied"].includes(freight.status);
  const canAccept = isOwner && ["published", "applied"].includes(freight.status);
  const canCancel = isOwner && !["paid", "in_transit", "delivered", "completed", "cancelled"].includes(freight.status);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href={isOwner ? "/meus-fretes" : "/fretes"}
          className="text-sm text-neutral-500 hover:text-neutral-700"
        >
          ← {isOwner ? "Meus Fretes" : "Marketplace"}
        </Link>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-2xl font-bold">
            {freight.retirada_cidade}/{freight.retirada_uf}
            <span className="text-neutral-400 mx-2">→</span>
            {freight.entrega_cidade}/{freight.entrega_uf}
          </h1>
          <Badge className={FREIGHT_STATUS_COLORS[freight.status]}>
            {FREIGHT_STATUS_LABELS[freight.status] || freight.status}
          </Badge>
        </div>
      </div>

      {/* PII Alert */}
      {!freight.pii_revealed && !isOwner && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          🔒 Informações de contato e endereços completos serão revelados após o pagamento.
        </div>
      )}

      {/* Cargo Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações da Carga</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <InfoItem label="Natureza" value={freight.natureza_carga} />
          <InfoItem label="Peso" value={`${freight.peso_kg.toLocaleString("pt-BR")} kg`} />
          <InfoItem label="Volume" value={`${freight.volume_m3} m³`} />
          <InfoItem label="Valor da Carga" value={freight.valor_carga.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
          <InfoItem label="Valor do Frete" value={<span className="text-lg font-bold text-brand-600">{freight.valor_frete.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>} />
          {freight.observacoes && <InfoItem label="Observações" value={freight.observacoes} className="col-span-full" />}
          <div className="col-span-full">
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">Especificação</p>
            <p className="text-neutral-700">{freight.especificacao}</p>
          </div>
        </CardContent>
      </Card>

      {/* Route */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Retirada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <InfoItem label="Data" value={retiradaDate} />
            {(freight.retirada_horario_inicio || freight.retirada_horario_fim) && (
              <InfoItem
                label="Horário"
                value={`${freight.retirada_horario_inicio || ""} – ${freight.retirada_horario_fim || ""}`}
              />
            )}
            <InfoItem label="Cidade" value={`${freight.retirada_cidade}/${freight.retirada_uf}`} />
            {freight.retirada_endereco ? (
              <>
                <InfoItem label="Endereço" value={freight.retirada_endereco} />
                <InfoItem label="CEP" value={freight.retirada_cep || ""} />
              </>
            ) : (
              <p className="text-neutral-400 italic text-xs">Endereço disponível após pagamento</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Entrega</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <InfoItem label="Data" value={entregaDate} />
            <InfoItem label="Cidade" value={`${freight.entrega_cidade}/${freight.entrega_uf}`} />
            {freight.entrega_endereco ? (
              <>
                <InfoItem label="Endereço" value={freight.entrega_endereco} />
                <InfoItem label="CEP" value={freight.entrega_cep || ""} />
              </>
            ) : (
              <p className="text-neutral-400 italic text-xs">Endereço disponível após pagamento</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Shipper info (masked for carriers) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Embarcador</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <InfoItem label="Empresa" value={(freight.shipper as { razao_social?: string })?.razao_social || "–"} />
          <InfoItem
            label="CNPJ"
            value={(freight.shipper as { cnpj?: string | null })?.cnpj || <span className="text-neutral-400 italic">Disponível após pagamento</span>}
          />
          <InfoItem
            label="Responsável"
            value={(freight.shipper as { responsavel_nome?: string | null })?.responsavel_nome || <span className="text-neutral-400 italic">Disponível após pagamento</span>}
          />
        </CardContent>
      </Card>

      {/* Carrier Apply Section */}
      {isCarrier && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sua Candidatura</CardTitle>
          </CardHeader>
          <CardContent>
            {myApplication ? (
              <div className="flex items-center gap-3">
                <Badge className={
                  myApplication.status === "accepted" ? "bg-green-100 text-green-800" :
                  myApplication.status === "rejected" ? "bg-red-100 text-red-800" :
                  "bg-yellow-100 text-yellow-800"
                }>
                  {myApplication.status === "accepted" ? "Aceita" :
                   myApplication.status === "rejected" ? "Recusada" : "Enviada"}
                </Badge>
                <span className="text-sm text-neutral-500">
                  {myApplication.status === "accepted"
                    ? "Parabéns! Aguarde o pagamento do embarcador."
                    : myApplication.status === "rejected"
                    ? "Sua candidatura foi recusada para este frete."
                    : "Sua candidatura está em análise."}
                </span>
              </div>
            ) : canApply ? (
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Select
                    label="Selecione o veículo"
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    options={vehicles.map((v) => ({
                      value: v.id,
                      label: `${v.marca} ${v.modelo} • ${v.placa}`,
                    }))}
                    placeholder="Selecione..."
                  />
                </div>
                <Button onClick={handleApply} loading={actionLoading} disabled={!selectedVehicle}>
                  Candidatar-se
                </Button>
              </div>
            ) : (
              <p className="text-sm text-neutral-500">
                Este frete não está mais disponível para candidaturas.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Shipper: Applications List */}
      {isOwner && applications !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Candidaturas ({applications.filter((a) => a.status === "pending").length} pendentes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <p className="text-sm text-neutral-400">Nenhuma candidatura ainda.</p>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => {
                  const carrier = app.carrier_profiles as { nome_completo?: string; razao_social?: string; cnh_categoria?: string } | null;
                  const vehicle = app.vehicles as { marca?: string; modelo?: string; placa?: string } | null;
                  const carrierName = carrier?.nome_completo || carrier?.razao_social || "Transportador";

                  return (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-neutral-100 bg-neutral-50"
                    >
                      <div>
                        <p className="font-medium text-sm">{carrierName}</p>
                        <p className="text-xs text-neutral-500">
                          CNH {carrier?.cnh_categoria} • {vehicle?.marca} {vehicle?.modelo} ({vehicle?.placa})
                        </p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {new Date(app.applied_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {app.status === "pending" && canAccept ? (
                          <Button
                            size="sm"
                            onClick={() => handleAccept(app.id)}
                            loading={actionLoading}
                          >
                            Aceitar
                          </Button>
                        ) : (
                          <Badge className={
                            app.status === "accepted" ? "bg-green-100 text-green-800" :
                            app.status === "rejected" ? "bg-red-100 text-red-800" :
                            "bg-neutral-100 text-neutral-600"
                          }>
                            {app.status === "accepted" ? "Aceito" :
                             app.status === "rejected" ? "Recusado" : app.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment prompt after acceptance */}
      {isOwner && freight.status === "accepted" && (
        <Card className="border-brand-200 bg-brand-50">
          <CardContent className="p-5">
            <h3 className="font-semibold text-brand-900 mb-1">Transportador Selecionado!</h3>
            <p className="text-sm text-brand-700 mb-4">
              Realize o pagamento para confirmar o frete e revelar os dados de contato do transportador.
            </p>
            <Link href={`/fretes/${freightId}/pagamento`}>
              <Button className="bg-brand-500 hover:bg-brand-600">
                Realizar Pagamento
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Shipper: Confirm Boarding (after payment) */}
      {isOwner && freight.status === "paid" && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-5">
            <h3 className="font-semibold text-green-900 mb-1">Confirmar Embarque</h3>
            <p className="text-sm text-green-700 mb-4">
              A carga foi embarcada pelo transportador? Confirmar libera o pagamento.
            </p>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleConfirmBoarding}
              loading={actionLoading}
            >
              Confirmar Embarque
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Carrier: Confirm Delivery */}
      {isCarrier && freight.status === "in_transit" && myApplication?.status === "accepted" && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-5">
            <h3 className="font-semibold text-blue-900 mb-1">Confirmar Entrega</h3>
            <p className="text-sm text-blue-700 mb-4">
              A carga foi entregue no destino?
            </p>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleConfirmDelivery}
              loading={actionLoading}
            >
              Confirmar Entrega
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Shipper: Cancel */}
      {canCancel && (
        <div className="flex justify-end pt-2 pb-6">
          <Button
            variant="outline"
            className="text-red-500 border-red-200 hover:bg-red-50"
            onClick={handleCancel}
            loading={actionLoading}
          >
            Cancelar Frete
          </Button>
        </div>
      )}
    </div>
  );
}

function InfoItem({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-neutral-800">{value}</p>
    </div>
  );
}
