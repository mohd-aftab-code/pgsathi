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
    if (!ctx || !ctx.hasAccess) {
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
    if (!ctx || !ctx.hasAccess) {
      return NextResponse.json({ success: false, message: "Active subscription or trial required" }, { status: 403 });
    }

    const data = await req.json();

    const name = String(data.name ?? "").trim();
    const phone = String(data.phone ?? "").trim();
    const rawListingId = parseInt(String(data.listingId ?? ""), 10);

    // Validate required fields
    if (!name || !phone || isNaN(rawListingId)) {
      return NextResponse.json({ success: false, message: "Full Name, Phone number, and PG Property are required" }, { status: 400 });
    }

    // Subscription & Tenant Limit Check
    const activeSub = await db.subscription.findFirst({
      where: {
        userId: ctx.userId,
        status: { in: ["ACTIVE", "TRIAL"] },
        endDate: { gt: new Date() }
      },
      include: { plan: true },
      orderBy: { endDate: "desc" }
    });

    const currentTenantsCount = await db.pgTenant.count({
      where: { ownerId: ctx.userId, deletedAt: null }
    });

    if (activeSub) {
      if (activeSub.plan.maxTenants !== -1 && currentTenantsCount >= activeSub.plan.maxTenants) {
        return NextResponse.json({
          success: false,
          message: `Limit reached: Your plan allows a maximum of ${activeSub.plan.maxTenants} tenants. Upgrade to add more.`
        }, { status: 403 });
      }
    } else if (ctx.hasAccess) {
      // Free trial limit (up to 50 tenants)
      const trialMaxTenants = 50;
      if (currentTenantsCount >= trialMaxTenants) {
        return NextResponse.json({
          success: false,
          message: `Trial limit reached: Your free trial allows a maximum of ${trialMaxTenants} tenants. Upgrade to add more.`
        }, { status: 403 });
      }
    } else {
      return NextResponse.json({ success: false, message: "Active subscription or trial required to add tenants" }, { status: 403 });
    }

    // Verify listing belongs to this owner
    if (ctx.allowedListingIds && !ctx.allowedListingIds.includes(rawListingId)) {
      return NextResponse.json({ success: false, message: "You are not authorized for this property" }, { status: 403 });
    }

    const listing = await db.listing.findFirst({
      where: { id: rawListingId, ownerId: ctx.userId },
    });
    if (!listing) {
      return NextResponse.json({ success: false, message: "Property not found or does not belong to you" }, { status: 404 });
    }

    // Safe parser helpers
    const parseSafeInt = (val: any, fallback: number = 0): number => {
      if (val === undefined || val === null || val === "") return fallback;
      const parsed = parseInt(String(val), 10);
      return isNaN(parsed) ? fallback : parsed;
    };

    const cleanStr = (val: any): string | null => {
      if (val === undefined || val === null) return null;
      const s = String(val).trim();
      return s.length > 0 ? s : null;
    };

    const roomId = data.roomId && !isNaN(parseInt(String(data.roomId), 10)) ? parseInt(String(data.roomId), 10) : null;
    const bedId = data.bedId && !isNaN(parseInt(String(data.bedId), 10)) ? parseInt(String(data.bedId), 10) : null;

    // Optional verification of room and bed
    if (roomId) {
      const room = await db.room.findFirst({
        where: { id: roomId, listingId: rawListingId }
      });
      if (!room) {
        return NextResponse.json({ success: false, message: "Selected room does not belong to this property" }, { status: 400 });
      }
    }

    if (bedId) {
      const bed = await db.bed.findFirst({
        where: { id: bedId, room: { listingId: rawListingId } }
      });
      if (!bed) {
        return NextResponse.json({ success: false, message: "Selected bed does not belong to this property" }, { status: 400 });
      }
    }

    // Try to auto-link with an existing User account
    const existingUser = await db.user.findUnique({
      where: { phone }
    });

    const monthlyRent = parseSafeInt(data.monthlyRent, 0);
    const securityDeposit = parseSafeInt(data.securityDeposit, 0);
    const rentDueDay = Math.min(31, Math.max(1, parseSafeInt(data.rentDueDay, 5)));

    const tenant = await db.pgTenant.create({
      data: {
        userId:                   existingUser ? existingUser.id : null,
        ownerId:                  ctx.userId,
        listingId:                rawListingId,
        roomId,
        bedId,
        name,
        phone,
        email:                    cleanStr(data.email),
        gender:                   cleanStr(data.gender) ?? "MALE",
        idType:                   cleanStr(data.idType),
        idNumber:                 cleanStr(data.idNumber),
        guardianName:             cleanStr(data.guardianName),
        guardianPhone:            cleanStr(data.guardianPhone),
        guardianRelation:         cleanStr(data.guardianRelation),
        permanentAddress:         cleanStr(data.permanentAddress),
        occupation:               cleanStr(data.occupation) ?? "STUDENT",
        workplace:                cleanStr(data.workplace),
        workplaceId:              cleanStr(data.workplaceId),
        workplaceAddress:         cleanStr(data.workplaceAddress),
        policeVerificationStatus: cleanStr(data.policeVerificationStatus) ?? "NOT_SUBMITTED",
        policeVerificationRef:    cleanStr(data.policeVerificationRef),
        bloodGroup:               cleanStr(data.bloodGroup),
        vehicleType:              cleanStr(data.vehicleType) ?? "NONE",
        vehicleNumber:            cleanStr(data.vehicleNumber),
        monthlyRent,
        securityDeposit,
        rentDueDay,
        checkInDate:              data.checkInDate ? new Date(data.checkInDate) : new Date(),
        notes:                    cleanStr(data.notes),
        status:                   "ACTIVE",
      },
    });

    // If a bed was allocated, mark it as occupied
    if (bedId) {
      await db.bed.update({ where: { id: bedId }, data: { isOccupied: true } });
    }

    await logPgAudit(ctx.userId, ctx.name, `Added tenant: ${tenant.name}`, "PgTenant");
    return NextResponse.json({ success: true, data: tenant }, { status: 201 });
  } catch (err: any) {
    console.error("[manage/tenants POST]", err);
    return NextResponse.json({ success: false, message: err.message || "Failed to create tenant" }, { status: 500 });
  }
}

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
