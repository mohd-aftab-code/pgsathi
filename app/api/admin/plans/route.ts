import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const plans = await db.plan.findMany({
      orderBy: { price: "asc" }
    });
    
    return NextResponse.json({ success: true, data: plans });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error fetching plans" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    
    const newPlan = await db.plan.create({
      data: {
        name: body.name,
        slug: body.slug,
        price: parseInt(body.price),
        yearlyPrice: body.yearlyPrice ? parseInt(body.yearlyPrice) : null,
        maxListings: parseInt(body.maxListings),
        maxPhotos: parseInt(body.maxPhotos),
        features: body.features || {},
        isActive: body.isActive !== false,
      }
    });

    return NextResponse.json({ success: true, data: newPlan });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Error creating plan" }, { status: 500 });
  }
}
