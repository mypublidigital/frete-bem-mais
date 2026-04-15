"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  CreditCard,
  ClipboardList,
  LogOut,
} from "lucide-react";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: "/admin/cadastros", label: "Cadastros", icon: <Users className="h-5 w-5" /> },
  { href: "/admin/fretes", label: "Fretes", icon: <Package className="h-5 w-5" /> },
  { href: "/admin/pagamentos", label: "Pagamentos", icon: <CreditCard className="h-5 w-5" /> },
  { href: "/admin/auditoria", label: "Auditoria", icon: <ClipboardList className="h-5 w-5" /> },
];

interface AdminSidebarProps {
  onSignOut: () => void;
}

export function AdminSidebar({ onSignOut }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 border-r border-neutral-200 bg-neutral-900">
      <div className="p-4 border-b border-neutral-800">
        <Link href="/admin">
          <Image
            src="/logos/logotipo-branca.png"
            alt="Frete Bem+"
            width={140}
            height={36}
            className="h-8 w-auto"
          />
        </Link>
        <p className="text-xs text-neutral-400 mt-1">Painel Administrativo</p>
      </div>

      <nav className="flex-1 py-4 space-y-1">
        {adminLinks.map((link) => {
          const isActive =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors mx-2 rounded-lg",
                isActive
                  ? "bg-brand-500/20 text-brand-400"
                  : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
              )}
            >
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-neutral-800">
        <button
          onClick={onSignOut}
          className="flex items-center gap-2 text-sm text-neutral-400 hover:text-red-400 transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
