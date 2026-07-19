/**
 * app/api/tenant/complaints/route.ts
 * Allow tenants to file complaints directly via their portal.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notify } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    // Find active tenant record
    const tenant = await db.pgTenant.findFirst({
      where: { userId, status: { in: ["ACTIVE", "NOTICE"] } },
      select: { id: true, ownerId: true, listingId: true },
    });

    if (!tenant) {
      return NextResponse.json({ success: false, message: "No active PG tenancy found for your account." }, { status: 404 });
    }

    const body = await req.json();
    const { title, description, category } = body;

    if (!title?.trim()) {
      return NextResponse.json({ success: false, message: "Title is required" }, { status: 400 });
    }

    const complaint = await db.pgComplaint.create({
      data: {
        ownerId: tenant.ownerId,
        listingId: tenant.listingId,
        tenantId: tenant.id,
        title: title.trim(),
        description: description?.trim() || null,
        category: category || "OTHER",
        priority: "MEDIUM",
        status: "OPEN",
      },
    });

    // Notify the owner in-app
    await notify({
      userId: tenant.ownerId,
      type: "COMPLAINT",
      title: `New complaint: ${complaint.title}`,
      message: `A tenant raised a ${complaint.category} complaint.`,
      link: "/dashboard/manager/complaints",
    });

    return NextResponse.json({ success: true, data: complaint }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    const tenants = await db.pgTenant.findMany({
      where: { userId },
      select: { id: true },
    });

    if (tenants.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const tenantIds = tenants.map(t => t.id);
    const complaints = await db.pgComplaint.findMany({
      where: { tenantId: { in: tenantIds } },
      orderBy: { createdAt: "desc" },
      include: {
        listing: { select: { title: true } },
      },
    });

    return NextResponse.json({ success: true, data: complaints });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
