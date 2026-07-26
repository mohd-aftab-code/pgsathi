import { NextRequest, NextResponse } from "next/server";
import { getRazorpayClient } from "@/lib/razorpay";
import { auth } from "@/lib/auth";
import { getServerPlanAmount } from "@/lib/plan-service";
import { isValidCycle } from "@/lib/billing";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { planId, billingCycle } = await req.json();
    const cycle = isValidCycle(billingCycle) ? billingCycle : "MONTHLY";

    // Amount comes from the DB plan for the chosen cycle (super-admin controlled),
    // never the client — and it must match what /api/subscription later records,
    // or the customer is charged for one duration and given another.
    const amount = typeof planId === "string" ? await getServerPlanAmount(planId, cycle) : null;
    if (amount === null) {
      return NextResponse.json({ success: false, message: "Invalid plan or duration" }, { status: 400 });
    }
    if (amount <= 0) {
      return NextResponse.json({ success: false, message: "This plan does not require payment" }, { status: 400 });
    }

    let razorpay;
    try {
      razorpay = getRazorpayClient();
    } catch {
      console.error("Razorpay keys are not configured");
      return NextResponse.json({ success: false, message: "Payments are not configured" }, { status: 500 });
    }

    const options = {
      amount: amount * 100, // Razorpay works in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}_${session.user.id}`,
      notes: { userId: session.user.id, planId, billingCycle: cycle },
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return NextResponse.json({ success: false, message: "Failed to create order" }, { status: 500 });
    }

    return NextResponse.json({ success: true, orderId: order.id, amount });
  } catch (error: any) {
    console.error("Create Order Error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}
