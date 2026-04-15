import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/actions/auth";

export default async function PendentePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const status = user.app_metadata?.status || user.user_metadata?.status || "pending";

  if (status === "approved") {
    redirect("/painel");
  }

  // Fetch rejection reason if rejected
  let rejectionReason: string | null = null;
  if (status === "rejected") {
    const { data: auditLog } = await supabase
      .from("audit_log")
      .select("reason")
      .eq("entity_id", user.id)
      .eq("action", "status_change")
      .eq("new_status", "rejected")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    rejectionReason = auditLog?.reason || null;
  }

  const isPending = status === "pending";

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="py-12 text-center space-y-4">
          <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center ${
            isPending ? "bg-yellow-50" : "bg-red-50"
          }`}>
            {isPending ? (
              <Clock className="h-8 w-8 text-yellow-500" />
            ) : (
              <XCircle className="h-8 w-8 text-red-500" />
            )}
          </div>

          <h1 className="text-xl font-semibold text-neutral-900">
            {isPending ? "Cadastro em Analise" : "Cadastro Reprovado"}
          </h1>

          <p className="text-neutral-500">
            {isPending
              ? "Seu cadastro esta sendo analisado pela nossa equipe. Voce recebera um e-mail quando for aprovado."
              : "Infelizmente seu cadastro nao foi aprovado."}
          </p>

          {rejectionReason && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-left">
              <p className="text-sm font-medium text-red-800 mb-1">Motivo:</p>
              <p className="text-sm text-red-700">{rejectionReason}</p>
            </div>
          )}

          <div className="pt-4">
            <form action={signOut}>
              <Button type="submit" variant="outline">
                Sair
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
