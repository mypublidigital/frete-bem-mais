import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminAuditoriaPage() {
  const admin = createAdminClient();

  const { data: logs } = await admin
    .from("audit_log")
    .select(`
      id, action, entity_type, entity_id,
      old_status, new_status, reason,
      actor_role, created_at,
      actor:profiles!audit_log_actor_id_fkey(email)
    `)
    .order("created_at", { ascending: false })
    .limit(200);

  const ACTION_LABELS: Record<string, string> = {
    status_change: "Mudança de Status",
    payment_succeeded: "Pagamento Aprovado",
    boarding_confirmed: "Embarque Confirmado",
  };

  const ROLE_COLORS: Record<string, string> = {
    admin: "bg-purple-100 text-purple-700",
    shipper: "bg-blue-100 text-blue-700",
    carrier: "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Auditoria</h1>
        <p className="text-neutral-500 text-sm mt-1">
          Log completo de ações na plataforma ({logs?.length || 0} registros)
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-neutral-600">Data/Hora</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600">Ator</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600">Ação</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600">Entidade</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600">Motivo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {(logs || []).map((log: {
              id: string;
              action: string;
              entity_type: string;
              entity_id: string;
              old_status: string | null;
              new_status: string | null;
              reason: string | null;
              actor_role: string;
              created_at: string;
              actor: { email: string } | null;
            }) => (
              <tr key={log.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs text-neutral-500 truncate max-w-[140px]">
                    {log.actor?.email || "–"}
                  </p>
                  <span className={`inline-block text-xs px-1.5 py-0.5 rounded mt-0.5 ${ROLE_COLORS[log.actor_role] || "bg-neutral-100 text-neutral-600"}`}>
                    {log.actor_role}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">
                  {ACTION_LABELS[log.action] || log.action}
                </td>
                <td className="px-4 py-3 text-neutral-500">
                  <span className="capitalize">{log.entity_type}</span>
                  <p className="text-xs text-neutral-400 font-mono">{log.entity_id.slice(0, 8)}…</p>
                </td>
                <td className="px-4 py-3">
                  {(log.old_status || log.new_status) ? (
                    <div className="flex items-center gap-1 text-xs">
                      {log.old_status && (
                        <span className="px-1.5 py-0.5 bg-neutral-100 rounded">{log.old_status}</span>
                      )}
                      {log.old_status && log.new_status && <span className="text-neutral-400">→</span>}
                      {log.new_status && (
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded">{log.new_status}</span>
                      )}
                    </div>
                  ) : "–"}
                </td>
                <td className="px-4 py-3 text-neutral-500 max-w-[200px]">
                  <p className="truncate text-xs">{log.reason || "–"}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!logs || logs.length === 0) && (
          <div className="text-center py-12 text-neutral-400">Nenhum registro de auditoria.</div>
        )}
      </div>
    </div>
  );
}
