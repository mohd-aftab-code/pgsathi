import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendOTP } from "@/lib/sms";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || phone.length !== 10) {
      return NextResponse.json({ success: false, message: "Invalid phone number" }, { status: 400 });
    }

    // 1. Check if user exists
    const user = await db.user.findFirst({
      where: { phone }
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found with this phone number" }, { status: 404 });
    }

    // 2. Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry to 10 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // 3. Save OTP to DB
    await db.otpCode.create({
      data: {
        userId: user.id,
        phone,
        code: otp,
        purpose: "PASSWORD_RESET",
        expiresAt,
        isUsed: false
      }
    });

    // 4. Send OTP via Fast2SMS
    const sent = await sendOTP(phone, otp);

    if (sent) {
      return NextResponse.json({ success: true, message: "OTP sent successfully" });
    } else {
      return NextResponse.json({ success: false, message: "Failed to send OTP SMS" }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Send OTP Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
