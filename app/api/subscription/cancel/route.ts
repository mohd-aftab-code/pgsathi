import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    // Find active subscription
    const activeSub = await db.subscription.findFirst({
      where: { userId, status: "ACTIVE" },
      orderBy: { endDate: "desc" },
    });

    if (!activeSub) {
      return NextResponse.json({ success: false, message: "No active subscription found" }, { status: 400 });
    }

    // Mark it as CANCELLED
    await db.subscription.update({
      where: { id: activeSub.id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({ success: true, message: "Subscription cancelled successfully" });
  } catch (err: any) {
    console.error("Subscription Cancel Error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
