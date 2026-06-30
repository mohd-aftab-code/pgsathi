import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { planId, amount, razorpayPaymentId, razorpayOrderId, razorpaySignature } = await req.json();

    if (!planId) {
      return NextResponse.json({ success: false, message: "Missing planId" }, { status: 400 });
    }

    // Verify signature for paid plans
    if (amount > 0 && razorpayPaymentId && razorpayOrderId && razorpaySignature) {
      const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
        .update(razorpayOrderId + "|" + razorpayPaymentId)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        return NextResponse.json({ success: false, message: "Invalid payment signature" }, { status: 400 });
      }
    }

    // 1. Get the plan from DB, or fallback to dummy data if plans aren't seeded
    let plan = await db.plan.findUnique({ where: { slug: planId } });
    
    if (!plan) {
      // Create it if it doesn't exist for the simulation
      plan = await db.plan.create({
        data: {
          name: planId === "pro" ? "Pro Owner" : (planId === "free" ? "Starter" : "Growth"),
          slug: planId,
          price: amount,
          maxListings: planId === "pro" ? 999 : (planId === "free" ? 1 : 5),
          maxPhotos: planId === "pro" ? 99 : (planId === "free" ? 5 : 10),
          features: [],
        }
      });
    }

    // 2. Create the subscription
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // 30 days from now

    const subscription = await db.subscription.create({
      data: {
        userId: parseInt(session.user.id),
        planId: plan.id,
        status: "ACTIVE",
        billingCycle: "MONTHLY",
        amount: amount,
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
