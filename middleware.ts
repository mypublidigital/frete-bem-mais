import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const publicPaths = ["/", "/login", "/cadastro", "/verificar-email", "/esqueci-senha", "/api/webhooks"];

function isPublicPath(pathname: string): boolean {
  return publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets and API routes that don't need auth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/logos") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const { supabaseResponse, user } = await updateSession(request);

  // Public paths: allow through
  if (isPublicPath(pathname)) {
    // If user is already logged in and tries to access auth pages, redirect
    if (user && (pathname === "/login" || pathname.startsWith("/cadastro"))) {
      const role = user.user_metadata?.role;
      const status = user.app_metadata?.status || user.user_metadata?.status || "pending";

      if (role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      if (status !== "approved") {
        return NextResponse.redirect(new URL("/pendente", request.url));
      }
      return NextResponse.redirect(new URL("/painel", request.url));
    }
    return supabaseResponse;
  }

  // No user: redirect to login
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = user.user_metadata?.role;
  const status = user.app_metadata?.status || user.user_metadata?.status || "pending";

  // Admin routes
  if (pathname.startsWith("/admin")) {
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/painel", request.url));
    }
    return supabaseResponse;
  }

  // Pending page: only for non-approved users
  if (pathname === "/pendente") {
    if (status === "approved") {
      return NextResponse.redirect(new URL("/painel", request.url));
    }
    return supabaseResponse;
  }

  // Profile pages: accessible even when pending
  if (pathname.startsWith("/perfil")) {
    return supabaseResponse;
  }

  // All other platform routes: require approved status
  if (status !== "approved") {
    return NextResponse.redirect(new URL("/pendente", request.url));
  }

  // Role-specific route restrictions
  if (pathname === "/fretes/novo" && role !== "shipper") {
    return NextResponse.redirect(new URL("/fretes", request.url));
  }

  if (pathname === "/meus-fretes" && role !== "carrier") {
    return NextResponse.redirect(new URL("/fretes", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
