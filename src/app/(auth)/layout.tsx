import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-500 items-center justify-center p-12">
        <div className="text-center">
          <Image
            src="/logos/logotipo-branca.png"
            alt="Frete Bem+"
            width={300}
            height={80}
            className="mx-auto mb-8"
            priority
          />
          <h2 className="text-2xl font-bold text-white mb-4">
            Conectando cargas a transportadores
          </h2>
          <p className="text-brand-100 text-lg max-w-md mx-auto">
            Plataforma segura de intermediacao logistica com custodia financeira
            e validacao documental.
          </p>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 bg-neutral-50">
        <div className="w-full max-w-md">
          <Link href="/" className="lg:hidden flex justify-center mb-8">
            <Image
              src="/logos/logotipo-preta.png"
              alt="Frete Bem+"
              width={180}
              height={48}
              priority
            />
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
