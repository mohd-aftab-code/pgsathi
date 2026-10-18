import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notify } from "@/lib/notifications";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    // 1. Abuse prevention / IP rate limit: max 10 leads per 10 minutes per IP
    const ipRateLimit = await checkRateLimit(`lead:create:ip:${ip}`, 10, 600);
    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: "Too many enquiries submitted. Please wait a few minutes before trying again." },
        { status: 429 }
      );
    }

    const data = await req.json().catch(() => null);
    if (!data) {
      return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 });
    }

    const session = await auth();

    const listingId = parseInt(data.listingId);
    if (!listingId || isNaN(listingId) || listingId <= 0) {
      return NextResponse.json({ success: false, message: "Invalid listing ID" }, { status: 400 });
    }

    // 2. Listing ownership & status lookup: Ensure listing is active before processing
    const listing = await db.listing.findFirst({
      where: {
        id: listingId,
        status: "ACTIVE",
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        ownerId: true,
        owner: {
          select: {
            phone: true,
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { success: false, message: "Listing not found or is currently inactive" },
        { status: 404 }
      );
    }

    const name = (data.name || session?.user?.name || "").trim();
    if (!name || name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { success: false, message: "A valid name (2-100 characters) is required" },
        { status: 400 }
      );
    }

    // Standardize & validate phone number (Indian 10-digit format)
    let rawPhone = (data.phone || "").toString().replace(/\D/g, "");
    if (rawPhone.length === 12 && rawPhone.startsWith("91")) {
      rawPhone = rawPhone.slice(2);
    } else if (rawPhone.length === 11 && rawPhone.startsWith("0")) {
      rawPhone = rawPhone.slice(1);
    }

    if (!/^[6-9]\d{9}$/.test(rawPhone)) {
      return NextResponse.json(
        { success: false, message: "A valid 10-digit Indian mobile number is required" },
        { status: 400 }
      );
    }
    const phone = rawPhone;

    // 3. Phone rate limit: max 5 leads per 10 minutes per phone
    const phoneRateLimit = await checkRateLimit(`lead:create:phone:${phone}`, 5, 600);
    if (!phoneRateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: "Too many enquiries for this phone number. Please wait a few minutes." },
        { status: 429 }
      );
    }

    const tenantId = session?.user?.id ? parseInt(session.user.id) : null;
    const email = data.email ? String(data.email).trim().slice(0, 120) : session?.user?.email || null;
    const message = data.message ? String(data.message).trim().slice(0, 1000) : null;
    const source = (data.source === "WHATSAPP" || data.source === "PHONE") ? data.source : "WEBSITE";

    // 4. Persist the lead in DB
    const lead = await db.lead.create({
      data: {
        listingId,
        tenantId,
        name,
        phone,
        email,
        message,
        source,
      },
    });

    // Update listing analytics and total leads
    await db.listing.update({
      where: { id: listingId },
      data: {
        totalLeads: { increment: 1 },
      },
    });

    // Notify the owner in-app (non-blocking)
    notify({
      userId: listing.ownerId,
      type: "LEAD",
      title: `New enquiry from ${name}`,
      message: `${name} enquired about ${listing.title}${message ? `: "${message}"` : ""}`,
      link: "/dashboard/owner/leads",
    }).catch((err) => console.error("Lead notify error:", err));

    // 5. Contact disclosure: Only returned after valid lead is persisted
    return NextResponse.json({
      success: true,
      data: lead,
      contact: {
        phone: listing.owner?.phone || null,
      },
    });
  } catch (error) {
    console.error("Create Lead Error:", error);
    return NextResponse.json({ success: false, message: "Failed to create lead" }, { status: 500 });
  }
}
