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
      // 1. Hardcoded OTP for testing
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

      // Temporary for testing - ALWAYS log OTP in console
      console.log(`\n========================================`);
      console.log(`[DEV MODE] OTP for ${phone} is: ${otp}`);
      console.log(`========================================\n`);

      // 4. Send via Fast2SMS (If API Key is available)
      const fast2smsKey = process.env.FAST2SMS_API_KEY;

      if (fast2smsKey) {
        try {
          const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
            method: "POST",
            headers: {
              "authorization": fast2smsKey,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              route: "q", // "q" is for Quick SMS (no DLT required for testing)
              message: `Your PGSathi verification OTP is ${otp}. Do not share this with anyone.`,
              language: "english",
              flash: 0,
              numbers: phone,
            })
          });
          
          const result = await response.json();
          // console.log("Fast2SMS Response:", result);
        } catch (smsError) {
          console.error("Fast2SMS Failed:", smsError);
        }
      }

      // Send via Email as backup if email is provided
      if (email && name) {
        await sendOtpEmail(email, otp, name);
      }

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
