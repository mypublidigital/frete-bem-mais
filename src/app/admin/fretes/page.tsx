import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { FREIGHT_STATUS_LABELS, FREIGHT_STATUS_COLORS } from "@/lib/constants";

export default async function AdminFretesPage() {
  const admin = createAdminClient();

  const { data: freights } = await admin
    .from("freights")
    .select(`
      id, status, natureza_carga, valor_frete,
      retirada_cidade, retirada_uf, retirada_data,
      entrega_cidade, entrega_uf, entrega_data,
      published_at, created_at,
      shipper_profiles!inner(razao_social),
      carrier_profiles(nome_completo, razao_social)
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const freightsList = (freights || []) as any[];
  const statusCounts: Record<string, number> = {};
  freightsList.forEach((f) => {
    statusCounts[f.status] = (statusCounts[f.status] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fretes</h1>
        <p className="text-neutral-500 text-sm mt-1">Visão geral de todos os fretes na plataforma</p>
      </div>

      {/* Status summary */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${FREIGHT_STATUS_COLORS[status] || "bg-neutral-100 text-neutral-600"}`}>
            <span>{FREIGHT_STATUS_LABELS[status] || status}</span>
            <span className="font-bold">{count}</span>
          </div>
        ))}
      </div>

      {/* Freight list */}
      <div className="overflow-hidden rounded-lg border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-neutral-600">Rota</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600">Embarcador</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600">Status</th>
              <th className="px-4 py-3 text-right font-medium text-neutral-600">Valor</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600">Retirada</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {freightsList.map((freight) => {
              const sp = Array.isArray(freight.shipper_profiles) ? freight.shipper_profiles[0] : freight.shipper_profiles;
              return (
              <tr key={freight.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-4 py-3">
                  <span className="font-medium">
                    {freight.retirada_cidade}/{freight.retirada_uf}
                  </span>
                  <span className="text-neutral-400 mx-1.5">→</span>
                  <span className="font-medium">
                    {freight.entrega_cidade}/{freight.entrega_uf}
                  </span>
                  <p className="text-xs text-neutral-400 mt-0.5">{freight.natureza_carga}</p>
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {sp?.razao_social || "–"}
                </td>
                <td className="px-4 py-3">
                  <Badge className={FREIGHT_STATUS_COLORS[freight.status]}>
                    {FREIGHT_STATUS_LABELS[freight.status] || freight.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {freight.valor_frete.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
                <td className="px-4 py-3 text-neutral-500">
                  {new Date(freight.retirada_data + "T12:00:00").toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/fretes/${freight.id}`}
                    className="text-brand-500 hover:text-brand-600 text-xs font-medium"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
        {(!freights || freights.length === 0) && (
          <div className="text-center py-12 text-neutral-400">Nenhum frete encontrado.</div>
        )}
      </div>
    </div>
  );
}
