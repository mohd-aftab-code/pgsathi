import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { readCapabilities } from "@/lib/plan-capabilities";

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
        // Blank/absent means the plan doesn't offer that cycle — store null, never 0,
        // or the cycle would show up as free.
        quarterlyPrice: body.quarterlyPrice ? parseInt(body.quarterlyPrice) : null,
        halfYearlyPrice: body.halfYearlyPrice ? parseInt(body.halfYearlyPrice) : null,
        yearlyPrice: body.yearlyPrice ? parseInt(body.yearlyPrice) : null,
        maxListings: parseInt(body.maxListings),
        maxPhotos: parseInt(body.maxPhotos),
        maxTenants: parseInt(body.maxTenants),
        features: body.features || [],
        // Super-admin controlled presentation + capability flags. Capabilities are
        // normalised through readCapabilities so only known keys are ever stored.
        tagline: body.tagline || null,
        recommended: body.recommended === true,
        badge: body.badge || null,
        sortOrder: body.sortOrder !== undefined ? parseInt(body.sortOrder) : 0,
        capabilities: readCapabilities(body.capabilities) as object,
        partnerCommissionType: ["NONE", "PERCENT", "FIXED"].includes(body.partnerCommissionType) ? body.partnerCommissionType : "NONE",
        partnerCommissionValue: body.partnerCommissionValue !== undefined ? Math.max(0, parseInt(body.partnerCommissionValue) || 0) : 0,
        // 0 = commission runs for as long as the owner keeps renewing.
        partnerCommissionMonths: Math.max(0, Math.min(120, parseInt(body.partnerCommissionMonths) || 0)),
        referralBonusDays: Math.max(0, Math.min(365, parseInt(body.referralBonusDays) || 0)),
        isActive: body.isActive !== false,
      }
    });

    return NextResponse.json({ success: true, data: newPlan });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Error creating plan" }, { status: 500 });
  }
}
