import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendOtpEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * POST — forgot-password OTP for email-login accounts (Admin + Manager).
 * Regular tenant/owner phone-based reset is unaffected — see ./send-otp/route.ts.
 */
export async function POST(req: NextRequest) {
  try {
    const { email: rawEmail } = await req.json();
    const email = (rawEmail || "").toLowerCase().trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: "Invalid email address" }, { status: 400 });
    }

    const cooldown = await checkRateLimit(`otp:email:send:cooldown:${email}`, 1, 60);
    if (!cooldown.allowed) {
      return NextResponse.json({ success: false, message: "Please wait a minute before requesting another OTP" }, { status: 429 });
    }
    const hourly = await checkRateLimit(`otp:email:send:hourly:${email}`, 5, 3600);
    if (!hourly.allowed) {
      return NextResponse.json({ success: false, message: "Too many OTP requests. Please try again later" }, { status: 429 });
    }

    // Admin accounts live in `User`, Managers live in `PgTeamMember` — check both.
    const admin = await db.user.findFirst({ where: { email, role: "ADMIN" } });
    const manager = admin ? null : await db.pgTeamMember.findFirst({ where: { email } });

    // Always return success even if the email isn't found — don't leak account existence.
    if (!admin && !manager) {
      return NextResponse.json({ success: true, message: "If that email is registered, an OTP has been sent" });
    }

    const accountType = admin ? "ADMIN" : "MANAGER";
    const name = admin ? admin.name : manager!.name;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await db.otpCode.create({
      data: {
        userId: admin ? admin.id : null,
        email,
        accountType,
        code: otp,
        purpose: "PASSWORD_RESET",
        expiresAt,
        isUsed: false,
      },
    });

    await sendOtpEmail(email, otp, name);

    return NextResponse.json({ success: true, message: "OTP sent to your email" });
  } catch (error: any) {
    console.error("Send OTP Email Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
