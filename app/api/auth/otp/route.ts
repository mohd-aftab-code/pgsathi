import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendOtpEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { action, phone, email, name } = await req.json();

    if (!phone) {
      return NextResponse.json({ success: false, message: "Phone number is required" }, { status: 400 });
    }

    if (action === "send") {
      // 1. Generate 6 digit OTP (Hardcoded to 123456 for testing)
      const otp = "123456";

      // 2. Set expiry (5 minutes)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5);

      // 3. Save OTP to database
      await db.otpCode.create({
        data: {
          phone,
          code: otp,
          expiresAt,
          purpose: "login",
        },
      });

      // 4. Send via Email (since we don't have SMS API yet)
      if (email && name) {
        await sendOtpEmail(email, otp, name);
      }

      // Temporary for testing - delete in production
      console.log(`[DEV] OTP for ${phone} is ${otp}`);

      return NextResponse.json({ 
        success: true, 
        message: "OTP sent successfully" 
      });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("OTP API Error:", error);
    return NextResponse.json({ success: false, message: "Failed to process OTP request" }, { status: 500 });
  }
}
