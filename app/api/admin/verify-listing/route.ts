import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notifyGoogleIndexingAPI } from "@/lib/google-indexing";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    // Check if user is ADMIN
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { listingId, status, isVerified } = await req.json();

    if (!listingId || !status) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const listing = await db.listing.update({
      where: { id: parseInt(listingId) },
      data: {
        status,
        isVerified: !!isVerified,
        isActive: status === "ACTIVE",
        hasPendingChanges: false
      },
      include: {
        city: true,
        locality: true
      }
    });

    // If listing is activated, notify Google Indexing API
    if (status === "ACTIVE" && listing.city && listing.locality) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pgsathi.in";
      const fullUrl = `${baseUrl}/pg/${listing.city.slug}/${listing.locality.slug}/${listing.slug}`;
      
      // Ping Google in the background (no need to await and block the API response)
      notifyGoogleIndexingAPI(fullUrl, "URL_UPDATED").catch(console.error);
    }

    return NextResponse.json({ success: true, data: listing });
  } catch (error) {
    console.error("Verify Listing Error:", error);
    return NextResponse.json({ success: false, message: "Failed to verify listing" }, { status: 500 });
  }
}
