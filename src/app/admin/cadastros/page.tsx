import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, REGISTRATION_STATUS_LABELS, REGISTRATION_STATUS_COLORS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default async function AdminCadastrosPage() {
  const admin = createAdminClient();

  const { data: profiles } = await admin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const pendingProfiles = profiles?.filter((p) => p.status === "pending") || [];
  const otherProfiles = profiles?.filter((p) => p.status !== "pending") || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">Gestao de Cadastros</h1>

      {pendingProfiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Pendentes de Aprovacao
              <Badge variant="warning">{pendingProfiles.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-neutral-100">
              {pendingProfiles.map((profile) => (
                <Link
                  key={profile.id}
                  href={`/admin/cadastros/${profile.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-neutral-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm text-neutral-900">{profile.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {ROLE_LABELS[profile.role]}
                      </Badge>
                      <span className="text-xs text-neutral-400">
                        {formatDateTime(profile.created_at)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-neutral-400" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Todos os Cadastros</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left px-6 py-3 font-medium text-neutral-500">E-mail</th>
                  <th className="text-left px-6 py-3 font-medium text-neutral-500">Perfil</th>
                  <th className="text-left px-6 py-3 font-medium text-neutral-500">Status</th>
                  <th className="text-left px-6 py-3 font-medium text-neutral-500">Data</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {(profiles || []).map((profile) => (
                  <tr key={profile.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-3">{profile.email}</td>
                    <td className="px-6 py-3">
                      <Badge variant="secondary">{ROLE_LABELS[profile.role]}</Badge>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${REGISTRATION_STATUS_COLORS[profile.status]}`}>
                        {REGISTRATION_STATUS_LABELS[profile.status]}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-neutral-500">{formatDateTime(profile.created_at)}</td>
                    <td className="px-6 py-3">
                      <Link
                        href={`/admin/cadastros/${profile.id}`}
                        className="text-brand-500 hover:text-brand-600 text-sm font-medium"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
