import { Card, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";
import Link from "next/link";

export default function VerificarEmailPage() {
  return (
    <Card>
      <CardContent className="py-12 text-center space-y-4">
        <div className="mx-auto h-16 w-16 rounded-full bg-brand-50 flex items-center justify-center">
          <Mail className="h-8 w-8 text-brand-500" />
        </div>
        <h1 className="text-xl font-semibold text-neutral-900">
          Verifique seu e-mail
        </h1>
        <p className="text-neutral-500 max-w-sm mx-auto">
          Enviamos um link de confirmacao para o seu e-mail.
          Clique no link para ativar sua conta.
        </p>
        <p className="text-sm text-neutral-400">
          Apos confirmar, seu cadastro sera analisado pela nossa equipe.
        </p>
        <Link
          href="/login"
          className="inline-block text-sm text-brand-500 hover:text-brand-600 font-medium mt-4"
        >
          Voltar para o login
        </Link>
      </CardContent>
    </Card>
  );
}
