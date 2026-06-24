import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// ─── GET single listing ──────────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listing = await db.listing.findUnique({
      where: { id: parseInt(id) },
      include: {
        city: true,
        locality: true,
        photos: { orderBy: { sortOrder: "asc" } },
        amenities: { include: { amenity: true } },
      },
    });

    if (!listing) {
      return NextResponse.json({ success: false, message: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: listing });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch listing" }, { status: 500 });
  }
}

// ─── PATCH update listing ─────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const listingId = parseInt(id);
    const ownerId = parseInt(session.user.id!);

    // Verify ownership
    const existing = await db.listing.findUnique({ where: { id: listingId } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Listing not found" }, { status: 404 });
    }
    if (existing.ownerId !== ownerId && session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const data = await req.json();

    // Build update payload — only allow specific fields
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.pgType !== undefined) updateData.pgType = data.pgType;
    if (data.genderAllowed !== undefined) updateData.genderAllowed = data.genderAllowed;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.landmark !== undefined) updateData.landmark = data.landmark;
    if (data.pincode !== undefined) updateData.pincode = data.pincode;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.priceMin !== undefined) updateData.priceMin = data.priceMin;
    if (data.priceMax !== undefined) updateData.priceMax = data.priceMax;
    if (data.securityDeposit !== undefined) updateData.securityDeposit = data.securityDeposit;
    if (data.electricityCharge !== undefined) updateData.electricityCharge = data.electricityCharge;
    if (data.maintenanceCharge !== undefined) updateData.maintenanceCharge = data.maintenanceCharge;
    if (data.foodCharge !== undefined) updateData.foodCharge = data.foodCharge;
    if (data.setupFee !== undefined) updateData.setupFee = data.setupFee;
    if (data.foodIncluded !== undefined) updateData.foodIncluded = data.foodIncluded;
    if (data.noticePeriod !== undefined) updateData.noticePeriod = data.noticePeriod;
    if (data.gateClosingTime !== undefined) updateData.gateClosingTime = data.gateClosingTime;
    if (data.rentLockIn !== undefined) updateData.rentLockIn = data.rentLockIn;
    if (data.noGuardiansStay !== undefined) updateData.noGuardiansStay = data.noGuardiansStay;
    if (data.laundryService !== undefined) updateData.laundryService = data.laundryService;
    if (data.roomCleaning !== undefined) updateData.roomCleaning = data.roomCleaning;
    if (data.parking !== undefined) updateData.parking = data.parking;
    if (data.cityId !== undefined) updateData.cityId = data.cityId;
    if (data.localityId !== undefined) updateData.localityId = data.localityId;

    // Status toggle (only if explicitly passed)
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updated = await db.listing.update({
      where: { id: listingId },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Update Listing Error:", error);
    return NextResponse.json({ success: false, message: "Failed to update listing" }, { status: 500 });
  }
}

// ─── DELETE listing ───────────────────────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const listingId = parseInt(id);
    const ownerId = parseInt(session.user.id!);

    // Verify ownership
    const existing = await db.listing.findUnique({ where: { id: listingId } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Listing not found" }, { status: 404 });
    }
    if (existing.ownerId !== ownerId && session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    // Soft delete — isActive = false instead of actual delete
    await db.listing.update({
      where: { id: listingId },
      data: { isActive: false, status: "INACTIVE" },
    });

    return NextResponse.json({ success: true, message: "Listing deleted successfully" });
  } catch (error: any) {
    console.error("Delete Listing Error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete listing" }, { status: 500 });
  }
}
