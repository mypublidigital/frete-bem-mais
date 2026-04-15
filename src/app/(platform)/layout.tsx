"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/actions/auth";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState<"shipper" | "carrier">("shipper");
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const userRole = user.user_metadata?.role || "shipper";
        setRole(userRole);
        setUserName(
          user.user_metadata?.nome_completo ||
          user.user_metadata?.razao_social ||
          user.email?.split("@")[0] ||
          "Usuario"
        );
      }
    });
  }, []);

  async function handleSignOut() {
    await signOut();
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={role} />
      <MobileNav
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        role={role}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          userName={userName}
          role={role}
          onMenuToggle={() => setMobileNavOpen(!mobileNavOpen)}
          onSignOut={handleSignOut}
        />
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
