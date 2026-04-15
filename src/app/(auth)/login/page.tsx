"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signIn } from "@/actions/auth";
import { useToast } from "@/components/ui/toast";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await signIn(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      toast({ type: "success", title: "Login realizado com sucesso!" });
      router.push(result?.redirect || "/painel");
      router.refresh();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-center">Entrar</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="E-mail"
            name="email"
            type="email"
            placeholder="seu@email.com"
            required
            autoComplete="email"
          />
          <Input
            label="Senha"
            name="password"
            type="password"
            placeholder="Sua senha"
            required
            autoComplete="current-password"
          />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" loading={loading}>
            Entrar
          </Button>

          <div className="text-center space-y-2 pt-2">
            <Link
              href="/esqueci-senha"
              className="text-sm text-brand-500 hover:text-brand-600"
            >
              Esqueci minha senha
            </Link>
            <p className="text-sm text-neutral-500">
              Ainda nao tem conta?{" "}
              <Link
                href="/cadastro"
                className="text-brand-500 hover:text-brand-600 font-medium"
              >
                Cadastre-se
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
