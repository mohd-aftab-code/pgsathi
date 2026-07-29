/**
 * app/api/payment/webhook/route.ts
 * Razorpay server-to-server payment notifications.
 *
 * WHY THIS EXISTS: activation used to depend entirely on the browser calling
 * /api/subscription after checkout. If the customer closed the tab, lost signal,
 * or the callback failed, the money was taken and nothing happened — no
 * subscription, no invoice, and (now that commission is recurring) no partner
 * commission, silently, on every such payment.
 *
 * Razorpay retries this endpoint until it gets a 2xx, so it is the reliable path.
 * It is also idempotent: a replayed event finds the payment already recorded and
 * changes nothing.
 *
 * SETUP: add this URL in the Razorpay dashboard (Settings → Webhooks) for the
 * `payment.captured` event and set RAZORPAY_WEBHOOK_SECRET to the signing secret
 * shown there. Without that env var the route refuses everything, because an
 * unverified webhook is an open door to free subscriptions.
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { cycleEndDate, isValidCycle, priceForCycle, type CycleId } from "@/lib/billing";
import { sendSubscriptionActiveEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhook] RAZORPAY_WEBHOOK_SECRET is not set — rejecting");
    return NextResponse.json({ success: false }, { status: 500 });
  }

  // The signature covers the exact bytes Razorpay sent, so verify BEFORE parsing.
  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  // timingSafeEqual throws on a length mismatch, so check that first.
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ success: false, message: "Bad payload" }, { status: 400 });
  }

  if (event?.event !== "payment.captured") {
    // Acknowledge everything else so Razorpay stops retrying events we ignore.
    return NextResponse.json({ success: true, ignored: event?.event ?? "unknown" });
  }

  const payment = event?.payload?.payment?.entity;
  const paymentId: string | undefined = payment?.id;
  const orderId: string | undefined = payment?.order_id;
  const notes = payment?.notes ?? {};
  const userId = parseInt(String(notes.userId ?? ""));
  const planSlug = String(notes.planId ?? "");
  const cycle: CycleId = isValidCycle(notes.billingCycle) ? notes.billingCycle : "MONTHLY";

  if (!paymentId || Number.isNaN(userId) || !planSlug) {
    // Nothing actionable, but 200 so Razorpay doesn't retry forever.
    console.error("[webhook] payment.captured without usable notes", { paymentId, orderId, notes });
    return NextResponse.json({ success: true, ignored: "missing notes" });
  }

  try {
    // Idempotency: if the browser callback already recorded this payment, stop.
    const already = await db.subscription.findFirst({
      where: { razorpayPaymentId: paymentId },
      select: { id: true },
    });
    if (already) return NextResponse.json({ success: true, alreadyRecorded: true });

    const plan = await db.plan.findUnique({
      where: { slug: planSlug },
      select: { id: true, name: true, price: true, quarterlyPrice: true, halfYearlyPrice: true, yearlyPrice: true },
    });
    if (!plan) {
      console.error("[webhook] unknown plan slug", planSlug);
      return NextResponse.json({ success: true, ignored: "unknown plan" });
    }

    // Trust our own pricing, not the amount in the event.
    const amount = priceForCycle(plan, cycle);
    if (amount === null || amount <= 0) {
      return NextResponse.json({ success: true, ignored: "plan not purchasable on this cycle" });
    }

    const startDate = new Date();
    const endDate = cycleEndDate(startDate, cycle);

    const invoiceId = await db.$transaction(async (tx) => {
      // Same supersede rule as the checkout route — never leave two live plans.
      await tx.subscription.updateMany({
        where: { userId, status: { in: ["ACTIVE", "TRIAL", "PAST_DUE"] } },
        data: { status: "EXPIRED", autoRenew: false },
      });
      const sub = await tx.subscription.create({
        data: {
          userId, planId: plan.id, status: "ACTIVE", billingCycle: cycle, amount,
          startDate, endDate,
          razorpaySubId: orderId ?? paymentId,
          razorpayOrderId: orderId ?? null,
          razorpayPaymentId: paymentId,
        },
        select: { id: true },
      });
      const inv = await tx.invoice.create({
        data: {
          subscriptionId: sub.id, amount, status: "PAID",
          razorpayOrderId: orderId ?? null, razorpayPayId: paymentId,
          invoiceDate: startDate, paidAt: startDate,
          billingCycle: cycle, periodStart: startDate, periodEnd: endDate,
        },
        select: { id: true },
      });
      await tx.user.updateMany({ where: { id: userId, role: "TENANT" }, data: { role: "OWNER" } });
      return inv.id;
    });

    // Outside the transaction: a commission failure must not undo a real payment.
    try {
      const { createEarningForInvoice } = await import("@/lib/partner-earnings");
      await createEarningForInvoice(invoiceId);
    } catch (e) {
      console.error("[webhook] partner earning failed (non-fatal):", e);
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    if (user?.email && plan?.name) {
      await sendSubscriptionActiveEmail(user.email, user.name, plan.name, amount).catch((e) => {
        console.error("[WEBHOOK_SUBSCRIPTION_EMAIL_ERROR]", e);
      });
    }

    return NextResponse.json({ success: true, recorded: true });
  } catch (e) {
    // 500 makes Razorpay retry, which is what we want for a transient DB error.
    console.error("[webhook] failed to record payment", e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
