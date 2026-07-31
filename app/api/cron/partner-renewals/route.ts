/**
 * app/api/cron/partner-renewals/route.ts
 * Daily job: tell partners whose owners are about to lapse.
 *
 * The dashboard already counted "Renewal Due — next 30 days", but a number a
 * partner has to log in to see does nothing. Commission is recurring, so a
 * renewal the partner chases is money for both sides; this turns the number
 * into a nudge with the amount at stake attached.
 *
 * Runs on the 7-, 3- and 1-day marks so a partner gets a sequence, not a single
 * message they might miss.
 *
 * Schedule daily. In Vercel, set CRON_SECRET and add to vercel.json:
 *   { "path": "/api/cron/partner-renewals", "schedule": "30 4 * * *" }
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifyPartner } from "@/lib/partner-notify";
import { computeCommission, commissionWindowOpen } from "@/lib/partner-earnings";

export const dynamic = "force-dynamic";

const REMIND_ON_DAYS = [7, 3, 1];

function dayWindow(daysAhead: number) {
  const start = new Date();
  start.setDate(start.getDate() + daysAhead);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    let sent = 0;

    for (const days of REMIND_ON_DAYS) {
      const { start, end } = dayWindow(days);

      const expiring = await db.subscription.findMany({
        where: {
          status: { in: ["ACTIVE", "TRIAL"] },
          endDate: { gte: start, lte: end },
          // Only owners a partner actually brought in.
          user: { partnerId: { not: null } },
        },
        select: {
          amount: true,
          endDate: true,
          plan: {
            select: {
              name: true,
              partnerCommissionType: true,
              partnerCommissionValue: true,
              partnerCommissionMonths: true,
            },
          },
          user: {
            select: { id: true, name: true, phone: true, partnerId: true, partnerAttributedAt: true },
          },
        },
      });

      for (const sub of expiring) {
        const partnerId = sub.user.partnerId;
        if (!partnerId) continue;

        // No point chasing a renewal the partner will not earn on.
        if (!commissionWindowOpen(sub.user.partnerAttributedAt, sub.plan.partnerCommissionMonths)) {
          continue;
        }

        const { amount } = computeCommission({ plan: sub.plan, invoiceAmount: sub.amount });
        const stake = amount > 0 ? ` — ₹${amount.toLocaleString("en-IN")} ka commission daav par hai` : "";

        await notifyPartner({
          partnerId,
          type: "SUBSCRIPTION",
          title: `Renewal ${days} din me — ${sub.user.name}`,
          message:
            `${sub.user.name} ka ${sub.plan.name} plan ${days} din me expire ho raha hai${stake}. ` +
            `Call karke renew karwa lein${sub.user.phone ? ` (${sub.user.phone})` : ""}.`,
          link: "/partner/owners",
        });
        sent++;
      }
    }

    console.log(`[cron/partner-renewals] ${sent} reminders sent`);
    return NextResponse.json({ success: true, sent });
  } catch (e) {
    console.error("[cron/partner-renewals] failed", e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
