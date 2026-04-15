"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

export default function PagamentoPage() {
  const params = useParams();
  const freightId = params.id as string;
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [freightValue, setFreightValue] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function createIntent() {
      try {
        const res = await fetch("/api/stripe/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ freightId }),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          setError(data.error || "Erro ao iniciar pagamento.");
        } else {
          setClientSecret(data.clientSecret);
        }
      } catch {
        setError("Erro de conexão. Tente novamente.");
      }
      setLoading(false);
    }

    createIntent();
  }, [freightId]);

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY === "your_stripe_publishable_key") {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
          <p className="font-semibold text-amber-800 mb-2">Stripe não configurado</p>
          <p className="text-sm text-amber-700">
            Configure <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> e <code>STRIPE_SECRET_KEY</code> no arquivo <code>.env.local</code> para habilitar pagamentos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <Link href={`/fretes/${freightId}`} className="text-sm text-neutral-500 hover:text-neutral-700">
          ← Voltar ao frete
        </Link>
        <h1 className="text-2xl font-bold mt-2">Pagamento</h1>
        <p className="text-neutral-500 text-sm mt-1">
          Pagamento seguro via cartão de crédito
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-700 text-sm">{error}</p>
          <Button
            variant="outline"
            className="mt-3"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </Button>
        </div>
      ) : clientSecret ? (
        <Elements
          stripe={getStripe()}
          options={{
            clientSecret,
            locale: "pt-BR",
            appearance: {
              theme: "stripe",
              variables: {
                colorPrimary: "#E84425",
                borderRadius: "6px",
              },
            },
          }}
        >
          <CheckoutForm freightId={freightId} />
        </Elements>
      ) : null}
    </div>
  );
}

function CheckoutForm({ freightId }: { freightId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/fretes/${freightId}?payment=success`,
      },
      redirect: "if_required",
    });

    if (error) {
      toast({ type: "error", title: error.message || "Pagamento recusado." });
      setLoading(false);
    } else {
      toast({ type: "success", title: "Pagamento aprovado! Aguarde a confirmação." });
      router.push(`/fretes/${freightId}?payment=success`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do Cartão</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentElement />
        </CardContent>
      </Card>

      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 text-sm text-neutral-600">
        <p className="font-medium mb-1">Sobre o pagamento seguro</p>
        <ul className="space-y-1 text-xs text-neutral-500 list-disc list-inside">
          <li>Pagamento processado com segurança pelo Stripe</li>
          <li>Os dados de contato serão revelados após aprovação</li>
          <li>O valor fica em custódia até a confirmação do embarque</li>
        </ul>
      </div>

      <Button type="submit" className="w-full" loading={loading} disabled={!stripe}>
        Confirmar Pagamento
      </Button>
    </form>
  );
}
