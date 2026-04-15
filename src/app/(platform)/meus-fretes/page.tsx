import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMyFreights } from "@/actions/freight";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FREIGHT_STATUS_LABELS, FREIGHT_STATUS_COLORS } from "@/lib/constants";

export default async function MeusFretesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const role = user?.user_metadata?.role;

  if (role === "carrier") {
    return <CarrierApplicationsView userId={user!.id} />;
  }

  return <ShipperFreightsView />;
}

// ── Shipper View ──────────────────────────────────────────────────────────────

async function ShipperFreightsView() {
  const result = await getMyFreights();
  const freights = result.freights || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meus Fretes</h1>
          <p className="text-neutral-500 text-sm mt-1">Gerencie os fretes que você publicou</p>
        </div>
        <Link href="/fretes/novo">
          <Button>+ Publicar Frete</Button>
        </Link>
      </div>

      {result.error ? (
        <div className="text-center py-12 text-red-500">{result.error}</div>
      ) : freights.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <p className="text-lg font-medium">Nenhum frete publicado ainda</p>
          <p className="text-sm mt-1 mb-6">
            Publique seu primeiro frete e receba propostas de transportadores
          </p>
          <Link href="/fretes/novo">
            <Button>Publicar Primeiro Frete</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {freights.map((freight) => {
            const retiradaDate = new Date(freight.retirada_data + "T12:00:00").toLocaleDateString("pt-BR");
            const entregaDate = new Date(freight.entrega_data + "T12:00:00").toLocaleDateString("pt-BR");
            const appCount = (freight as { applications_count?: number }).applications_count || 0;

            return (
              <Card key={freight.id} className="hover:border-neutral-300 transition-colors">
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-neutral-900">
                        {freight.retirada_cidade}/{freight.retirada_uf}
                        <span className="text-neutral-400 mx-2">→</span>
                        {freight.entrega_cidade}/{freight.entrega_uf}
                      </span>
                      <Badge className={FREIGHT_STATUS_COLORS[freight.status]}>
                        {FREIGHT_STATUS_LABELS[freight.status] || freight.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500">
                      <span>📦 {freight.natureza_carga}</span>
                      <span>🗓️ Retirada: {retiradaDate}</span>
                      <span>🗓️ Entrega: {entregaDate}</span>
                      {appCount > 0 && (
                        <span className="text-brand-600 font-medium">
                          👥 {appCount} candidatura{appCount > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2">
                    <div className="text-right">
                      <p className="text-xs text-neutral-400">Valor do frete</p>
                      <p className="text-lg font-bold text-neutral-900">
                        {freight.valor_frete.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                    </div>
                    <Link href={`/fretes/${freight.id}`}>
                      <Button size="sm" variant="outline">Gerenciar</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Carrier View ──────────────────────────────────────────────────────────────

async function CarrierApplicationsView({ userId }: { userId: string }) {
  const supabase = await createClient();

  const { data: applications } = await supabase
    .from("freight_applications")
    .select(`
      id, status, applied_at, vehicle_id,
      freights!inner(
        id, status, natureza_carga, valor_frete,
        retirada_cidade, retirada_uf, retirada_data,
        entrega_cidade, entrega_uf, entrega_data
      )
    `)
    .eq("carrier_id", userId)
    .order("applied_at", { ascending: false });

  const apps = applications || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Minhas Candidaturas</h1>
        <p className="text-neutral-500 text-sm mt-1">
          Fretes em que você se candidatou
        </p>
      </div>

      {apps.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <p className="text-lg font-medium">Nenhuma candidatura ainda</p>
          <p className="text-sm mt-1 mb-6">Explore o marketplace e candidate-se a fretes disponíveis</p>
          <Link href="/fretes">
            <Button>Ver Marketplace</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {apps.map((app) => {
            const freight = app.freights as {
              id: string; status: string; natureza_carga: string; valor_frete: number;
              retirada_cidade: string; retirada_uf: string; retirada_data: string;
              entrega_cidade: string; entrega_uf: string; entrega_data: string;
            };
            const appStatus = app.status as string;
            const retiradaDate = new Date(freight.retirada_data + "T12:00:00").toLocaleDateString("pt-BR");

            return (
              <Card key={app.id} className="hover:border-neutral-300 transition-colors">
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-neutral-900">
                        {freight.retirada_cidade}/{freight.retirada_uf}
                        <span className="text-neutral-400 mx-2">→</span>
                        {freight.entrega_cidade}/{freight.entrega_uf}
                      </span>
                      <Badge className={
                        appStatus === "accepted" ? "bg-green-100 text-green-800" :
                        appStatus === "rejected" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"
                      }>
                        {appStatus === "accepted" ? "Aceita" :
                         appStatus === "rejected" ? "Recusada" : "Em análise"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500">
                      <span>📦 {freight.natureza_carga}</span>
                      <span>🗓️ Retirada: {retiradaDate}</span>
                      <span>Candidatado em {new Date(app.applied_at).toLocaleDateString("pt-BR")}</span>
                    </div>
                    {appStatus === "accepted" && (
                      <p className="text-sm text-green-700 font-medium mt-2">
                        ✓ Aguarde o pagamento do embarcador para prosseguir
                      </p>
                    )}
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2">
                    <div className="text-right">
                      <p className="text-xs text-neutral-400">Valor do frete</p>
                      <p className="text-lg font-bold text-neutral-900">
                        {freight.valor_frete.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                    </div>
                    <Link href={`/fretes/${freight.id}`}>
                      <Button size="sm" variant="outline">Ver frete</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
