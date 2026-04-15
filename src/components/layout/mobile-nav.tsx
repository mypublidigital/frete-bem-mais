"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  Package,
  User,
  Bell,
} from "lucide-react";

const shipperLinks = [
  { href: "/painel", label: "Painel", icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: "/meus-fretes", label: "Meus Fretes", icon: <Package className="h-5 w-5" /> },
  { href: "/fretes/novo", label: "Novo Frete", icon: <Truck className="h-5 w-5" /> },
  { href: "/perfil", label: "Perfil", icon: <User className="h-5 w-5" /> },
  { href: "/notificacoes", label: "Notificacoes", icon: <Bell className="h-5 w-5" /> },
];

const carrierLinks = [
  { href: "/painel", label: "Painel", icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: "/fretes", label: "Marketplace", icon: <Package className="h-5 w-5" /> },
  { href: "/meus-fretes", label: "Minhas Candidaturas", icon: <Truck className="h-5 w-5" /> },
  { href: "/perfil", label: "Perfil", icon: <User className="h-5 w-5" /> },
  { href: "/notificacoes", label: "Notificacoes", icon: <Bell className="h-5 w-5" /> },
];

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  role: "shipper" | "carrier";
}

export function MobileNav({ open, onClose, role }: MobileNavProps) {
  const pathname = usePathname();
  const links = role === "shipper" ? shipperLinks : carrierLinks;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-neutral-100">
          <Image
            src="/logos/logotipo-preta.png"
            alt="Frete Bem+"
            width={120}
            height={32}
            className="h-7 w-auto"
          />
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors mx-2 rounded-lg",
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-neutral-600 hover:bg-neutral-50"
                )}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
