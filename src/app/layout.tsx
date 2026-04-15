import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Frete Bem+ | Plataforma de Fretes",
    template: "%s | Frete Bem+",
  },
  description:
    "Conectando embarcadores a transportadores com seguranca juridica e financeira.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
