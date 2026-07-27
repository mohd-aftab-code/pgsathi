/**
 * app/api/admin/users/route.ts
 * Super Admin API to manage PG Owner accounts (extend trials, activate plans manually)
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { cycleEndDate, isValidCycle, priceForCycle, type CycleId } from "@/lib/billing";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false }, { status: 401 });
    
    // Validate Admin Role
    const admin = await db.user.findUnique({ where: { id: parseInt(session.user.id) } });
    if (!admin || admin.role !== "ADMIN") return NextResponse.json({ success: false }, { status: 403 });

    const data = await req.json();
    const { action, userId, days, planId, billingCycle } = data; // action: 'extend_trial' | 'activate_plan'

    if (!userId || !action) {
      return NextResponse.json({ success: false, message: "Missing params" }, { status: 400 });
    }

    if (action === "extend_trial") {
      // To extend a trial by N days, we push their createdAt forward in time.
      // E.g., if trial is 15 days from createdAt, setting createdAt to Date.now() resets it to 15 days full.
      // If we want to add `days` to current, we just add to createdAt.
      const user = await db.user.findUnique({ where: { id: parseInt(userId) } });
      if (!user) return NextResponse.json({ success: false }, { status: 404 });
      
      const newCreatedAt = new Date(user.createdAt);
      newCreatedAt.setDate(newCreatedAt.getDate() + (parseInt(days) || 7));
      
      await db.user.update({
        where: { id: parseInt(userId) },
        data: { createdAt: newCreatedAt }
      });
      return NextResponse.json({ success: true, message: `Trial extended by ${days} days` });
    }
    
    if (action === "activate_plan") {
      // Manually activate a plan (bypassing payment).
      //
      // This must do everything a real payment does, not just insert a
      // subscription row. An admin-granted plan is still a conversion: the owner
      // gets the plan, so their partner has earned commission on it. Previously
      // this wrote only the subscription — no invoice, no commission — so a
      // partner's dashboard stayed empty and the plan looked broken.
      const targetPlanId = planId ? parseInt(planId) : 1; // Default to basic plan if none specified
      const uid = parseInt(userId);

      const plan = await db.plan.findUnique({ where: { id: targetPlanId } });
      if (!plan) return NextResponse.json({ success: false, message: "Plan not found" }, { status: 404 });

      const cycle = (isValidCycle(billingCycle) ? billingCycle : "MONTHLY") as import("@prisma/client").BillingCycle;
      const amount = priceForCycle(plan, cycle as import("@prisma/client").BillingCycle | "MONTHLY" | "QUARTERLY" | "HALF_YEARLY" | "YEARLY" as any);
      if (amount === null) {
        return NextResponse.json({ success: false, message: "Ye plan is duration par available nahi hai" }, { status: 400 });
      }

      const startDate = new Date();
      const endDate = cycleEndDate(startDate, cycle as any);

      const invoiceId = await db.$transaction(async (tx) => {
        // Same supersede rule as checkout — never leave two live plans, or a
        // downgrade keeps granting the older, higher plan's limits.
        await tx.subscription.updateMany({
          where: { userId: uid, status: { in: ["ACTIVE", "TRIAL", "PAST_DUE"] } },
          data: { status: "EXPIRED", autoRenew: false },
        });

        const sub = await tx.subscription.create({
          data: {
            userId: uid,
            planId: plan.id,
            status: "ACTIVE",
            billingCycle: cycle,
            amount,
            startDate,
            endDate,
            autoRenew: false,
          },
          select: { id: true },
        });

        // Marked ADMIN_GRANTED, not PAID — no money actually changed hands, and
        // the owner's payment history should say so honestly.
        const inv = await tx.invoice.create({
          data: {
            subscriptionId: sub.id,
            amount,
            status: amount > 0 ? "ADMIN_GRANTED" : "FREE",
            invoiceDate: startDate,
            paidAt: startDate,
            periodStart: startDate,
            periodEnd: endDate,
          },
          select: { id: true },
        });

        await tx.user.updateMany({ where: { id: uid, role: "TENANT" }, data: { role: "OWNER" } });
        return inv.id;
      });

      // Outside the transaction: a commission hiccup must not undo the plan.
      let commission = 0;
      if (amount > 0) {
        try {
          const { createEarningForInvoice } = await import("@/lib/partner-earnings");
          const earningId = await createEarningForInvoice(invoiceId);
          if (earningId) {
            const e = await db.partnerEarning.findUnique({ where: { id: earningId }, select: { amount: true } });
            commission = e?.amount ?? 0;
          }
        } catch (e) {
          console.error("[admin activate_plan] partner earning failed (non-fatal):", e);
        }
      }

      return NextResponse.json({
        success: true,
        message:
          `${plan.name} (${cycle}) activated` +
          (commission > 0 ? ` — partner commission ₹${commission.toLocaleString("en-IN")} ban gaya` : ""),
        data: { invoiceId, amount, commission },
      });
    }

    if (action === "ban") {
      const user = await db.user.findUnique({ where: { id: parseInt(userId) }, select: { isActive: true } });
      if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
      await db.user.update({ where: { id: parseInt(userId) }, data: { isActive: !user.isActive } });
      return NextResponse.json({ success: true, message: user.isActive ? "User banned." : "User unbanned." });
    }

    if (action === "change_role") {
      const { newRole } = data;
      const validRoles = ["ADMIN", "OWNER", "TENANT"];
      if (!validRoles.includes(newRole)) return NextResponse.json({ success: false, message: "Invalid role" }, { status: 400 });
      await db.user.update({ where: { id: parseInt(userId) }, data: { role: newRole as import("@prisma/client").UserRole } });
      return NextResponse.json({ success: true, message: `Role changed to ${newRole}` });
    }

    if (action === "delete") {
      await db.user.delete({ where: { id: parseInt(userId) } });
      return NextResponse.json({ success: true, message: "User deleted successfully" });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });

  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
