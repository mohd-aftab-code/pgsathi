import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const secret = process.env.RAZORPAY_KEY_SECRET || "dummy_secret";
    
    // Create expected signature
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const expectedSignature = hmac.digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Payment is verified
      const subscription = await db.subscription.findFirst({
        where: { razorpayOrderId: razorpay_order_id }
      });

      if (subscription) {
        await db.subscription.update({
          where: { id: subscription.id },
          data: { 
            status: "ACTIVE",
            razorpayPaymentId: razorpay_payment_id
          }
        });

        const invoice = await db.invoice.findFirst({
          where: { razorpayOrderId: razorpay_order_id }
        });

        if (invoice) {
          await db.invoice.update({
            where: { id: invoice.id },
            data: {
              status: "PAID",
              razorpayPayId: razorpay_payment_id,
              paidAt: new Date()
            }
          });
        }
      }
      
      return NextResponse.json({ 
        success: true, 
        message: "Payment verified successfully" 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid payment signature" 
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Payment Verification Error:", error);
    return NextResponse.json({ success: false, message: "Verification failed" }, { status: 500 });
  }
}
