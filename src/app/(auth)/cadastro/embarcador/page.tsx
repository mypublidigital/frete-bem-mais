"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BR_STATES } from "@/lib/constants";
import { signUpShipper } from "@/actions/auth";
import { useToast } from "@/components/ui/toast";

export default function CadastroEmbarcadorPage() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const result = await signUpShipper(formData);

    if (result?.errors) {
      setErrors(result.errors as Record<string, string>);
      setLoading(false);
    } else if (result?.error) {
      toast({ type: "error", title: result.error });
      setLoading(false);
    } else {
      toast({ type: "success", title: "Cadastro realizado! Verifique seu e-mail." });
      router.push("/verificar-email");
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Cadastro de Embarcador</CardTitle>
        <p className="text-sm text-neutral-500">Preencha os dados da sua empresa</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Credenciais */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">
              Acesso
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="E-mail" name="email" type="email" required error={errors.email} />
              <Input label="Telefone" name="phone" type="tel" placeholder="(11) 99999-9999" error={errors.phone} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Senha" name="password" type="password" required minLength={6} error={errors.password} />
              <Input label="Confirmar Senha" name="confirmPassword" type="password" required error={errors.confirmPassword} />
            </div>
          </div>

          {/* Dados Empresa */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">
              Dados da Empresa
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="CNPJ" name="cnpj" required placeholder="00.000.000/0000-00" error={errors.cnpj} />
              <Input label="Razao Social" name="razao_social" required error={errors.razao_social} />
            </div>
          </div>

          {/* Endereco */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">
              Endereco
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Input label="CEP" name="endereco_cep" required placeholder="00000-000" error={errors.endereco_cep} />
              <Input label="Logradouro" name="endereco_logradouro" required className="col-span-2" error={errors.endereco_logradouro} />
              <Input label="Numero" name="endereco_numero" required error={errors.endereco_numero} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="Complemento" name="endereco_complemento" error={errors.endereco_complemento} />
              <Input label="Bairro" name="endereco_bairro" required error={errors.endereco_bairro} />
              <Input label="Cidade" name="endereco_cidade" required error={errors.endereco_cidade} />
            </div>
            <Select
              label="Estado"
              name="endereco_uf"
              required
              placeholder="Selecione o estado"
              options={BR_STATES.map((s) => ({ value: s.value, label: s.label }))}
              error={errors.endereco_uf}
            />
          </div>

          {/* Responsavel */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">
              Responsavel
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Nome do Responsavel" name="responsavel_nome" required error={errors.responsavel_nome} />
              <Input label="Cargo" name="responsavel_cargo" placeholder="Ex: Gerente de Logistica" error={errors.responsavel_cargo} />
            </div>
          </div>

          {/* Cargas */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">
              Informacoes de Carga
            </h3>
            <Textarea
              label="Natureza das Cargas"
              name="natureza_cargas"
              placeholder="Ex: Graos, industrializados, pereciveis..."
              required
              error={errors.natureza_cargas}
            />
            <Input
              label="Valor Medio das Cargas (R$)"
              name="valor_medio_carga"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              error={errors.valor_medio_carga}
            />
          </div>

          <Button type="submit" className="w-full" loading={loading}>
            Cadastrar
          </Button>

          <p className="text-center text-sm text-neutral-500">
            Ja tem conta?{" "}
            <Link href="/login" className="text-brand-500 hover:text-brand-600 font-medium">
              Faca login
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
