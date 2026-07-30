import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendOtpEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * POST — forgot-password OTP for email-based reset for all accounts (Owner, Tenant, Partner, Admin, Manager).
 */
export async function POST(req: NextRequest) {
  try {
    const { email: rawEmail } = await req.json();
    const email = (rawEmail || "").toLowerCase().trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: "Invalid email address" }, { status: 400 });
    }

    // IP-based rate limit: max 10 OTP requests per hour per IP
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const ipLimit = await checkRateLimit(`otp:email:send:ip:${ip}`, 10, 3600);
    if (!ipLimit.allowed) {
      return NextResponse.json({ success: false, message: "Too many OTP requests from this IP. Please try again later" }, { status: 429 });
    }

    const cooldown = await checkRateLimit(`otp:email:send:cooldown:${email}`, 1, 60);
    if (!cooldown.allowed) {
      return NextResponse.json({ success: false, message: "Please wait a minute before requesting another OTP" }, { status: 429 });
    }
    const hourly = await checkRateLimit(`otp:email:send:hourly:${email}`, 5, 3600);
    if (!hourly.allowed) {
      return NextResponse.json({ success: false, message: "Too many OTP requests. Please try again later" }, { status: 429 });
    }

    // Check all roles in User, plus Managers in PgTeamMember
    const user = await db.user.findFirst({ where: { email } });
    const manager = user ? null : await db.pgTeamMember.findFirst({ where: { email } });

    // Always return success even if the email isn't found — don't leak account existence.
    if (!user && !manager) {
      return NextResponse.json({ success: true, message: "If that email is registered, an OTP has been sent" });
    }

    const accountType = user ? "USER" : "MANAGER";
    const name = user ? user.name : manager!.name;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await db.otpCode.create({
      data: {
        userId: user ? user.id : null,
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
