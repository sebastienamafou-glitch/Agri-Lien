import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const role = token?.role as string | undefined;

    // Protection par Rôle (Bouclier de sécurité)
    if (path.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth/login?error=AccessDenied", req.url));
    }
    if (path.startsWith("/cooperative") && role !== "COOPERATIVE") {
      return NextResponse.redirect(new URL("/auth/login?error=AccessDenied", req.url));
    }
    if (path.startsWith("/producer") && role !== "PRODUCER") {
      return NextResponse.redirect(new URL("/auth/login?error=AccessDenied", req.url));
    }
    if (path.startsWith("/transporter") && role !== "TRANSPORTER") {
      return NextResponse.redirect(new URL("/auth/login?error=AccessDenied", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Le middleware ne s'exécute que si cette fonction renvoie true
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/login",
    },
  }
);

export const config = {
  matcher: [
    "/onboarding",
    "/admin/:path*",
    "/cooperative/:path*",
    "/producer/:path*",
    "/transporter/:path*",
  ],
};
