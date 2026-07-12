import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * POST — completes an email-based password reset for Admin/Manager accounts.
 * See ./send-otp-email/route.ts for how the OTP gets sent.
 */
export async function POST(req: NextRequest) {
  try {
    const { email: rawEmail, otp, newPassword } = await req.json();
    const email = (rawEmail || "").toLowerCase().trim();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, message: "Password must be at least 6 characters" }, { status: 400 });
    }

    const attempts = await checkRateLimit(`otp:email:verify:${email}`, 5, 600);
    if (!attempts.allowed) {
      return NextResponse.json({ success: false, message: "Too many attempts. Please request a new OTP" }, { status: 429 });
    }

    const validOtp = await db.otpCode.findFirst({
      where: {
        email,
        code: otp,
        purpose: "PASSWORD_RESET",
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!validOtp) {
      return NextResponse.json({ success: false, message: "Invalid or expired OTP" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (validOtp.accountType === "MANAGER") {
      const manager = await db.pgTeamMember.findFirst({ where: { email } });
      if (!manager) {
        return NextResponse.json({ success: false, message: "Account not found" }, { status: 404 });
      }
      await db.pgTeamMember.update({ where: { id: manager.id }, data: { passwordHash: hashedPassword } });
    } else {
      if (!validOtp.userId) {
        return NextResponse.json({ success: false, message: "Account not found" }, { status: 404 });
      }
      await db.user.update({ where: { id: validOtp.userId }, data: { passwordHash: hashedPassword } });
    }

    await db.otpCode.update({ where: { id: validOtp.id }, data: { isUsed: true } });

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error: any) {
    console.error("Reset Password (Email) Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
