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

    /**
     * Hard-delete a user.
     *
     * A plain `user.delete()` fails for anyone who has ever transacted. Deleting
     * the user cascades into their subscriptions, tenants and rooms, but three
     * child tables are RESTRICT and refuse to go with them:
     *
     *   invoices.subscriptionId      → blocks the subscription cascade
     *   pg_payments.tenantId         → blocks the tenant cascade
     *   pg_rent_bills.tenantId       → blocks the tenant cascade
     *   pg_meter_readings.roomId     → blocks the room cascade
     *
     * Postgres raises this as a bare 23001 that Prisma wraps in a connector
     * error, which is why the old handler surfaced an unreadable wall of text.
     * Clearing those rows first, in one transaction, is what makes the delete
     * actually work.
     */
    if (action === "delete") {
      const uid = parseInt(userId);

      const [paidInvoices, revenue] = await Promise.all([
        db.invoice.count({ where: { subscription: { userId: uid }, status: "PAID" } }),
        db.invoice.aggregate({
          where: { subscription: { userId: uid }, status: "PAID" },
          _sum: { amount: true },
        }),
      ]);

      // Invoices are financial records. Wiping a paying customer should be a
      // deliberate act, not something that happens because a button was handy —
      // so it needs a second, explicit confirmation.
      if (paidInvoices > 0 && data.force !== true) {
        return NextResponse.json(
          {
            success: false,
            requiresForce: true,
            message:
              `Is user ke ${paidInvoices} paid invoice hain (₹${(revenue._sum.amount ?? 0).toLocaleString("en-IN")} ka record). ` +
              `Delete karne par ye payment history hamesha ke liye chali jayegi. ` +
              `Behtar hai "Ban" kar dein — account band ho jayega par record bacha rahega. ` +
              `Phir bhi delete karna hai to dobara confirm karein.`,
            data: { paidInvoices, revenue: revenue._sum.amount ?? 0 },
          },
          { status: 409 },
        );
      }

      const removed = await db.$transaction(async (tx) => {
        // 1. Rows that hold rooms hostage.
        const listingIds = (
          await tx.listing.findMany({ where: { ownerId: uid }, select: { id: true } })
        ).map((l) => l.id);
        if (listingIds.length) {
          const roomIds = (
            await tx.room.findMany({ where: { listingId: { in: listingIds } }, select: { id: true } })
          ).map((r) => r.id);
          if (roomIds.length) await tx.pgMeterReading.deleteMany({ where: { roomId: { in: roomIds } } });
        }
        await tx.pgMeterReading.deleteMany({ where: { ownerId: uid } });

        // 2. Rows that hold tenants hostage.
        const tenantIds = (
          await tx.pgTenant.findMany({
            where: { OR: [{ ownerId: uid }, { userId: uid }] },
            select: { id: true },
          })
        ).map((t) => t.id);
        if (tenantIds.length) {
          await tx.pgPayment.deleteMany({ where: { tenantId: { in: tenantIds } } });
          await tx.pgRentBill.deleteMany({ where: { tenantId: { in: tenantIds } } });
        }
        await tx.pgPayment.deleteMany({ where: { ownerId: uid } });
        await tx.pgRentBill.deleteMany({ where: { ownerId: uid } });

        // 3. Rows that hold subscriptions hostage.
        const invoices = await tx.invoice.deleteMany({ where: { subscription: { userId: uid } } });

        // Everything else follows the user out via ON DELETE CASCADE.
        await tx.user.delete({ where: { id: uid } });

        return { invoices: invoices.count, listings: listingIds.length, tenants: tenantIds.length };
      },
      // Prisma's 5s default is not enough: this is a dozen round trips to a
      // remote Postgres, and a busy account tips over it. A timeout here fails
      // the whole delete with a message that looks nothing like the real cause.
      { timeout: 30_000, maxWait: 10_000 });

      return NextResponse.json({
        success: true,
        message:
          `User delete ho gaya` +
          (removed.listings || removed.tenants || removed.invoices
            ? ` — ${removed.listings} PG, ${removed.tenants} tenant, ${removed.invoices} invoice bhi hate`
            : ""),
        data: removed,
      });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });

  } catch (err: unknown) {
    // Prisma wraps a foreign-key violation in a multi-line connector error, and
    // dumping that raw into a toast is why "delete nahi ho raha" came with no
    // usable explanation. Name the blocking table instead.
    const raw = err instanceof Error ? err.message : String(err);
    const fk = raw.match(/foreign key constraint "(\w+)" on table "(\w+)"/);
    const message = fk
      ? `Ye record delete nahi ho sakta — "${fk[2]}" table me iska data juda hua hai. Pehle wo hataana hoga.`
      : raw.split("\n").map((l) => l.trim()).filter(Boolean).pop() || "Kuch galat ho gaya";

    console.error("[admin/users]", raw);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
