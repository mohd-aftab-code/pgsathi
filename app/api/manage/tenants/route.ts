/**
 * app/api/manage/tenants/route.ts
 * GET  — list all tenants for the logged-in owner (with filters)
 * POST — create a new tenant
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getManageContext, logPgAudit } from "@/lib/manage-auth";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getManageContext();
    if (!ctx || !ctx.hasPaidPlan) {
      return NextResponse.json({ success: false, message: "Upgrade required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status    = searchParams.get("status") ?? undefined;
    const listingId = searchParams.get("listingId") ? parseInt(searchParams.get("listingId")!) : undefined;
    const search    = searchParams.get("q") ?? undefined;
    const page      = parseInt(searchParams.get("page") ?? "1");
    const limit     = 20;

    const where: any = {
      ownerId: ctx.userId,
      deletedAt: null,
    };
    if (status)    where.status = status;
    if (listingId) where.listingId = listingId;
    if (search)    where.OR = [
      { name:  { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
    ];

    const [tenants, total] = await Promise.all([
      db.pgTenant.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          listing: { select: { id: true, title: true } },
          room:    { select: { id: true, name: true } },
          payments: {
            where: { type: "RENT", forMonth: currentMonth(), status: "PAID" },
            select: { amount: true },
          },
        },
      }),
      db.pgTenant.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: tenants, total, page, pages: Math.ceil(total / limit) });
  } catch (err: any) {
    console.error("[manage/tenants GET]", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getManageContext();
    if (!ctx || !ctx.hasPaidPlan) {
      return NextResponse.json({ success: false, message: "Upgrade required" }, { status: 403 });
    }

    const data = await req.json();

    // Validate required fields
    if (!data.name || !data.phone || !data.listingId) {
      return NextResponse.json({ success: false, message: "name, phone, listingId are required" }, { status: 400 });
    }

    // Verify listing belongs to this owner
    const listing = await db.listing.findFirst({
      where: { id: parseInt(data.listingId), ownerId: ctx.userId },
    });
    if (!listing) {
      return NextResponse.json({ success: false, message: "Listing not found" }, { status: 404 });
    }

    const tenant = await db.pgTenant.create({
      data: {
        ownerId:          ctx.userId,
        listingId:        parseInt(data.listingId),
        roomId:           data.roomId ? parseInt(data.roomId) : null,
        bedId:            data.bedId  ? parseInt(data.bedId)  : null,
        name:             data.name,
        phone:            data.phone,
        email:            data.email   ?? null,
        gender:           data.gender  ?? "MALE",
        idType:           data.idType  ?? null,
        idNumber:         data.idNumber ?? null,
        guardianName:     data.guardianName  ?? null,
        guardianPhone:    data.guardianPhone ?? null,
        permanentAddress: data.permanentAddress ?? null,
        monthlyRent:      parseInt(data.monthlyRent ?? 0),
        securityDeposit:  parseInt(data.securityDeposit ?? 0),
        rentDueDay:       parseInt(data.rentDueDay ?? 5),
        checkInDate:      data.checkInDate ? new Date(data.checkInDate) : new Date(),
        notes:            data.notes ?? null,
        status:           "ACTIVE",
      },
    });

    // If a bed was allocated, mark it as occupied
    if (data.bedId) {
      await db.bed.update({ where: { id: parseInt(data.bedId) }, data: { isOccupied: true } });
    }

    await logPgAudit(ctx.userId, ctx.name, `Added tenant: ${tenant.name}`, "PgTenant");
    return NextResponse.json({ success: true, data: tenant }, { status: 201 });
  } catch (err: any) {
    console.error("[manage/tenants POST]", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
