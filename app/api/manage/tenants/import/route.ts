/**
 * app/api/manage/tenants/import/route.ts
 * POST — bulk-import tenants into one of the owner's properties from parsed CSV rows.
 * Owner-scoped, de-dupes on phone, and never trusts a client-supplied ownerId.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getManageContext, logPgAudit } from "@/lib/manage-auth";

const MAX_ROWS = 500;

export async function POST(req: NextRequest) {
  try {
    const ctx = await getManageContext();
    if (!ctx || !ctx.hasPaidPlan) {
      return NextResponse.json({ success: false, message: "Upgrade required" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const listingId = parseInt(body.listingId);
    const rows: any[] = Array.isArray(body.rows) ? body.rows : [];

    if (!listingId || Number.isNaN(listingId)) {
      return NextResponse.json({ success: false, message: "Please choose a property to import into" }, { status: 400 });
    }
    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: "The file has no rows" }, { status: 400 });
    }
    if (rows.length > MAX_ROWS) {
      return NextResponse.json({ success: false, message: `Max ${MAX_ROWS} rows per import` }, { status: 400 });
    }

    // Ownership — the target property must belong to this owner
    const listing = await db.listing.findFirst({
      where: { id: listingId, ownerId: ctx.userId },
      select: { id: true, title: true },
    });
    if (!listing) {
      return NextResponse.json({ success: false, message: "Property not found" }, { status: 404 });
    }

    // Existing phones so we skip duplicates instead of creating them twice
    const existing = await db.pgTenant.findMany({
      where: { ownerId: ctx.userId, deletedAt: null },
      select: { phone: true },
    });
    const seen = new Set(existing.map((e) => e.phone));

    const toCreate: any[] = [];
    const problems: string[] = [];
    let skipped = 0;

    rows.forEach((r, i) => {
      const line = i + 2; // +1 for header, +1 for 1-based
      const name = String(r.name ?? "").trim();
      const phone = String(r.phone ?? "").replace(/\D/g, "").slice(-10);

      if (!name || phone.length !== 10) {
        problems.push(`Row ${line}: name or 10-digit phone missing`);
        return;
      }
      if (seen.has(phone)) {
        skipped++;
        return;
      }
      seen.add(phone);

      const rent = parseInt(String(r.monthlyRent ?? "").replace(/[^\d]/g, "")) || 0;
      const checkIn = r.checkInDate ? new Date(r.checkInDate) : null;

      toCreate.push({
        ownerId: ctx.userId,
        listingId,
        name: name.slice(0, 100),
        phone,
        email: r.email ? String(r.email).trim().slice(0, 255) || null : null,
        monthlyRent: rent,
        ...(checkIn && !Number.isNaN(checkIn.getTime()) ? { checkInDate: checkIn } : {}),
      });
    });

    let created = 0;
    if (toCreate.length) {
      const res = await db.pgTenant.createMany({ data: toCreate });
      created = res.count;
    }

    await logPgAudit(ctx.userId, ctx.name, `Imported ${created} tenants into ${listing.title}`, "PgTenant");

    return NextResponse.json({
      success: true,
      created,
      skipped,
      problems: problems.slice(0, 8),
      problemCount: problems.length,
      property: listing.title,
    });
  } catch (err: any) {
    console.error("Tenant import error:", err);
    return NextResponse.json({ success: false, message: err.message || "Import failed" }, { status: 500 });
  }
}
