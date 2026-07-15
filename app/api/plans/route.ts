import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const plans = await db.plan.findMany({
      where: {
        isActive: true
      },
      orderBy: { price: "asc" }
    });
    
    return NextResponse.json({ success: true, data: plans });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error fetching plans" }, { status: 500 });
  }
}
