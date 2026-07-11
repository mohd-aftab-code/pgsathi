/**
 * app/api/admin/users/route.ts
 * Super Admin API to manage PG Owner accounts (extend trials, activate plans manually)
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false }, { status: 401 });
    
    // Validate Admin Role
    const admin = await db.user.findUnique({ where: { id: parseInt(session.user.id) } });
    if (!admin || admin.role !== "ADMIN") return NextResponse.json({ success: false }, { status: 403 });

    const data = await req.json();
    const { action, userId, days, planId } = data; // action: 'extend_trial' | 'activate_plan'

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
      // Manually activate a plan (bypassing payment)
      const targetPlanId = planId ? parseInt(planId) : 1; // Default to basic plan if none specified
      
      const plan = await db.plan.findUnique({ where: { id: targetPlanId } });
      if (!plan) return NextResponse.json({ success: false, message: "Plan not found" }, { status: 404 });

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // default 1 month

      await db.subscription.create({
        data: {
          userId: parseInt(userId),
          planId: plan.id,
          status: "ACTIVE",
          billingCycle: "MONTHLY",
          amount: plan.price,
          startDate,
          endDate,
          autoRenew: false
        }
      });
      
      return NextResponse.json({ success: true, message: `Plan ${plan.name} activated for 1 month` });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });

  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
