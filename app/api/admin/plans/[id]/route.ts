import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { readCapabilities } from "@/lib/plan-capabilities";

/**
 * An optional per-cycle price. Absent from the body = leave alone; present but
 * blank = the admin cleared it, so that cycle stops being offered (null).
 */
function optionalPrice(v: unknown): number | null | undefined {
  if (v === undefined) return undefined;
  if (v === null || v === "") return null;
  const n = parseInt(String(v));
  return Number.isNaN(n) ? null : n;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const updatedPlan = await db.plan.update({
      where: { id: parseInt(id) },
      data: {
        name: body.name,
        slug: body.slug,
        price: body.price !== undefined ? parseInt(body.price) : undefined,
        // Optional cycles: a cleared field must become null ("not offered"), not
        // NaN — parseInt("") is NaN, which Prisma rejects.
        quarterlyPrice: optionalPrice(body.quarterlyPrice),
        halfYearlyPrice: optionalPrice(body.halfYearlyPrice),
        yearlyPrice: optionalPrice(body.yearlyPrice),
        maxListings: body.maxListings !== undefined ? parseInt(body.maxListings) : undefined,
        maxPhotos: body.maxPhotos !== undefined ? parseInt(body.maxPhotos) : undefined,
        maxTenants: body.maxTenants !== undefined ? parseInt(body.maxTenants) : undefined,
        features: body.features !== undefined ? body.features : undefined,
        tagline: body.tagline !== undefined ? body.tagline || null : undefined,
        recommended: body.recommended !== undefined ? body.recommended === true : undefined,
        badge: body.badge !== undefined ? body.badge || null : undefined,
        sortOrder: body.sortOrder !== undefined ? parseInt(body.sortOrder) : undefined,
        capabilities: body.capabilities !== undefined ? (readCapabilities(body.capabilities) as object) : undefined,
        partnerCommissionType: body.partnerCommissionType !== undefined ? (["NONE", "PERCENT", "FIXED"].includes(body.partnerCommissionType) ? body.partnerCommissionType : "NONE") : undefined,
        partnerCommissionValue: body.partnerCommissionValue !== undefined ? Math.max(0, parseInt(body.partnerCommissionValue) || 0) : undefined,
        isActive: body.isActive !== undefined ? body.isActive : undefined,
      }
    });

    return NextResponse.json({ success: true, data: updatedPlan });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Error updating plan" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    // We hard delete plans for simplicity since it's just pricing
    await db.plan.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true, message: "Plan deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Error deleting plan. Make sure no users are actively subscribed." }, { status: 500 });
  }
}
