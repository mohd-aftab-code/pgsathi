import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notify } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const session = await auth();
    // Tenant can be logged out to book a visit, we capture phone and name anyway.
    const tenantId = session?.user?.id ? parseInt(session.user.id) : null;

    const { listingId, name, phone, visitDate } = await req.json();

    const visit = await db.visitBooking.create({
      data: {
        listingId: parseInt(listingId),
        tenantId,
        name,
        phone,
        visitDate: new Date(visitDate),
        status: "PENDING"
      }
    });

    // Notify the owner in-app
    const listing = await db.listing.findUnique({ where: { id: parseInt(listingId) }, select: { ownerId: true, title: true } });
    if (listing) {
      await notify({
        userId: listing.ownerId,
        type: "VISIT",
        title: `Visit booked by ${name}`,
        message: `${name} wants to visit ${listing.title} on ${new Date(visitDate).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}.`,
        link: "/dashboard/owner/leads",
      });
    }

    return NextResponse.json(visit);
  } catch (error) {
    console.error("Error booking visit:", error);
    return NextResponse.json({ error: "Failed to book visit" }, { status: 500 });
  }
}
