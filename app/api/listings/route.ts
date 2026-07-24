import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { TRIAL_CUTOFF } from "@/lib/manage-auth";
import { resolveCity } from "@/lib/geo";
import slugify from "slugify";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const citySlug = searchParams.get("city");
    const gender = searchParams.get("gender");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: any = { isActive: true, status: "ACTIVE" };

    if (citySlug) {
      where.city = { slug: citySlug };
    }
    
    if (gender) {
      where.genderAllowed = gender;
    }

    const listings = await db.listing.findMany({
      where,
      take: limit,
      include: {
        city: true,
        locality: true,
        photos: {
          take: 1, // Get primary photo
        },
      },
      orderBy: [
        { isFeatured: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ success: true, data: listings });
  } catch (error: any) {
    console.error("Fetch Listings Error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch listings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Forbidden: Only Owners can create listings" }, { status: 403 });
    }

    const data = await req.json();
    const ownerId = parseInt(session.user.id);

    // 1. Subscription & Limits Enforcement
    let activeSub = await db.subscription.findFirst({
      where: {
        userId: ownerId,
        status: { in: ["ACTIVE", "TRIAL"] },
        endDate: { gt: new Date() }
      },
      include: { plan: true },
      orderBy: { endDate: "desc" }
    });

    // Auto-start a 14-day Growth trial for accounts old enough to be grandfathered
    // into the free-trial-on-signup flow. Accounts created after TRIAL_CUTOFF no
    // longer get this — they fall through to the free Starter plan's own limits below.
    if (!activeSub) {
      const pastSubCount = await db.subscription.count({ where: { userId: ownerId } });
      const owner = await db.user.findUnique({ where: { id: ownerId }, select: { createdAt: true } });

      if (pastSubCount === 0 && owner && owner.createdAt < TRIAL_CUTOFF) {
        // Trial should land the owner on the Growth tier (the cheapest *paid* plan),
        // not the free Starter plan — picking "cheapest by price" alone would grab
        // Starter (₹0) since it sorts first, giving a "trial" with no real features.
        const basicPlan = await db.plan.findFirst({ where: { price: { gt: 0 } }, orderBy: { price: "asc" } });
        if (basicPlan) {
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 14); // 14 Days Free Trial

          activeSub = await db.subscription.create({
            data: {
              userId: ownerId,
              planId: basicPlan.id,
              status: "TRIAL",
              amount: 0,
              startDate: new Date(),
              endDate,
              billingCycle: "MONTHLY",
            },
            include: { plan: true }
          });
        }
      }
    }

    // No active/trial subscription (post-cutoff new owner, or trial exhausted) —
    // fall back to the free Starter plan's own limits instead of blocking outright,
    // since Starter is meant to allow 1 free listing with no subscription required.
    const effectivePlan = activeSub?.plan ?? await db.plan.findUnique({ where: { slug: "free" } });

    if (!effectivePlan) {
      return NextResponse.json({ success: false, message: "Forbidden: Active subscription or trial required to add listings." }, { status: 403 });
    }

    // 2. Listing Count Limit Check
    const userListingsCount = await db.listing.count({
      where: { ownerId } // Count all listings (or you could filter by active)
    });

    if (effectivePlan.maxListings !== -1 && userListingsCount >= effectivePlan.maxListings) {
      return NextResponse.json({ success: false, message: `Limit reached: Your plan allows a maximum of ${effectivePlan.maxListings} listings. Upgrade to add more.` }, { status: 403 });
    }

    // 3. Photo Limit Check
    if (effectivePlan.maxPhotos !== -1 && data.photos && data.photos.length > effectivePlan.maxPhotos) {
      return NextResponse.json({ success: false, message: `Limit reached: Your plan allows a maximum of ${effectivePlan.maxPhotos} photos per listing.` }, { status: 400 });
    }

    // Resolve the city here rather than trusting a client-computed cityId. The
    // form only sends what the owner typed (pincode / city / state); if their
    // city isn't in the table yet it gets created. This is what stops owners
    // outside the seeded cities from being unable to register at all.
    const resolvedCity = await resolveCity({
      pincode: data.pincode,
      cityName: data.cityName,
      stateName: data.stateName,
    });

    if (!resolvedCity) {
      return NextResponse.json(
        { success: false, message: "City resolve nahi hui — PIN code ya city ka naam check karein." },
        { status: 400 }
      );
    }

    const generatedSlug = slugify(`${data.title}-${Date.now().toString().slice(-6)}`, { lower: true, strict: true });

    // Create listing
    const listing = await db.listing.create({
      data: {
        ownerId: parseInt(session.user.id),
        title: data.title,
        slug: generatedSlug,
        description: data.description,
        roomTypes: data.roomTypes && data.roomTypes.length > 0 ? data.roomTypes : ["SINGLE_ROOM"],
        genderAllowed: data.genderAllowed || "BOYS",
        priceMin: data.priceMin || 0,
        priceMax: data.priceMax || 0,
        securityDeposit: data.securityDeposit,
        electricityCharge: data.electricityCharge,
        maintenanceCharge: data.maintenanceCharge,
        foodCharge: data.foodCharge,
        setupFee: data.setupFee,
        
        foodIncluded: data.foodIncluded,
        noticePeriod: data.noticePeriod,
        gateClosingTime: data.gateClosingTime,
        rentLockIn: data.rentLockIn,
        noGuardiansStay: data.noGuardiansStay,
        laundryService: data.laundryService,
        roomCleaning: data.roomCleaning,
        parking: data.parking,
        
        address: data.address,
        landmark: data.landmark,
        pincode: data.pincode,
        latitude: data.latitude,
        longitude: data.longitude,
        
        cityId: resolvedCity.id,
        localityId: data.localityId,
        areaLocality: data.areaLocality,
        
        status: "PENDING", // Admin will publish later
        
        photos: {
          create: (data.photos || []).map((photo: { url: string; publicId: string }, index: number) => ({
            url: photo.url,
            publicId: photo.publicId || `pgsathi/listings/${Date.now()}_${index}`,
            sortOrder: index,
            isPrimary: index === 0,
          }))
        },
        amenities: {
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
        },
        ...(data.roomPrices && {
          room_configurations: {
            create: Object.entries(data.roomPrices).map(([roomType, pricing]: [string, any]) => ({
              roomType,
              updatedAt: new Date(),
              room_pricing: {
                create: {
                  rentPerBed: parseInt(pricing.rent) || 0,
                  depositPerBed: parseInt(pricing.deposit) || 0,
                  updatedAt: new Date(),
                }
              }
            }))
          }
        })
      },
    });

    return NextResponse.json({ success: true, data: listing });
  } catch (error: any) {
    console.error("Create Listing Error:", error);
    return NextResponse.json({ success: false, message: "Failed to create listing" }, { status: 500 });
  }
}
