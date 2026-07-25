import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// ─────────────────────────────────────────────────────────────────────────────
// Role-based route guards — enforced at the EDGE before any page renders
// Next.js 16: file is "proxy.ts", function export is "proxy" (not "middleware")
// ─────────────────────────────────────────────────────────────────────────────

const PUBLIC_AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

// Partner Portal pages that must stay reachable without a session.
// Everything else under /partner requires an authenticated PARTNER.
const PARTNER_PUBLIC_ROUTES = [
  "/partner",
  "/partner/login",
  "/partner/signup",
  "/partner/forgot-password",
];

// Role → correct home dashboard.
// PARTNER must be listed here: the fallback below sends unknown roles to
// /dashboard/tenant, and the tenant rule then bounces every non-TENANT back to
// their home — for a partner that was the same URL, producing an infinite
// redirect loop (ERR_TOO_MANY_REDIRECTS).
const ROLE_HOME: Record<string, string> = {
  ADMIN: "/dashboard/admin",
  OWNER: "/dashboard/owner",
  TENANT: "/dashboard/tenant",
  PARTNER: "/partner/dashboard",
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check which cookie actually exists (handles misconfigured AUTH_URL on Vercel)
  const isSecureCookie = request.cookies.has("__Secure-authjs.session-token");
  const cookieName = isSecureCookie ? "__Secure-authjs.session-token" : "authjs.session-token";

  // Decode JWT token from the session cookie (no DB call needed at edge)
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    secureCookie: isSecureCookie,
    salt: cookieName,
    cookieName: cookieName,
  });

  const isAuthenticated = !!token;
  const role = token?.role as string | undefined;
  const isManager = !!(token?.isManager);

  // Correct home dashboard for this user
  const userHome = isManager
    ? "/dashboard/manager"
    : ROLE_HOME[role ?? ""] ?? "/dashboard/tenant";

  // ── 1. Redirect unauthenticated users away from dashboard ─────────────────
  if (pathname.startsWith("/dashboard") && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 2. Redirect authenticated users away from login/register pages ────────
  if (PUBLIC_AUTH_ROUTES.some((r) => pathname.startsWith(r)) && isAuthenticated) {
    return NextResponse.redirect(new URL(userHome, request.url));
  }

  // ── 2b. Partner Portal guards ────────────────────────────────────────────
  const isPartnerRoute = pathname === "/partner" || pathname.startsWith("/partner/");
  const isPartnerPublic = PARTNER_PUBLIC_ROUTES.includes(pathname);

  if (isPartnerRoute && !isPartnerPublic) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/partner/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // A signed-in owner/tenant/admin must never land on partner pages.
    if (role !== "PARTNER") {
      return NextResponse.redirect(new URL(userHome, request.url));
    }
  }

  // An already signed-in partner has no use for the partner auth pages.
  if (isAuthenticated && role === "PARTNER" && isPartnerPublic && pathname !== "/partner") {
    return NextResponse.redirect(new URL("/partner/dashboard", request.url));
  }

  // Partners live entirely outside /dashboard.
  if (pathname.startsWith("/dashboard") && isAuthenticated && role === "PARTNER") {
    return NextResponse.redirect(new URL("/partner/dashboard", request.url));
  }

  // ── 3. Role-based dashboard access enforcement ───────────────────────────
  if (pathname.startsWith("/dashboard") && isAuthenticated) {

    // /dashboard/admin  → ADMIN only
    if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL(userHome, request.url));
    }

    // /dashboard/owner  → OWNER only
    if (pathname.startsWith("/dashboard/owner") && role !== "OWNER") {
      return NextResponse.redirect(new URL(userHome, request.url));
    }

    // /dashboard/manager → isManager flag (staff login) OR the OWNER/ADMIN themselves
    if (pathname.startsWith("/dashboard/manager") && !isManager && role !== "OWNER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL(userHome, request.url));
    }

    // /dashboard/tenant → TENANT role only
    if (
      pathname.startsWith("/dashboard/tenant") &&
      (isManager || role !== "TENANT")
    ) {
      return NextResponse.redirect(new URL(userHome, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static  (Next.js static assets)
     * - _next/image   (Next.js image optimisation)
     * - Public assets, API routes (those have their own guards)
     */
    "/((?!_next/static|_next/image|favicon|public|api|manifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
