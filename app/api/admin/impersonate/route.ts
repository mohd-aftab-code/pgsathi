/**
 * /api/admin/impersonate/route.ts
 * Super Admin impersonation — generates a signed token and redirects
 * the admin to the target user's dashboard session.
 *
 * POST { userId: number }
 * Returns: { success: true, redirectUrl: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || ""
);

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    // Only ADMIN can impersonate
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const userId = parseInt(body.userId);
    if (!userId || isNaN(userId)) {
      return NextResponse.json({ success: false, message: "Invalid userId" }, { status: 400 });
    }

    // Fetch target user
    const targetUser = await db.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Create a short-lived signed JWT (5 minutes) that contains the target user info
    const token = await new SignJWT({
      sub: targetUser.id.toString(),
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role,
      uuid: targetUser.uuid,
      avatar: targetUser.avatar,
      impersonatedBy: session.user.email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("5m") // 5 minute window to use the link
      .sign(secret);

    return NextResponse.json({
      success: true,
      token,
      userName: targetUser.name,
      message: `Impersonation token generated for ${targetUser.name}`,
    });
  } catch (err: any) {
    console.error("[IMPERSONATE]", err);
    return NextResponse.json({ success: false, message: err.message || "Server error" }, { status: 500 });
  }
}
