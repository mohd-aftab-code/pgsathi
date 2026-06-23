import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

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
        isActive: status === "ACTIVE"
      }
    });

    return NextResponse.json({ success: true, data: listing });
  } catch (error) {
    console.error("Verify Listing Error:", error);
    return NextResponse.json({ success: false, message: "Failed to verify listing" }, { status: 500 });
  }
}
