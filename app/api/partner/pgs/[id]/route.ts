/**
 * app/api/partner/pgs/[id]/route.ts
 * GET   — one PG the partner registered (scoped).
 * PATCH — edit only the fields a partner is allowed to change.
 *
 * Ownership is enforced by putting partnerId in the WHERE clause, so a partner
 * can never read or edit another partner's PG by guessing an id.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePartnerApi, logPartnerActivity } from "@/lib/partner-auth";
import { can, PERMISSIONS } from "@/lib/permissions";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requirePartnerApi();
  if (!ctx) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const listingId = parseInt(id);
  if (Number.isNaN(listingId)) return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });

  // partnerId in the query — a wrong id simply returns nothing, no leak possible.
  const listing = await db.listing.findFirst({
    where: { id: listingId, partnerId: ctx.partnerId },
    include: {
      city: { select: { name: true, state: true } },
      owner: { select: { name: true, phone: true, email: true } },
      photos: { orderBy: { sortOrder: "asc" }, take: 8 },
    },
  });
  if (!listing) return NextResponse.json({ success: false, message: "PG nahi mila" }, { status: 404 });

  // Owner contact is a gated permission.
  const showContact = await can("PARTNER", PERMISSIONS.OWNER_CONTACT_VIEW);

  // Derive plan state from the owner's live subscription.
  const sub = await db.subscription.findFirst({
    where: {
      userId: listing.ownerId,
      status: { in: ["ACTIVE", "TRIAL"] },
      endDate: { gt: new Date() },
      plan: { price: { gt: 0 } },
    },
    include: { plan: { select: { name: true, price: true } } },
    orderBy: { endDate: "desc" },
  });

  return NextResponse.json({
    success: true,
    data: {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      status: listing.status,
      genderAllowed: listing.genderAllowed,
      roomTypes: listing.roomTypes,
      priceMin: listing.priceMin,
      priceMax: listing.priceMax,
      address: listing.address,
      landmark: listing.landmark,
      pincode: listing.pincode,
      areaLocality: listing.areaLocality,
      createdAt: listing.createdAt,
      city: listing.city,
      photos: listing.photos.map((p) => p.url),
      owner: showContact
        ? { name: listing.owner.name, phone: listing.owner.phone, email: listing.owner.email }
        : { name: listing.owner.name, phone: null, email: null },
      plan: sub
        ? { state: "PAID", name: sub.plan.name, price: sub.plan.price, renewalDate: sub.endDate }
        : { state: "FREE", name: "Free", price: 0, renewalDate: null },
    },
  });
}

/** Fields a partner may edit. Deliberately excludes status, ownerId, partnerId, price. */
const EDITABLE = new Set(["title", "description", "landmark", "areaLocality", "genderAllowed"]);

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requirePartnerApi();
  if (!ctx) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  if (!(await can("PARTNER", PERMISSIONS.PG_EDIT_OWN))) {
    return NextResponse.json({ success: false, message: "Edit ki permission nahi hai" }, { status: 403 });
  }

  const { id } = await params;
  const listingId = parseInt(id);
  if (Number.isNaN(listingId)) return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });

  // Confirm the PG belongs to this partner BEFORE editing.
  const owned = await db.listing.findFirst({ where: { id: listingId, partnerId: ctx.partnerId }, select: { id: true } });
  if (!owned) return NextResponse.json({ success: false, message: "PG nahi mila" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const data: any = {};
  for (const key of Object.keys(body)) {
    if (EDITABLE.has(key)) data[key] = typeof body[key] === "string" ? body[key].trim() : body[key];
  }
  if (data.genderAllowed && !["BOYS", "GIRLS", "COED"].includes(data.genderAllowed)) delete data.genderAllowed;
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ success: false, message: "Kuch badla nahi" }, { status: 400 });
  }

  await db.listing.update({ where: { id: listingId }, data });
  await logPartnerActivity(ctx.partnerId, "PG edit kiya", { entity: "Listing", entityId: listingId, meta: { fields: Object.keys(data) } });

  return NextResponse.json({ success: true, message: "PG update ho gaya" });
}
