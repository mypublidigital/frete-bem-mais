"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resetPassword } from "@/actions/auth";
import { useToast } from "@/components/ui/toast";

export default function EsqueciSenhaPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await resetPassword(formData);

    if (result?.error) {
      toast({ type: "error", title: result.error });
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <h1 className="text-xl font-semibold text-neutral-900">
            E-mail enviado
          </h1>
          <p className="text-neutral-500">
            Se o e-mail estiver cadastrado, voce recebera um link para redefinir sua senha.
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-center">Recuperar Senha</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-neutral-500">
            Informe seu e-mail e enviaremos um link para redefinir sua senha.
          </p>
          <Input
            label="E-mail"
            name="email"
            type="email"
            placeholder="seu@email.com"
            required
          />
          <Button type="submit" className="w-full" loading={loading}>
            Enviar Link
          </Button>
          <p className="text-center text-sm">
            <Link href="/login" className="text-brand-500 hover:text-brand-600 font-medium">
              Voltar para o login
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
