import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const session = await auth();

    const listingId = parseInt(data.listingId);
    if (!listingId || isNaN(listingId)) {
      return NextResponse.json({ success: false, message: "Invalid listing ID" }, { status: 400 });
    }

    const tenantId = session?.user?.id ? parseInt(session.user.id) : null;
    const name = data.name || session?.user?.name || "Guest User";
    // For phone, NextAuth user might not have it loaded unless we fetch it, 
    // but data.phone takes priority.
    const phone = data.phone || "Not Provided";
    const email = data.email || session?.user?.email || null;
    const message = data.message || null;
    const source = data.source || "WEBSITE"; // or WHATSAPP

    // Create the lead
    const lead = await db.lead.create({
      data: {
        listingId,
        tenantId,
        name,
        phone,
        email,
        message,
        source
      }
    });

    // Update listing analytics and total leads
    await db.listing.update({
      where: { id: listingId },
      data: {
        totalLeads: { increment: 1 }
      }
    });

    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    console.error("Create Lead Error:", error);
    return NextResponse.json({ success: false, message: "Failed to create lead" }, { status: 500 });
  }
}
