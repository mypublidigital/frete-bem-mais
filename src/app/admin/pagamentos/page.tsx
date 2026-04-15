import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PAYMENT_STATUS_LABELS } from "@/lib/constants";

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: "bg-neutral-100 text-neutral-600",
  processing: "bg-blue-100 text-blue-700",
  succeeded: "bg-green-100 text-green-700",
  payout_triggered: "bg-yellow-100 text-yellow-700",
  payout_completed: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-purple-100 text-purple-700",
};

export default async function AdminPagamentosPage() {
  const admin = createAdminClient();

  const { data: payments } = await admin
    .from("payments")
    .select(`
      id, status, amount_total, platform_fee, carrier_payout_amount,
      stripe_payment_intent_id, created_at, payout_triggered_at,
      freights!inner(
        id, natureza_carga,
        retirada_cidade, retirada_uf, entrega_cidade, entrega_uf
      ),
      shipper:profiles!payments_shipper_id_fkey(email),
      carrier:profiles!payments_carrier_id_fkey(email)
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  const totalVolume = (payments || []).reduce((sum: number, p: { status: string; amount_total: number }) =>
    p.status === "succeeded" ? sum + p.amount_total : sum, 0);
  const totalFees = (payments || []).reduce((sum: number, p: { status: string; platform_fee: number }) =>
    p.status === "succeeded" ? sum + p.platform_fee : sum, 0);
  const pendingPayouts = (payments || []).filter((p: { status: string }) => p.status === "payout_triggered").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pagamentos</h1>
        <p className="text-neutral-500 text-sm mt-1">Monitor de pagamentos e payouts</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">Volume Total</p>
            <p className="text-2xl font-bold text-neutral-900">
              {(totalVolume / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">Receita da Plataforma</p>
            <p className="text-2xl font-bold text-brand-600">
              {(totalFees / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">Payouts Pendentes</p>
            <p className="text-2xl font-bold text-yellow-600">{pendingPayouts}</p>
          </CardContent>
        </Card>
      </div>

      {/* Payments table */}
      <div className="overflow-hidden rounded-lg border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-neutral-600">Frete</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600">Status</th>
              <th className="px-4 py-3 text-right font-medium text-neutral-600">Total</th>
              <th className="px-4 py-3 text-right font-medium text-neutral-600">Taxa</th>
              <th className="px-4 py-3 text-right font-medium text-neutral-600">Transportador</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {(payments || []).map((payment: {
              id: string;
              status: string;
              amount_total: number;
              platform_fee: number;
              carrier_payout_amount: number;
              created_at: string;
              stripe_payment_intent_id: string | null;
              freights: { id: string; natureza_carga: string; retirada_cidade: string; retirada_uf: string; entrega_cidade: string; entrega_uf: string } | null;
              shipper: { email: string } | null;
              carrier: { email: string } | null;
            }) => (
              <tr key={payment.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium">
                    {payment.freights?.retirada_cidade}/{payment.freights?.retirada_uf}
                    <span className="text-neutral-400 mx-1">→</span>
                    {payment.freights?.entrega_cidade}/{payment.freights?.entrega_uf}
                  </p>
                  <p className="text-xs text-neutral-400">{payment.freights?.natureza_carga}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge className={PAYMENT_STATUS_COLORS[payment.status] || "bg-neutral-100 text-neutral-600"}>
                    {PAYMENT_STATUS_LABELS[payment.status] || payment.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {(payment.amount_total / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
                <td className="px-4 py-3 text-right text-brand-600 font-medium">
                  {(payment.platform_fee / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
                <td className="px-4 py-3 text-right text-neutral-600">
                  {(payment.carrier_payout_amount / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
                <td className="px-4 py-3 text-neutral-500">
                  {new Date(payment.created_at).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!payments || payments.length === 0) && (
          <div className="text-center py-12 text-neutral-400">Nenhum pagamento encontrado.</div>
        )}
      </div>
    </div>
  );
}
