import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signMobileToken } from "@/lib/mobile-auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, otp } = body as { phone?: string; otp?: string };

    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, message: "Phone number and OTP are required." },
        { status: 400 }
      );
    }

    // 1. Verify OTP in DB
    const otpRecord = await db.otpCode.findFirst({
      where: {
        phone: phone,
        code: otp,
        purpose: "LOGIN",
        isUsed: false,
        expiresAt: {
          gt: new Date(), // must not be expired
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired OTP." },
        { status: 400 }
      );
    }

    // 2. Find the user
    const user = await db.user.findUnique({
      where: { id: otpRecord.userId! },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, message: "User account is invalid or inactive." },
        { status: 403 }
      );
    }

    // 3. Mark OTP as used
    await db.otpCode.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    // 4. Generate JWT
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
        id: user.id.toString(), // mobile app expects string id in some places
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[MOBILE_VERIFY_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
