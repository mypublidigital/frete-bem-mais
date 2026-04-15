"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ROLE_LABELS, REGISTRATION_STATUS_LABELS, REGISTRATION_STATUS_COLORS, PERSON_TYPE_LABELS } from "@/lib/constants";
import { formatDate, maskCPF, maskCNPJ } from "@/lib/utils";
import { approveRegistration, rejectRegistration } from "@/actions/admin";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Check, X } from "lucide-react";
import Link from "next/link";

export default function AdminCadastroDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [roleProfile, setRoleProfile] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const id = params.id as string;

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      setProfile(prof);

      if (prof?.role === "shipper") {
        const { data } = await supabase
          .from("shipper_profiles")
          .select("*")
          .eq("id", id)
          .single();
        setRoleProfile(data);
      } else if (prof?.role === "carrier") {
        const { data } = await supabase
          .from("carrier_profiles")
          .select("*")
          .eq("id", id)
          .single();
        setRoleProfile(data);

        const { data: vehs } = await supabase
          .from("vehicles")
          .select("*, implements(*)")
          .eq("carrier_id", id);
        setVehicles(vehs || []);
      }

      setLoading(false);
    }
    loadData();
  }, [params.id]);

  async function handleApprove() {
    setApproving(true);
    const result = await approveRegistration(params.id as string);
    if (result?.error) {
      toast({ type: "error", title: result.error });
    } else {
      toast({ type: "success", title: "Cadastro aprovado com sucesso!" });
      router.push("/admin/cadastros");
    }
    setApproving(false);
  }

  async function handleReject() {
    if (!rejectReason.trim()) return;
    setRejecting(true);
    const result = await rejectRegistration(params.id as string, rejectReason);
    if (result?.error) {
      toast({ type: "error", title: result.error });
    } else {
      toast({ type: "success", title: "Cadastro reprovado." });
      setShowRejectDialog(false);
      router.push("/admin/cadastros");
    }
    setRejecting(false);
  }

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-neutral-200 rounded w-48" />
      <div className="h-64 bg-neutral-200 rounded" />
    </div>;
  }

  if (!profile) {
    return <p className="text-neutral-500">Cadastro nao encontrado.</p>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/cadastros" className="text-neutral-400 hover:text-neutral-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-neutral-900">
            {roleProfile?.razao_social || roleProfile?.nome_completo || profile.email}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary">{ROLE_LABELS[profile.role]}</Badge>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${REGISTRATION_STATUS_COLORS[profile.status]}`}>
              {REGISTRATION_STATUS_LABELS[profile.status]}
            </span>
          </div>
        </div>

        {profile.status === "pending" && (
          <div className="flex gap-2">
            <Button onClick={handleApprove} loading={approving} className="bg-green-600 hover:bg-green-700">
              <Check className="h-4 w-4 mr-1" /> Aprovar
            </Button>
            <Button variant="destructive" onClick={() => setShowRejectDialog(true)}>
              <X className="h-4 w-4 mr-1" /> Reprovar
            </Button>
          </div>
        )}
      </div>

      {/* Profile data */}
      <Card>
        <CardHeader>
          <CardTitle>Dados do Cadastro</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="font-medium text-neutral-500">E-mail</dt>
              <dd className="text-neutral-900">{profile.email}</dd>
            </div>
            <div>
              <dt className="font-medium text-neutral-500">Telefone</dt>
              <dd className="text-neutral-900">{profile.phone || "-"}</dd>
            </div>

            {profile.role === "shipper" && roleProfile && (
              <>
                <div>
                  <dt className="font-medium text-neutral-500">CNPJ</dt>
                  <dd className="text-neutral-900">{maskCNPJ(roleProfile.cnpj)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-neutral-500">Razao Social</dt>
                  <dd className="text-neutral-900">{roleProfile.razao_social}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-medium text-neutral-500">Endereco</dt>
                  <dd className="text-neutral-900">
                    {roleProfile.endereco_logradouro}, {roleProfile.endereco_numero}
                    {roleProfile.endereco_complemento && ` - ${roleProfile.endereco_complemento}`}
                    {" - "}{roleProfile.endereco_bairro}, {roleProfile.endereco_cidade}/{roleProfile.endereco_uf}
                    {" - CEP "}{roleProfile.endereco_cep}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-neutral-500">Responsavel</dt>
                  <dd className="text-neutral-900">{roleProfile.responsavel_nome}</dd>
                </div>
                <div>
                  <dt className="font-medium text-neutral-500">Natureza das Cargas</dt>
                  <dd className="text-neutral-900">{roleProfile.natureza_cargas}</dd>
                </div>
              </>
            )}

            {profile.role === "carrier" && roleProfile && (
              <>
                <div>
                  <dt className="font-medium text-neutral-500">Tipo</dt>
                  <dd className="text-neutral-900">{PERSON_TYPE_LABELS[roleProfile.person_type]}</dd>
                </div>
                <div>
                  <dt className="font-medium text-neutral-500">
                    {roleProfile.person_type === "pf" ? "CPF" : "CNPJ"}
                  </dt>
                  <dd className="text-neutral-900">
                    {roleProfile.person_type === "pf"
                      ? maskCPF(roleProfile.cpf)
                      : maskCNPJ(roleProfile.cnpj)}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-neutral-500">CNH</dt>
                  <dd className="text-neutral-900">
                    {roleProfile.cnh_numero} - Cat. {roleProfile.cnh_categoria}
                    {" - Val. "}{formatDate(roleProfile.cnh_validade)}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-neutral-500">Seguro</dt>
                  <dd className="text-neutral-900">
                    {roleProfile.seguro_apolice} ({roleProfile.seguro_seguradora})
                  </dd>
                </div>
              </>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Vehicles (carrier only) */}
      {vehicles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Veiculos</CardTitle>
          </CardHeader>
          <CardContent>
            {vehicles.map((v) => (
              <div key={v.id} className="border border-neutral-200 rounded-lg p-4 mb-3 last:mb-0">
                <p className="font-medium">{v.marca} {v.modelo} ({v.ano})</p>
                <p className="text-sm text-neutral-500">Placa: {v.placa} | RENAVAM: {v.renavam}</p>
                {v.implements?.map((impl: any) => (
                  <p key={impl.id} className="text-sm text-neutral-500 mt-1">
                    Implemento: {impl.tipo} - {impl.capacidade_kg}kg
                  </p>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Reject dialog */}
      <Dialog open={showRejectDialog} onClose={() => setShowRejectDialog(false)}>
        <DialogTitle>Reprovar Cadastro</DialogTitle>
        <DialogDescription>
          Informe o motivo da reprovacao. O usuario sera notificado por e-mail.
        </DialogDescription>
        <Textarea
          label="Justificativa"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Descreva o motivo da reprovacao..."
          required
        />
        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={() => setShowRejectDialog(false)} className="flex-1">
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            loading={rejecting}
            disabled={!rejectReason.trim()}
            className="flex-1"
          >
            Confirmar Reprovacao
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
