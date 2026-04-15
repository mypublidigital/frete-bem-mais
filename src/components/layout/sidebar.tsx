"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  Package,
  User,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const shipperLinks: SidebarLink[] = [
  { href: "/painel", label: "Painel", icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: "/meus-fretes", label: "Meus Fretes", icon: <Package className="h-5 w-5" /> },
  { href: "/fretes/novo", label: "Novo Frete", icon: <Truck className="h-5 w-5" /> },
  { href: "/perfil", label: "Perfil", icon: <User className="h-5 w-5" /> },
  { href: "/notificacoes", label: "Notificacoes", icon: <Bell className="h-5 w-5" /> },
];

const carrierLinks: SidebarLink[] = [
  { href: "/painel", label: "Painel", icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: "/fretes", label: "Marketplace", icon: <Package className="h-5 w-5" /> },
  { href: "/meus-fretes", label: "Minhas Candidaturas", icon: <Truck className="h-5 w-5" /> },
  { href: "/perfil", label: "Perfil", icon: <User className="h-5 w-5" /> },
  { href: "/notificacoes", label: "Notificacoes", icon: <Bell className="h-5 w-5" /> },
];

interface SidebarProps {
  role: "shipper" | "carrier";
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const links = role === "shipper" ? shipperLinks : carrierLinks;

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-neutral-200 bg-white transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-neutral-100">
        {!collapsed && (
          <Link href="/painel">
            <Image
              src="/logos/logotipo-preta.png"
              alt="Frete Bem+"
              width={140}
              height={36}
              className="h-8 w-auto"
            />
          </Link>
        )}
        {collapsed && (
          <Link href="/painel" className="mx-auto">
            <Image
              src="/logos/logo-laranja.png"
              alt="Frete Bem+"
              width={32}
              height={32}
              className="h-8 w-8"
            />
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "text-neutral-400 hover:text-neutral-600",
            collapsed && "hidden"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 py-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors mx-2 rounded-lg",
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              )}
              title={collapsed ? link.label : undefined}
            >
              <span className={cn(isActive && "text-brand-500")}>{link.icon}</span>
              {!collapsed && link.label}
            </Link>
          );
        })}
      </nav>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="p-4 text-neutral-400 hover:text-neutral-600 mx-auto"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </aside>
  );
}
