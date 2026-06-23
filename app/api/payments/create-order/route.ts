import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_dummy",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_secret",
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { planId, amount } = body;

    if (!planId || !amount) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    // Amount is in rupees, Razorpay expects paise
    const options = {
      amount: amount * 100, 
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${session.user.id}`,
      notes: {
        userId: session.user.id,
        planId: planId
      }
    };

    const order = await razorpay.orders.create(options);

    // Save preliminary order in DB with status PENDING
    const subscription = await db.subscription.create({
      data: {
        userId: parseInt(session.user.id as string),
        planId: parseInt(planId),
        status: "PENDING",
        billingCycle: "MONTHLY",
        amount: parseInt(amount),
        razorpayOrderId: order.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      }
    });

    await db.invoice.create({
      data: {
        subscriptionId: subscription.id,
        amount: parseInt(amount),
        status: "PENDING",
        razorpayOrderId: order.id,
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      }
    });

  } catch (error: any) {
    console.error("Razorpay Order Error:", error);
    return NextResponse.json({ success: false, message: "Failed to create order" }, { status: 500 });
  }
}
