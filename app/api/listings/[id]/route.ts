import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { resolveCity } from "@/lib/geo";
import { revalidateTag } from "next/cache";

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
        owner: { select: { name: true, phone: true } },
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
    if (data.roomTypes !== undefined) updateData.roomTypes = data.roomTypes;
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
    // Resolve the city from what the owner typed rather than trusting a
    // client-computed cityId — matches the create route, and means editing a PG
    // in a city that isn't seeded yet works instead of failing validation.
    if (data.cityName !== undefined || data.pincode !== undefined) {
      const resolved = await resolveCity({
        pincode: data.pincode,
        cityName: data.cityName,
        stateName: data.stateName,
      });
      if (!resolved) {
        return NextResponse.json(
          { success: false, message: "City resolve nahi hui — PIN code ya city ka naam check karein." },
          { status: 400 }
        );
      }
      updateData.cityId = resolved.id;
    }
    if (data.localityId !== undefined) updateData.localityId = data.localityId;
    if (data.areaLocality !== undefined) updateData.areaLocality = data.areaLocality;
    
    // Complex relations: Photos and Amenities
    if (data.photos !== undefined) {
      updateData.photos = {
        deleteMany: {},
        create: data.photos.map((photo: { url: string; publicId: string }, index: number) => ({
          url: photo.url,
          publicId: photo.publicId || `pgsathi/listings/${Date.now()}_${index}`,
          sortOrder: index,
          isPrimary: index === 0,
        }))
      };
    }

    if (data.amenities !== undefined) {
      updateData.amenities = {
        deleteMany: {},
        create: (data.amenities || []).map((slug: string) => ({
          amenity: { 
            connectOrCreate: {
              where: { slug },
              create: {
                slug,
                name: slug.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                icon: "check",
                category: "GENERAL"
              }
            } 
          }
        }))
      };
    }

    // Status toggle (only if explicitly passed)
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    if (data.reviewsEnabled !== undefined) updateData.reviewsEnabled = data.reviewsEnabled;

    // isActive/reviewsEnabled are display settings, not listing content — toggling
    // them shouldn't send an already-verified PG back through moderation.
    const SETTINGS_ONLY_KEYS = new Set(["isActive", "reviewsEnabled"]);
    const isContentChange = Object.keys(data).some((key) => !SETTINGS_ONLY_KEYS.has(key));

    if (isContentChange) {
      // Once a listing has been verified and is live, further owner edits
      // shouldn't yank it back into the review queue (and off the public site) —
      // that used to force every small edit through re-verification. Instead we
      // just flag it so the super admin can see something changed, and the admin
      // clears the flag when they look it over (see /api/admin/verify-listing).
      // Listings still awaiting first-time approval keep the old flow: any edit
      // during that stage re-enters the queue.
      if (existing.status === "ACTIVE") {
        updateData.hasPendingChanges = true;
      } else {
        updateData.status = "PENDING";
        updateData.isVerified = false;
      }
    }

    const updated = await db.listing.update({
      where: { id: listingId },
      data: updateData,
    });

    // The public PG detail page caches this listing for 5 minutes (tagged
    // `listing-${slug}`) — without this, an owner's edit (price, rules, photos,
    // the reviews toggle, anything) would silently sit behind that cache instead
    // of showing up right away.
    revalidateTag(`listing-${updated.slug}`, { expire: 0 });

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
    const searchParams = req.nextUrl.searchParams;
    const isHardDelete = searchParams.get("hard") === "true";

    // Verify ownership
    const existing = await db.listing.findUnique({ where: { id: listingId } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Listing not found" }, { status: 404 });
    }
    if (existing.ownerId !== ownerId && session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    // Admins can perform hard deletes
    if (isHardDelete && session.user.role === "ADMIN") {
      await db.listing.delete({
        where: { id: listingId },
      });
      return NextResponse.json({ success: true, message: "Listing permanently deleted" });
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
