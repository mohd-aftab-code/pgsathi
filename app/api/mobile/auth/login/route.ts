import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { compare } from "bcryptjs";
import { signMobileToken } from "@/lib/mobile-auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, password } = body as { phone?: string; password?: string };

    if (!phone || !password) {
      return NextResponse.json(
        { success: false, message: "Phone number and password are required." },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "No account found with this phone number." },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: "Your account is deactivated." },
        { status: 403 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { success: false, message: "Password not set for this account." },
        { status: 400 }
      );
    }

    const isValid = await compare(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid password." },
        { status: 401 }
      );
    }

    const token = signMobileToken({
      userId: user.id,
      phone: user.phone || "",
      role: user.role,
      name: user.name,
    });

    return NextResponse.json({
      success: true,
      message: "Login successful.",
      token: token,
      user: {
        id: user.id.toString(),
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[MOBILE_LOGIN_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
