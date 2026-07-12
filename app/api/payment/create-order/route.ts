import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { auth } from "@/lib/auth";
import { isValidPlanId, getPlanTotalAmount } from "@/lib/plans";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { planId } = await req.json();

    if (!planId || !isValidPlanId(planId)) {
      return NextResponse.json({ success: false, message: "Invalid plan" }, { status: 400 });
    }

    const amount = getPlanTotalAmount(planId);
    if (amount <= 0) {
      return NextResponse.json({ success: false, message: "This plan does not require payment" }, { status: 400 });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Razorpay keys are not configured");
      return NextResponse.json({ success: false, message: "Payments are not configured" }, { status: 500 });
    }

    const options = {
      amount: amount * 100, // Razorpay works in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}_${session.user.id}`,
      notes: { userId: session.user.id, planId },
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
