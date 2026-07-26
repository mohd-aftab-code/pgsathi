/**
 * app/api/plans/public/route.ts
 * GET → active plans for client-side display (checkout page, etc.).
 *
 * Read-only, public marketing data. The authoritative charge amount is still
 * derived server-side at payment time (lib/plan-service.ts) — this endpoint is
 * only so client components show the same admin-controlled numbers.
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const plans = await db.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        slug: true,
        name: true,
        price: true,
        quarterlyPrice: true,
        halfYearlyPrice: true,
        yearlyPrice: true,
        tagline: true,
        badge: true,
        recommended: true,
        maxListings: true,
        maxTenants: true,
        maxPhotos: true,
        features: true,
      },
    });
    return NextResponse.json({ success: true, data: plans });
  } catch (error) {
    console.error("Public plans fetch error:", error);
    return NextResponse.json({ success: false, message: "Failed to load plans" }, { status: 500 });
  }
}
