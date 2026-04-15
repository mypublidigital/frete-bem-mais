"use client";

import { Bell, LogOut, Menu, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface TopbarProps {
  userName: string;
  role: string;
  onMenuToggle?: () => void;
  onSignOut: () => void;
}

export function Topbar({ userName, role, onMenuToggle, onSignOut }: TopbarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const roleLabel = role === "shipper" ? "Embarcador" : role === "carrier" ? "Transportador" : "Admin";

  return (
    <header className="h-16 border-b border-neutral-200 bg-white flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden text-neutral-600 hover:text-neutral-900"
        >
          <Menu className="h-6 w-6" />
        </button>
        <Link href="/painel" className="md:hidden">
          <Image
            src="/logos/logo-laranja.png"
            alt="Frete Bem+"
            width={32}
            height={32}
            className="h-8 w-8"
          />
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/notificacoes"
          className="relative text-neutral-500 hover:text-neutral-700 p-2"
        >
          <Bell className="h-5 w-5" />
        </Link>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 text-sm text-neutral-700 hover:text-neutral-900"
          >
            <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center">
              <User className="h-4 w-4 text-brand-600" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="font-medium text-sm leading-none">{userName}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{roleLabel}</p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-neutral-200 bg-white shadow-lg py-1 z-50">
              <Link
                href="/perfil"
                className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                onClick={() => setShowUserMenu(false)}
              >
                <User className="h-4 w-4" />
                Meu Perfil
              </Link>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onSignOut();
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
