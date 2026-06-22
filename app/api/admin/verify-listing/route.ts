import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    // In production, ensure session.user.role === "ADMIN"
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { listingId, status, isVerified } = await req.json();

    if (!listingId || !status) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const updatedListing = await db.listing.update({
      where: { id: parseInt(listingId) },
      data: {
        status: status,
        isVerified: isVerified
      }
    });

    return NextResponse.json({ success: true, data: updatedListing });
  } catch (error: any) {
    console.error("Verify Listing Error:", error);
    return NextResponse.json({ success: false, message: "Failed to verify listing" }, { status: 500 });
  }
}
