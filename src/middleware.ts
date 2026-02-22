import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.error("❌ ERREUR CRITIQUE : NEXTAUTH_SECRET manquant dans .env");
    return NextResponse.redirect(new URL("/auth/login?error=Configuration", req.url));
  }

  // Récupération du token de session de manière sécurisée
  const token = await getToken({ req, secret });
  const isAuth = !!token;
  const role = token?.role as string | undefined;

  // ==========================================
  // 1. ROUTAGE DES UTILISATEURS CONNECTÉS
  // ==========================================
  const isLoginPage = path.startsWith("/auth/login");

  if (isLoginPage && isAuth) {
     // Si on est déjà connecté et qu'on tente d'aller sur /login, on passe par le routeur central
     return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  // ==========================================
  // 2. BOUCLIERS DE PROTECTION STRICTS (1 Rôle = 1 Espace)
  // ==========================================
  
  // Espace Administrateur (État)
  if (path.startsWith("/admin")) {
    if (!isAuth) return NextResponse.redirect(new URL("/auth/login", req.url));
    if (role !== "ADMIN") return NextResponse.redirect(new URL("/auth/login?error=AccessDenied", req.url));
  }

  // Espace Coopérative
  if (path.startsWith("/cooperative")) {
    if (!isAuth) return NextResponse.redirect(new URL("/auth/login", req.url));
    if (role !== "COOPERATIVE") return NextResponse.redirect(new URL("/auth/login?error=AccessDenied", req.url));
  }

  // Espace Producteur
  if (path.startsWith("/producer")) {
    if (!isAuth) return NextResponse.redirect(new URL("/auth/login", req.url));
    if (role !== "PRODUCER") return NextResponse.redirect(new URL("/auth/login?error=AccessDenied", req.url));
  }

  // Espace Transporteur
  if (path.startsWith("/transporter")) {
    if (!isAuth) return NextResponse.redirect(new URL("/auth/login", req.url));
    if (role !== "TRANSPORTER") return NextResponse.redirect(new URL("/auth/login?error=AccessDenied", req.url));
  }

  // Espace Banque (Futur module de crédit)
  if (path.startsWith("/bank")) {
    if (!isAuth) return NextResponse.redirect(new URL("/auth/login", req.url));
    if (role !== "BANK") return NextResponse.redirect(new URL("/auth/login?error=AccessDenied", req.url));
  }

  return NextResponse.next();
}

// ==========================================
// 3. MATCHER : Les routes surveillées par le vigile
// ==========================================
export const config = {
  matcher: [
    "/admin/:path*",
    "/cooperative/:path*",
    "/producer/:path*", 
    "/transporter/:path*", 
    "/bank/:path*",
    "/auth/login"
  ],
};
