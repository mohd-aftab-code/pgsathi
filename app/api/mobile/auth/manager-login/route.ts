import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { compare } from "bcryptjs";
import { signMobileToken } from "@/lib/mobile-auth";

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

    if (!member.active || !member.owner.isActive) {
      return NextResponse.json(
        { success: false, message: "Account is inactive." },
        { status: 403 }
      );
    }

    const isValid = await compare(password, member.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid password." },
        { status: 401 }
      );
    }

    // Generate JWT for manager
    const token = signMobileToken({
      userId: member.id,
      phone: "",
      role: "MANAGER", // Custom role mapped for the app
      name: member.name,
    });

    return NextResponse.json({
      success: true,
      message: "Login successful.",
      token: token,
      user: {
        id: member.id.toString(),
        name: member.name,
        role: "MANAGER",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
