"use client";

import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { signOut } from "@/actions/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar onSignOut={signOut} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-neutral-200 bg-white flex items-center px-6">
          <h1 className="text-lg font-semibold text-neutral-900">
            Painel Administrativo
          </h1>
        </header>
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
