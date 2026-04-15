import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Truck } from "lucide-react";

export default function CadastroPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Criar Conta</h1>
        <p className="text-neutral-500 mt-2">Selecione seu perfil para comecar</p>
      </div>

      <div className="grid gap-4">
        <Link href="/cadastro/embarcador">
          <Card className="hover:border-brand-300 hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="flex items-center gap-4 py-6">
              <div className="h-14 w-14 rounded-xl bg-brand-50 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                <Building2 className="h-7 w-7 text-brand-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">
                  Sou Embarcador
                </h2>
                <p className="text-sm text-neutral-500">
                  Empresa que precisa enviar cargas
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/cadastro/transportador">
          <Card className="hover:border-brand-300 hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="flex items-center gap-4 py-6">
              <div className="h-14 w-14 rounded-xl bg-brand-50 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                <Truck className="h-7 w-7 text-brand-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">
                  Sou Transportador
                </h2>
                <p className="text-sm text-neutral-500">
                  Caminhoneiro ou frotista
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <p className="text-center text-sm text-neutral-500">
        Ja tem uma conta?{" "}
        <Link
          href="/login"
          className="text-brand-500 hover:text-brand-600 font-medium"
        >
          Faca login
        </Link>
      </p>
    </div>
  );
}
