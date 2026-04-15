import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, DollarSign, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function AdminDashboardPage() {
  const admin = createAdminClient();

  const [
    { count: totalProfiles },
    { count: pendingProfiles },
    { count: approvedProfiles },
    { count: totalFreights },
    { count: activeFreights },
  ] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("profiles").select("*", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("profiles").select("*", { count: "exact", head: true }).eq("status", "approved"),
    admin.from("freights").select("*", { count: "exact", head: true }),
    admin.from("freights").select("*", { count: "exact", head: true }).in("status", ["published", "applied", "accepted", "awaiting_payment", "paid", "in_transit"]),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalProfiles || 0}</p>
              <p className="text-sm text-neutral-500">Total Cadastros</p>
            </div>
          </CardContent>
        </Card>

        <Link href="/admin/cadastros">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="py-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-yellow-50 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingProfiles || 0}</p>
                <p className="text-sm text-neutral-500">Pendentes</p>
              </div>
              {(pendingProfiles || 0) > 0 && (
                <Badge variant="warning" className="ml-auto">Revisar</Badge>
              )}
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardContent className="py-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
              <Users className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{approvedProfiles || 0}</p>
              <p className="text-sm text-neutral-500">Aprovados</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-brand-50 flex items-center justify-center">
              <Package className="h-6 w-6 text-brand-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalFreights || 0}</p>
              <p className="text-sm text-neutral-500">Total Fretes</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
