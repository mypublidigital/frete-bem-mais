import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, DollarSign, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FREIGHT_STATUS_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function PainelPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const role = user.user_metadata?.role;

  if (role === "shipper") {
    return <ShipperDashboard userId={user.id} />;
  }

  return <CarrierDashboard userId={user.id} />;
}

async function ShipperDashboard({ userId }: { userId: string }) {
  const supabase = await createClient();

  const { count: totalFreights } = await supabase
    .from("freights")
    .select("*", { count: "exact", head: true })
    .eq("shipper_id", userId);

  const { count: activeFreights } = await supabase
    .from("freights")
    .select("*", { count: "exact", head: true })
    .eq("shipper_id", userId)
    .in("status", ["published", "applied", "accepted", "awaiting_payment", "paid", "in_transit"]);

  const { data: recentFreights } = await supabase
    .from("freights")
    .select("*")
    .eq("shipper_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Painel</h1>
        <Link href="/fretes/novo">
          <Button>Publicar Frete</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-brand-50 flex items-center justify-center">
              <Package className="h-6 w-6 text-brand-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalFreights || 0}</p>
              <p className="text-sm text-neutral-500">Total de Fretes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
              <Truck className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeFreights || 0}</p>
              <p className="text-sm text-neutral-500">Fretes Ativos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fretes Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {!recentFreights || recentFreights.length === 0 ? (
            <p className="text-sm text-neutral-500 py-4 text-center">
              Nenhum frete publicado ainda.{" "}
              <Link href="/fretes/novo" className="text-brand-500 hover:text-brand-600">
                Publicar agora
              </Link>
            </p>
          ) : (
            <div className="space-y-3">
              {recentFreights.map((freight) => (
                <Link
                  key={freight.id}
                  href={`/fretes/${freight.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{freight.natureza_carga}</p>
                    <p className="text-xs text-neutral-500">
                      {freight.retirada_cidade}/{freight.retirada_uf} → {freight.entrega_cidade}/{freight.entrega_uf}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(freight.valor_frete)}</p>
                    <Badge className={`text-xs ${freight.status}`}>
                      {FREIGHT_STATUS_LABELS[freight.status]}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

async function CarrierDashboard({ userId }: { userId: string }) {
  const supabase = await createClient();

  const { count: availableFreights } = await supabase
    .from("freights")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");

  const { count: myApplications } = await supabase
    .from("freight_applications")
    .select("*", { count: "exact", head: true })
    .eq("carrier_id", userId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Painel</h1>
        <Link href="/fretes">
          <Button>Ver Marketplace</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
              <Package className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{availableFreights || 0}</p>
              <p className="text-sm text-neutral-500">Fretes Disponiveis</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-brand-50 flex items-center justify-center">
              <Clock className="h-6 w-6 text-brand-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{myApplications || 0}</p>
              <p className="text-sm text-neutral-500">Minhas Candidaturas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comece Agora</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-500 mb-4">
            Explore o marketplace para encontrar fretes compativeis com seu veiculo.
          </p>
          <Link href="/fretes">
            <Button variant="outline">Explorar Fretes</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
