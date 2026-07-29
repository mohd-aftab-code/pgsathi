import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notifyGoogleIndexingAPI } from "@/lib/google-indexing";
import { notify } from "@/lib/notifications";
import { sendListingStatusEmail } from "@/lib/email";

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
        locality: true,
        owner: { select: { name: true, email: true } },
        // Partner attribution — so the partner who brought this PG in can be told
        // what happened to it.
        partner: { select: { userId: true, user: { select: { name: true, email: true } } } }
      }
    });

    const approved = status === "ACTIVE";
    const rejected = status === "REJECTED";

    if (approved || rejected) {
      // Email Owner
      if (listing.owner?.email) {
        sendListingStatusEmail(listing.owner.email, listing.owner.name, listing.title, status, false).catch((e) => {
          console.error("[LISTING_STATUS_EMAIL_OWNER_ERROR]", e);
        });
      }

      // Tell the partner their PG was approved or rejected. Non-fatal: a
      // notification failure must never break the admin's moderation action.
      if (listing.partner) {
        notify({
          userId: listing.partner.userId,
          type: "PARTNER_PG",
          title: approved ? "Aapka PG approve ho gaya ✅" : "Aapka PG reject ho gaya",
          message: approved
            ? `${listing.title} ab live hai. Owner paid plan lega to aapki earning ban jayegi.`
            : `${listing.title} approve nahi hua. Details ke liye support se sampark karein.`,
          link: `/partner/pgs/${listing.id}`,
        }).catch(console.error);

        if (listing.partner.user?.email) {
          sendListingStatusEmail(listing.partner.user.email, listing.partner.user.name, listing.title, status, true).catch((e) => {
            console.error("[LISTING_STATUS_EMAIL_PARTNER_ERROR]", e);
          });
        }
      }
    }

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
