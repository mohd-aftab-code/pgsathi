/**
 * /api/admin/impersonate-callback/route.ts
 * Receives the signed impersonation token, verifies it,
 * and uses NextAuth signIn to create a real session for that user.
 */
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { signIn } from "@/lib/auth";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || ""
);

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");
    if (!token) {
      return NextResponse.redirect(new URL("/dashboard/admin?error=missing_token", req.url));
    }

    // Verify the signed JWT
    const { payload } = await jwtVerify(token, secret);

    if (!payload.sub || !payload.email) {
      return NextResponse.redirect(new URL("/dashboard/admin?error=invalid_token", req.url));
    }

    // Use NextAuth credentials signIn with a special bypass flag
    // We pass the impersonateUserId as a numeric string + a dummy password flag
    // The auth.ts already handles the impersonateUserId path
    // But here we have no admin password — so we use the pre-verified token instead
    // 
    // Simplest & most secure approach: redirect to /login?impersonate=<token>
    // and handle it there. But since we can't create sessions server-side easily in
    // NextAuth v5 App Router, we redirect to a client page that calls signIn().
    
    const redirectUrl = new URL("/dashboard/admin/impersonate-session", req.url);
    redirectUrl.searchParams.set("token", token);
    return NextResponse.redirect(redirectUrl);
  } catch (err: any) {
    console.error("[IMPERSONATE_CALLBACK]", err);
    return NextResponse.redirect(new URL("/dashboard/admin?error=token_expired", req.url));
  }
}
