import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendSubscriptionExpiryEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // Basic protection to ensure only authorized cron jobs can trigger this.
    // In Vercel, set CRON_SECRET in Environment Variables.
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const today = new Date();
    
    // Check for subscriptions expiring in exactly 3 days
    const in3DaysStart = new Date(today);
    in3DaysStart.setDate(today.getDate() + 3);
    in3DaysStart.setHours(0, 0, 0, 0);

    const in3DaysEnd = new Date(in3DaysStart);
    in3DaysEnd.setHours(23, 59, 59, 999);

    const expiringSoon = await db.subscription.findMany({
      where: {
        status: "ACTIVE",
        endDate: {
          gte: in3DaysStart,
          lte: in3DaysEnd,
        },
      },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    let emailedCount = 0;

    for (const sub of expiringSoon) {
      if (sub.user?.email) {
        await sendSubscriptionExpiryEmail(sub.user.email, sub.user.name, 3).catch(e => {
          console.error(`[CRON_EXPIRY_EMAIL_ERROR] for ${sub.user.email}`, e);
        });
        emailedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Sent expiry reminder to ${emailedCount} user(s).`,
      processed: expiringSoon.length 
    });
  } catch (error) {
    console.error("[CRON_EXPIRY_ERROR]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
