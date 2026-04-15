import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, CreditCard, Truck, CheckCircle, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Image
            src="/logos/logotipo-preta.png"
            alt="Frete Bem+"
            width={150}
            height={40}
            className="h-8 w-auto"
          />
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link href="/cadastro">
              <Button size="sm">Cadastre-se</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Conectando cargas a transportadores com{" "}
              <span className="text-brand-500">seguranca</span>
            </h1>
            <p className="mt-6 text-lg text-neutral-300 max-w-2xl">
              Plataforma de intermediacao logistica com custodia financeira,
              validacao documental e protecao para embarcadores e transportadores.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/cadastro/embarcador">
                <Button size="lg" className="w-full sm:w-auto">
                  Sou Embarcador <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/cadastro/transportador">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-neutral-600 text-white hover:bg-neutral-800">
                  Sou Transportador <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900">
              Por que escolher a Frete Bem+?
            </h2>
            <p className="mt-4 text-lg text-neutral-500 max-w-2xl mx-auto">
              Seguranca em cada etapa da operacao logistica
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="mx-auto h-14 w-14 rounded-xl bg-brand-50 flex items-center justify-center">
                <Shield className="h-7 w-7 text-brand-500" />
              </div>
              <h3 className="font-semibold text-neutral-900">Validacao Documental</h3>
              <p className="text-sm text-neutral-500">
                Todos os parceiros sao auditados antes de operar na plataforma.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto h-14 w-14 rounded-xl bg-green-50 flex items-center justify-center">
                <CreditCard className="h-7 w-7 text-green-500" />
              </div>
              <h3 className="font-semibold text-neutral-900">Pagamento Seguro</h3>
              <p className="text-sm text-neutral-500">
                Custodia financeira (escrow) garante pagamento para o transportador.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto h-14 w-14 rounded-xl bg-blue-50 flex items-center justify-center">
                <Truck className="h-7 w-7 text-blue-500" />
              </div>
              <h3 className="font-semibold text-neutral-900">Matchmaking Inteligente</h3>
              <p className="text-sm text-neutral-500">
                Conectamos cargas ao transportador ideal de forma eficiente.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto h-14 w-14 rounded-xl bg-purple-50 flex items-center justify-center">
                <CheckCircle className="h-7 w-7 text-purple-500" />
              </div>
              <h3 className="font-semibold text-neutral-900">Protecao de Dados</h3>
              <p className="text-sm text-neutral-500">
                Dados pessoais protegidos ate a confirmacao do pagamento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">
            Pronto para comecar?
          </h2>
          <p className="mt-4 text-lg text-brand-100">
            Cadastre-se gratuitamente e comece a operar com seguranca.
          </p>
          <div className="mt-8">
            <Link href="/cadastro">
              <Button size="lg" className="bg-white text-brand-600 hover:bg-brand-50">
                Criar Conta Gratuita
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Image
              src="/logos/logotipo-branca.png"
              alt="Frete Bem+"
              width={120}
              height={32}
              className="h-7 w-auto"
            />
            <p className="text-sm">
              &copy; {new Date().getFullYear()} Frete Bem+. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
