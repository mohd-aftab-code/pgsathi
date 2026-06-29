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

    const data = await req.json();

    const generatedSlug = slugify(`${data.title}-${Date.now().toString().slice(-6)}`, { lower: true, strict: true });

    // Create listing
    const listing = await db.listing.create({
      data: {
        ownerId: parseInt(session.user.id),
        title: data.title,
        slug: generatedSlug,
        description: data.description,
        pgType: data.pgType || "SINGLE_ROOM",
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
            amenity: { connect: { slug } }
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
