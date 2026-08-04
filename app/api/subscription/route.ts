import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { isValidPlanId, PLANS, PLAN_LIMITS } from "@/lib/plans";
import { cycleEndDate, isValidCycle, priceForCycle, type CycleId } from "@/lib/billing";
import { sendSubscriptionActiveEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  // Held outside the try so the P2002 handler below can identify the payment —
  // the request body can only be read once.
  let capturedPaymentId: string | null = null;
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Only OWNER accounts can purchase or activate a subscription.
    if (session.user.role !== "OWNER") {
      return NextResponse.json({ success: false, message: "Only PG owners can purchase a plan" }, { status: 403 });
    }

    const { planId, razorpayPaymentId, razorpayOrderId, razorpaySignature, billingCycle } = await req.json();
    capturedPaymentId = typeof razorpayPaymentId === "string" ? razorpayPaymentId : null;

    if (!planId || typeof planId !== "string") {
      return NextResponse.json({ success: false, message: "Invalid plan" }, { status: 400 });
    }

    // Default to MONTHLY so existing callers that don't send a cycle keep working.
    const cycle: CycleId = isValidCycle(billingCycle) ? billingCycle : "MONTHLY";

    // The plan (and therefore its price) is the DB row — super-admin controlled.
    // For a canonical slug whose row doesn't exist yet, seed it from the fallback.
    let plan = await db.plan.findUnique({ where: { slug: planId } });
    if (!plan && isValidPlanId(planId)) {
      const def = PLANS[planId];
      const limits = PLAN_LIMITS[planId];
      plan = await db.plan.create({
        data: {
          name: def.name,
          slug: planId,
          price: def.price,
          maxListings: limits.maxListings,
          maxPhotos: limits.maxPhotos,
          maxTenants: limits.maxTenants,
          features: [],
        }
      });
    }
    if (!plan) {
      return NextResponse.json({ success: false, message: "Invalid plan" }, { status: 400 });
    }

    // Amount is derived server-side from the DB plan price for the chosen cycle —
    // never trust the client. A null price means the plan doesn't offer that
    // cycle, which must be rejected rather than silently billed as free.
    const cyclePrice = priceForCycle(plan, cycle);
    if (cyclePrice === null) {
      return NextResponse.json(
        { success: false, message: "Ye plan is duration par available nahi hai" },
        { status: 400 },
      );
    }
    const amount = cyclePrice;

    if (amount > 0) {
      if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
        return NextResponse.json({ success: false, message: "Payment verification is required for this plan" }, { status: 400 });
      }

      if (!process.env.RAZORPAY_KEY_SECRET) {
        console.error("RAZORPAY_KEY_SECRET is not configured");
        return NextResponse.json({ success: false, message: "Payments are not configured" }, { status: 500 });
      }

      if (!verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
        return NextResponse.json({ success: false, message: "Invalid payment signature" }, { status: 400 });
      }
    }

    const startDate = new Date();
    const endDate = cycleEndDate(startDate, cycle);

    // Superseding the previous subscription and creating the new one must happen
    // together. Without this an owner accumulates several live rows at once: a
    // downgrade would leave the OLD, higher plan ACTIVE with a later endDate, and
    // the "current plan" lookup (order by endDate desc) would keep granting the
    // higher limits the owner has stopped paying for.
    const userId = parseInt(session.user.id);
    const subscription = await db.$transaction(async (tx) => {
      await tx.subscription.updateMany({
        where: { userId, status: { in: ["ACTIVE", "TRIAL", "PAST_DUE"] } },
        data: { status: "EXPIRED", autoRenew: false },
      });
      return tx.subscription.create({
        data: {
          userId,
          planId: plan.id,
          status: "ACTIVE",
          billingCycle: cycle,
          amount,
          startDate,
          endDate,
          razorpaySubId: razorpayOrderId || `sim_sub_${Date.now()}`,
          razorpayOrderId: razorpayOrderId || `sim_order_${Date.now()}`,
          razorpayPaymentId: razorpayPaymentId || `sim_pay_${Date.now()}`,
        },
      });
    });

    // Every payment gets an Invoice row. This is the billing record the owner,
    // the admin and the partner all read from — and it is what partner commission
    // is calculated against, so it must exist before the earning is created.
    const invoice = await db.invoice.create({
      data: {
        subscriptionId: subscription.id,
        amount,
        status: amount > 0 ? "PAID" : "FREE",
        razorpayOrderId: razorpayOrderId || null,
        razorpayPayId: razorpayPaymentId || null,
        invoiceDate: startDate,
        paidAt: amount > 0 ? startDate : null,
        billingCycle: cycle,
        periodStart: startDate,
        periodEnd: endDate,
      },
      select: { id: true },
    });

    // 3. Update User Role to OWNER if they were TENANT
    if (session.user.role === "TENANT") {
      await db.user.update({
        where: { id: parseInt(session.user.id) },
        data: { role: "OWNER" }
      });
    }

    // 4. Partner commission for THIS payment. Recurring by construction — every
    //    renewal writes a new invoice and earns again; stop renewing and it stops.
    //    Non-fatal: a partner accounting hiccup must never fail the owner's payment.
    if (amount > 0) {
      try {
        const { createEarningForInvoice } = await import("@/lib/partner-earnings");
        await createEarningForInvoice(invoice.id);
      } catch (e) {
        console.error("[subscription] partner earning trigger failed (non-fatal):", e);
      }
    }

    // 5. Two-sided referral: the owner who came in through someone else's link
    //    gets bonus days on this plan. Granted once per user ever, so a renewal
    //    cannot farm it. Non-fatal for the same reason as the commission above.
    let bonusDays = 0;
    if (amount > 0) {
      try {
        const { applyReferralBonusDays } = await import("@/lib/referral");
        bonusDays = await applyReferralBonusDays(userId, subscription.id);
      } catch (e) {
        console.error("[subscription] referral bonus failed (non-fatal):", e);
      }
    }

    const userObj = await db.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    });
    
    if (userObj?.email && plan?.name) {
      await sendSubscriptionActiveEmail(userObj.email, userObj.name, plan.name, amount).catch((e) => {
        console.error("[SUBSCRIPTION_ACTIVE_EMAIL_ERROR]", e);
      });
    }

    return NextResponse.json({
      success: true,
      data: subscription,
      bonusDays,
      message: bonusDays > 0 ? `Referral bonus: ${bonusDays} din extra mile 🎉` : undefined,
    });
  } catch (error: any) {
    // P2002 on razorpayPaymentId means the webhook already recorded this exact
    // payment. The customer is subscribed — reporting a failure here would be
    // wrong and would push them to pay again.
    if (error?.code === "P2002" && String(error?.meta?.target ?? "").includes("razorpayPaymentId") && capturedPaymentId) {
      const existing = await db.subscription
        .findFirst({ where: { razorpayPaymentId: capturedPaymentId } })
        .catch(() => null);
      return NextResponse.json({ success: true, data: existing, alreadyRecorded: true });
    }
    console.error("Subscription Error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}
