import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { compare } from "bcryptjs";

/**
 * POST /api/auth/manager-login
 * Validates a PgTeamMember's credentials and returns success.
 * The actual session is created by next-auth separately.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    // Look up in PgTeamMember table
    const member = await db.pgTeamMember.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        owner: {
          select: { id: true, name: true, isActive: true },
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, message: "No manager account found with this email." },
        { status: 401 }
      );
    }

    if (!member.active) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your manager account has been deactivated. Please contact your PG Owner.",
        },
        { status: 403 }
      );
    }

    if (!member.owner.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "The PG owner account is inactive. Please contact support.",
        },
        { status: 403 }
      );
    }

    const isValid = await compare(password, member.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid password. Please try again." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        memberId: member.id,
        name: member.name,
        role: member.role,
        ownerId: member.ownerId,
        ownerName: member.owner.name,
        listingIds: member.listingIds,
      },
    });
  } catch (error) {
    console.error("[MANAGER_LOGIN_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
