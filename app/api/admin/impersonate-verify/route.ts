/**
 * /api/admin/impersonate-verify/route.ts
 * Verifies the impersonation JWT and returns user info
 */
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { auth } from "@/lib/auth";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || ""
);

export async function POST(req: NextRequest) {
  try {
    // Still require caller to be ADMIN (this tab was opened from admin panel)
    // Actually this is called from a client page in a new tab, so session won't exist
    // We just verify the JWT is valid — that's the security check
    const body = await req.json();
    const token = body.token as string;

    if (!token) {
      return NextResponse.json({ success: false, message: "No token" }, { status: 400 });
    }

    const { payload } = await jwtVerify(token, secret);

    return NextResponse.json({
      success: true,
      userId: payload.sub,
      email: payload.email,
      userName: payload.name,
      role: payload.role,
      impersonatedBy: payload.impersonatedBy,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: "Token invalid or expired" }, { status: 401 });
  }
}
