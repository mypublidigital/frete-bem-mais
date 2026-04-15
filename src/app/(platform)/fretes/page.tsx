import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listFreights } from "@/actions/freight";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BR_STATES } from "@/lib/constants";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ uf?: string; natureza?: string }>;
}

export default async function FretesPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const role = user?.user_metadata?.role;

  // Shippers should go to their own freights page
  if (role === "shipper") {
    redirect("/meus-fretes");
  }

  const params = await searchParams;
  const result = await listFreights({ uf: params.uf, natureza: params.natureza });
  const freights = result.freights || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Marketplace de Fretes</h1>
          <p className="text-neutral-500 text-sm mt-1">
            {freights.length} {freights.length === 1 ? "frete disponível" : "fretes disponíveis"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-600">Estado (UF)</label>
          <select
            name="uf"
            defaultValue={params.uf || ""}
            className="h-9 rounded-md border border-neutral-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Todos</option>
            {BR_STATES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-600">Tipo de Carga</label>
          <input
            name="natureza"
            defaultValue={params.natureza || ""}
            placeholder="Ex: grãos, eletro..."
            className="h-9 rounded-md border border-neutral-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-48"
          />
        </div>
        <button
          type="submit"
          className="h-9 px-4 rounded-md bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-700 transition-colors"
        >
          Filtrar
        </button>
        {(params.uf || params.natureza) && (
          <Link
            href="/fretes"
            className="h-9 px-4 rounded-md border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors flex items-center"
          >
            Limpar
          </Link>
        )}
      </form>

      {/* Results */}
      {result.error ? (
        <div className="text-center py-12 text-red-500">{result.error}</div>
      ) : freights.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <p className="text-lg font-medium">Nenhum frete disponível</p>
          <p className="text-sm mt-1">Tente outros filtros ou volte mais tarde</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {freights.map((freight) => (
            <FreightCard key={freight.id} freight={freight} />
          ))}
        </div>
      )}
    </div>
  );
}

function FreightCard({ freight }: { freight: NonNullable<Awaited<ReturnType<typeof listFreights>>["freights"]>[number] }) {
  const retiradaDate = new Date(freight.retirada_data + "T12:00:00").toLocaleDateString("pt-BR");
  const entregaDate = new Date(freight.entrega_data + "T12:00:00").toLocaleDateString("pt-BR");
  const hasApplied = !!freight.my_application;

  return (
    <Card className="hover:border-neutral-300 transition-colors">
      <CardContent className="p-0">
        <div className="p-5 flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Route */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-base font-semibold text-neutral-900">
                {freight.retirada_cidade}/{freight.retirada_uf}
              </span>
              <span className="text-neutral-400">→</span>
              <span className="text-base font-semibold text-neutral-900">
                {freight.entrega_cidade}/{freight.entrega_uf}
              </span>
              {hasApplied && (
                <Badge className="bg-brand-100 text-brand-700 text-xs">
                  Candidatado
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500 mb-3">
              <span>📦 {freight.natureza_carga}</span>
              <span>⚖️ {freight.peso_kg.toLocaleString("pt-BR")} kg</span>
              <span>📐 {freight.volume_m3} m³</span>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500">
              <span>🗓️ Retirada: {retiradaDate}</span>
              <span>🗓️ Entrega: {entregaDate}</span>
              <span>🏢 {freight.shipper?.razao_social}</span>
            </div>
          </div>

          {/* Value + Action */}
          <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 pt-1">
            <div className="text-right">
              <p className="text-xs text-neutral-400">Valor do frete</p>
              <p className="text-xl font-bold text-neutral-900">
                {freight.valor_frete.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
            </div>
            <Link href={`/fretes/${freight.id}`}>
              <Button size="sm" variant={hasApplied ? "outline" : "default"}>
                {hasApplied ? "Ver detalhes" : "Ver e candidatar"}
              </Button>
            </Link>
          </div>
        </div>

        {freight.observacoes && (
          <div className="px-5 pb-4 text-sm text-neutral-500 border-t border-neutral-100 pt-3">
            {freight.observacoes}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
