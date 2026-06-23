import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { planId, amount } = await req.json();

    if (!planId) {
      return NextResponse.json({ success: false, message: "Missing planId" }, { status: 400 });
    }

    // Since this is a simulated payment, we will just create a basic subscription directly.
    // In a real app, you would verify the Razorpay signature here.

    // 1. Get the plan from DB, or fallback to dummy data if plans aren't seeded
    let plan = await db.plan.findUnique({ where: { slug: planId } });
    
    if (!plan) {
      // Create it if it doesn't exist for the simulation
      plan = await db.plan.create({
        data: {
          name: planId === "pro" ? "Pro Owner" : "Growth",
          slug: planId,
          price: amount,
          maxListings: planId === "pro" ? 999 : 5,
          maxPhotos: planId === "pro" ? 99 : 10,
          features: {},
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
        razorpaySubId: `sim_sub_${Date.now()}`,
        razorpayOrderId: `sim_order_${Date.now()}`,
        razorpayPaymentId: `sim_pay_${Date.now()}`,
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
  } catch (error) {
    console.error("Subscription Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
