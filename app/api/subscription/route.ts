import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { isValidPlanId, getPlanTotalAmount, PLANS } from "@/lib/plans";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { planId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = await req.json();

    if (!planId || !isValidPlanId(planId)) {
      return NextResponse.json({ success: false, message: "Invalid plan" }, { status: 400 });
    }

    // Amount is derived server-side from the canonical plan price — never trust the client for this.
    const amount = getPlanTotalAmount(planId);

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

    // Get the plan from DB, or create it from the canonical definition if it doesn't exist yet
    let plan = await db.plan.findUnique({ where: { slug: planId } });

    if (!plan) {
      const def = PLANS[planId];
      const LIMITS: Record<typeof planId, { maxListings: number; maxPhotos: number; maxTenants: number }> = {
        free:  { maxListings: 1,   maxPhotos: 5,  maxTenants: 5 },
        basic: { maxListings: 2,   maxPhotos: 10, maxTenants: 50 },
        pro:   { maxListings: 5,   maxPhotos: 30, maxTenants: 100 },
        scale: { maxListings: -1,  maxPhotos: 99, maxTenants: -1 },
      };
      const limits = LIMITS[planId];
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

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // 30 days from now

    const subscription = await db.subscription.create({
      data: {
        userId: parseInt(session.user.id),
        planId: plan.id,
        status: "ACTIVE",
        billingCycle: "MONTHLY",
        amount,
        startDate: new Date(),
        endDate: endDate,
        razorpaySubId: razorpayOrderId || `sim_sub_${Date.now()}`,
        razorpayOrderId: razorpayOrderId || `sim_order_${Date.now()}`,
        razorpayPaymentId: razorpayPaymentId || `sim_pay_${Date.now()}`,
      }
    });

    // 3. Update User Role to OWNER if they were TENANT
    if (session.user.role === "TENANT") {
      await db.user.update({
        where: { id: parseInt(session.user.id) },
        data: { role: "OWNER" }
      });
    }

    return NextResponse.json({ success: true, data: subscription });
  } catch (error: any) {
    console.error("Subscription Error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}
