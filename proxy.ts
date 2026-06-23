import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/dashboard",
  "/dashboard/owner",
  "/dashboard/admin",
];

// Routes only for unauthenticated users
const AUTH_ROUTES = ["/login", "/register", "/verify-otp", "/forgot-password"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session token (NextAuth v5 sets this cookie)
  // v5 uses "authjs.session-token" (not "next-auth.session-token" which was v4)
  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value ||
    // Fallback for v4 style just in case
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  const isAuthenticated = !!sessionToken;

  // Redirect unauthenticated users away from protected routes
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from auth pages
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard/owner", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (Next.js static files)
     * - _next/image (Next.js image optimization)
     * - favicon, public assets
     * - API routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon|public|api|manifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
