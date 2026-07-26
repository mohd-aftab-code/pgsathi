import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendOTP } from "@/lib/sms";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || phone.length !== 10) {
      return NextResponse.json({ success: false, message: "Invalid phone number" }, { status: 400 });
    }

    // Cooldown: max 1 OTP per 60s, and 5 per hour, per phone number
    const cooldown = await checkRateLimit(`otp:send:cooldown:${phone}`, 1, 60);
    if (!cooldown.allowed) {
      return NextResponse.json({ success: false, message: "Please wait a minute before requesting another OTP" }, { status: 429 });
    }
    const hourly = await checkRateLimit(`otp:send:hourly:${phone}`, 5, 3600);
    if (!hourly.allowed) {
      return NextResponse.json({ success: false, message: "Too many OTP requests. Please try again later" }, { status: 429 });
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

    // Opportunistic sweep — delete expired OTPs older than 24 h so the table
    // cannot grow without bound. Runs ~2 % of the time so it never adds visible
    // latency even in busy windows. Fire-and-forget: never blocks the response.
    if (Math.random() < 0.02) {
      db.otpCode
        .deleteMany({ where: { expiresAt: { lt: new Date(Date.now() - 86_400_000) } } })
        .catch(() => {});
    }

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
