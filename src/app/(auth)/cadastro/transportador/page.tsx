"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Stepper } from "@/components/ui/stepper";
import { BR_STATES, CNH_CATEGORIES, IMPLEMENT_TYPES } from "@/lib/constants";
import { signUpCarrier } from "@/actions/auth";
import { useToast } from "@/components/ui/toast";

const STEPS = ["Identificacao", "Habilitacao", "Veiculo", "Seguro e Implemento"];

export default function CadastroTransportadorPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [personType, setPersonType] = useState<"pf" | "pj">("pf");
  const [cnhFiles, setCnhFiles] = useState<File[]>([]);
  const [implementPhotos, setImplementPhotos] = useState<File[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    formData.set("person_type", personType);
    cnhFiles.forEach((f) => formData.append("cnh_files", f));
    implementPhotos.forEach((f) => formData.append("implement_photos", f));

    const result = await signUpCarrier(formData);

    if (result?.errors) {
      setErrors(result.errors as unknown as Record<string, string>);
      // Go back to the step with errors
      const errorKeys = Object.keys(result.errors as unknown as Record<string, string>);
      if (errorKeys.some((k) => ["email", "password", "cpf", "cnpj", "nome_completo", "razao_social"].includes(k))) setStep(0);
      else if (errorKeys.some((k) => k.startsWith("cnh"))) setStep(1);
      else if (errorKeys.some((k) => ["marca", "modelo", "ano", "placa", "renavam"].includes(k))) setStep(2);
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
        <CardTitle className="text-xl">Cadastro de Transportador</CardTitle>
        <div className="mt-4">
          <Stepper steps={STEPS} currentStep={step} />
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 0: Identificacao */}
          <div className={step !== 0 ? "hidden" : "space-y-4"}>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPersonType("pf")}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  personType === "pf"
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                }`}
              >
                Pessoa Fisica
              </button>
              <button
                type="button"
                onClick={() => setPersonType("pj")}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  personType === "pj"
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                }`}
              >
                Pessoa Juridica
              </button>
            </div>

            {personType === "pf" ? (
              <div className="space-y-4">
                <Input label="Nome Completo" name="nome_completo" required error={errors.nome_completo} />
                <Input label="CPF" name="cpf" required placeholder="000.000.000-00" error={errors.cpf} />
              </div>
            ) : (
              <div className="space-y-4">
                <Input label="Razao Social" name="razao_social" required error={errors.razao_social} />
                <Input label="CNPJ" name="cnpj" required placeholder="00.000.000/0000-00" error={errors.cnpj} />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="E-mail" name="email" type="email" required error={errors.email} />
              <Input label="Telefone" name="phone" type="tel" placeholder="(11) 99999-9999" error={errors.phone} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Senha" name="password" type="password" required minLength={6} error={errors.password} />
              <Input label="Confirmar Senha" name="confirmPassword" type="password" required error={errors.confirmPassword} />
            </div>
          </div>

          {/* Step 1: Habilitacao */}
          <div className={step !== 1 ? "hidden" : "space-y-4"}>
            <Input label="Numero da CNH" name="cnh_numero" required error={errors.cnh_numero} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Categoria"
                name="cnh_categoria"
                required
                placeholder="Selecione"
                options={CNH_CATEGORIES.map((c) => ({ value: c, label: c }))}
                error={errors.cnh_categoria}
              />
              <Input label="Validade" name="cnh_validade" type="date" required error={errors.cnh_validade} />
            </div>
            <FileUpload
              label="Foto da CNH"
              accept="image/*,.pdf"
              value={cnhFiles}
              onChange={setCnhFiles}
              error={errors.cnh_documento}
            />
          </div>

          {/* Step 2: Veiculo */}
          <div className={step !== 2 ? "hidden" : "space-y-4"}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Marca" name="marca" required placeholder="Ex: Volvo" error={errors.marca} />
              <Input label="Modelo" name="modelo" required placeholder="Ex: FH 540" error={errors.modelo} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="Ano" name="ano" type="number" required min={1980} max={2027} error={errors.ano} />
              <Input label="Placa" name="placa" required placeholder="ABC1D23" error={errors.placa} />
              <Input label="RENAVAM" name="renavam" required error={errors.renavam} />
            </div>
          </div>

          {/* Step 3: Seguro e Implemento */}
          <div className={step !== 3 ? "hidden" : "space-y-6"}>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">Seguro</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Numero da Apolice" name="seguro_apolice" required error={errors.seguro_apolice} />
                <Input label="Seguradora" name="seguro_seguradora" required error={errors.seguro_seguradora} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">Implemento</h3>
              <Select
                label="Tipo"
                name="implemento_tipo"
                required
                placeholder="Selecione o tipo"
                options={IMPLEMENT_TYPES.map((t) => ({ value: t, label: t }))}
                error={errors.implemento_tipo}
              />
              <Input label="Capacidade (kg)" name="implemento_capacidade" type="number" step="0.01" required error={errors.implemento_capacidade} />
              <div className="grid grid-cols-3 gap-4">
                <Input label="Comp. (m)" name="implemento_comprimento" type="number" step="0.01" error={errors.implemento_comprimento} />
                <Input label="Larg. (m)" name="implemento_largura" type="number" step="0.01" error={errors.implemento_largura} />
                <Input label="Alt. (m)" name="implemento_altura" type="number" step="0.01" error={errors.implemento_altura} />
              </div>
              <FileUpload
                label="Fotos do Implemento"
                accept="image/*"
                multiple
                value={implementPhotos}
                onChange={setImplementPhotos}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                Voltar
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1"
              loading={loading}
            >
              {step < STEPS.length - 1 ? "Proximo" : "Cadastrar"}
            </Button>
          </div>

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
