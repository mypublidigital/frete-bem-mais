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
import { createFreight } from "@/actions/freight";
import { useToast } from "@/components/ui/toast";

export default function NovoFretePage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createFreight(formData);

    if (result.error) {
      toast({ type: "error", title: result.error });
      setLoading(false);
    } else {
      toast({ type: "success", title: "Frete publicado com sucesso!" });
      router.push("/meus-fretes");
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href="/meus-fretes"
          className="text-sm text-neutral-500 hover:text-neutral-700"
        >
          ← Meus Fretes
        </Link>
        <h1 className="text-2xl font-bold mt-2">Publicar Novo Frete</h1>
        <p className="text-neutral-500 text-sm mt-1">
          Preencha as informações da carga e receba propostas de transportadores
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Carga */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações da Carga</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Natureza da Carga"
                name="natureza_carga"
                required
                placeholder="Ex: Grãos, Eletrodomésticos, Alimentos"
              />
              <Input
                label="Valor da Carga (R$)"
                name="valor_carga"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0,00"
              />
            </div>
            <Textarea
              label="Especificação"
              name="especificacao"
              required
              placeholder="Descreva a carga com detalhes (embalagem, fragilidade, requisitos especiais...)"
              rows={3}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Input
                label="Volume (m³)"
                name="volume_m3"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0,00"
              />
              <Input
                label="Peso (kg)"
                name="peso_kg"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0,00"
              />
              <Input
                label="Valor do Frete (R$)"
                name="valor_frete"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0,00"
              />
            </div>
          </CardContent>
        </Card>

        {/* Retirada */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Local de Retirada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Logradouro"
                name="retirada_endereco"
                required
                className="sm:col-span-2"
                placeholder="Rua, Avenida, Rodovia..."
              />
              <Input
                label="CEP"
                name="retirada_cep"
                required
                placeholder="00000-000"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Cidade"
                name="retirada_cidade"
                required
                className="sm:col-span-2"
              />
              <Select
                label="UF"
                name="retirada_uf"
                required
                placeholder="UF"
                options={BR_STATES.map((s) => ({ value: s.value, label: s.value }))}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Data de Retirada"
                name="retirada_data"
                type="date"
                required
              />
              <Input
                label="Horário Início"
                name="retirada_horario_inicio"
                type="time"
                placeholder="08:00"
              />
              <Input
                label="Horário Fim"
                name="retirada_horario_fim"
                type="time"
                placeholder="18:00"
              />
            </div>
          </CardContent>
        </Card>

        {/* Entrega */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Local de Entrega</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Logradouro"
                name="entrega_endereco"
                required
                className="sm:col-span-2"
                placeholder="Rua, Avenida, Rodovia..."
              />
              <Input
                label="CEP"
                name="entrega_cep"
                required
                placeholder="00000-000"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Cidade"
                name="entrega_cidade"
                required
                className="sm:col-span-2"
              />
              <Select
                label="UF"
                name="entrega_uf"
                required
                placeholder="UF"
                options={BR_STATES.map((s) => ({ value: s.value, label: s.value }))}
              />
            </div>
            <Input
              label="Data de Entrega"
              name="entrega_data"
              type="date"
              required
              className="sm:max-w-[200px]"
            />
          </CardContent>
        </Card>

        {/* Observações */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              name="observacoes"
              placeholder="Informações adicionais, requisitos especiais, restrições..."
              rows={3}
            />
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/meus-fretes")}
          >
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Publicar Frete
          </Button>
        </div>
      </form>
    </div>
  );
}
