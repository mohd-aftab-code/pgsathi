import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
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

    // 1. Subscription & Limits Enforcement
    let activeSub = await db.subscription.findFirst({
      where: {
        userId: parseInt(session.user.id),
        status: { in: ["ACTIVE", "TRIAL"] },
        endDate: { gt: new Date() }
      },
      include: { plan: true }
    });

    // Auto-start 14-day trial if they've never had any subscription
    if (!activeSub) {
      const pastSubCount = await db.subscription.count({
        where: { userId: parseInt(session.user.id) }
      });
      
      if (pastSubCount === 0) {
        const basicPlan = await db.plan.findFirst({ orderBy: { price: "asc" } });
        if (basicPlan) {
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 14); // 14 Days Free Trial
          
          activeSub = await db.subscription.create({
            data: {
              userId: parseInt(session.user.id),
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

    if (!activeSub) {
      return NextResponse.json({ success: false, message: "Forbidden: Active subscription or trial required to add listings." }, { status: 403 });
    }

    // 2. Listing Count Limit Check
    const userListingsCount = await db.listing.count({
      where: { ownerId: parseInt(session.user.id) } // Count all listings (or you could filter by active)
    });

    if (userListingsCount >= activeSub.plan.maxListings) {
      return NextResponse.json({ success: false, message: `Limit reached: Your plan allows a maximum of ${activeSub.plan.maxListings} listings.` }, { status: 403 });
    }

    // 3. Photo Limit Check
    if (data.photos && data.photos.length > activeSub.plan.maxPhotos) {
      return NextResponse.json({ success: false, message: `Limit reached: Your plan allows a maximum of ${activeSub.plan.maxPhotos} photos per listing.` }, { status: 400 });
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
        
        cityId: data.cityId,
        localityId: data.localityId,
        
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
        }
      },
    });

    return NextResponse.json({ success: true, data: listing });
  } catch (error: any) {
    console.error("Create Listing Error:", error);
    return NextResponse.json({ success: false, message: "Failed to create listing" }, { status: 500 });
  }
}
