/**
 * app/api/cron/partner-earnings/route.ts
 * Daily job: approve what has cleared the refund window.
 *
 * Approving every earning by hand was the programme's scale ceiling — a few
 * hundred identical clicks a month — and the delay it caused was what partners
 * actually felt ("mera paisa admin ke mood par atka hai"). Anything needing
 * judgement is still left for a human; see lib/partner-earnings#runAutoApproval
 * for exactly what that means.
 *
 * Schedule daily. In Vercel, set CRON_SECRET and add to vercel.json:
 *   { "path": "/api/cron/partner-earnings", "schedule": "0 4 * * *" }
 */
import { NextResponse } from "next/server";
import { runAutoApproval } from "@/lib/partner-earnings";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const result = await runAutoApproval();
    console.log(
      `[cron/partner-earnings] considered ${result.considered}, approved ${result.approved}, ₹${result.amount}`,
    );
    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    console.error("[cron/partner-earnings] failed", e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
