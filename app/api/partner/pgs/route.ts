/**
 * app/api/partner/pgs/route.ts
 * GET  — list the signed-in partner's PGs (scoped, searchable, paginated).
 * POST — register a PG on behalf of an owner.
 *
 * On POST the partner supplies the owner's details; the owner `User` is
 * found-or-created and the listing is created under THEM, with partnerId stamped
 * permanently (Locked Rule #1). The partner is never the owner.
 *
 * Every query is scoped by partnerId taken from the session — never the body.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePartnerApi, logPartnerActivity } from "@/lib/partner-auth";
import { can, PERMISSIONS } from "@/lib/permissions";
import { resolveCity } from "@/lib/geo";
import { checkRateLimit } from "@/lib/rate-limit";
import type { PGType } from "@prisma/client";
import slugify from "slugify";
import bcrypt from "bcryptjs";
import { generateOwnerPassword } from "@/lib/owner-credentials";

const VALID_ROOM_TYPES: PGType[] = ["SINGLE_ROOM", "DOUBLE_SHARING", "TRIPLE_SHARING", "DORMITORY", "STUDIO", "ENTIRE_FLAT"];

export async function GET(req: NextRequest) {
  const ctx = await requirePartnerApi();
  if (!ctx) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const status = searchParams.get("status") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = 10;

  // partnerId from the session is the ONLY scope — nothing from the client widens it.
  const where: any = { partnerId: ctx.partnerId };
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { address: { contains: q, mode: "insensitive" } },
      { pincode: { contains: q } },
    ];
  }

  const [total, listings] = await Promise.all([
    db.listing.count({ where }),
    db.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true, title: true, status: true, createdAt: true, priceMin: true,
        priceMax: true, genderAllowed: true, ownerId: true,
        city: { select: { name: true } },
        owner: { select: { name: true, phone: true } },
      },
    }),
  ]);

  // Derive paid/free from the owners' live subscriptions in one query.
  const ownerIds = [...new Set(listings.map((l) => l.ownerId))];
  const paidOwners = new Set(
    ownerIds.length
      ? (
          await db.subscription.findMany({
            where: {
              userId: { in: ownerIds },
              status: { in: ["ACTIVE", "TRIAL"] },
              endDate: { gt: new Date() },
              plan: { price: { gt: 0 } },
            },
            select: { userId: true },
          })
        ).map((s) => s.userId)
      : []
  );

  return NextResponse.json({
    success: true,
    data: listings.map((l) => ({
      id: l.id,
      title: l.title,
      status: l.status,
      createdAt: l.createdAt,
      priceMin: l.priceMin,
      priceMax: l.priceMax,
      genderAllowed: l.genderAllowed,
      city: l.city?.name ?? null,
      ownerName: l.owner?.name ?? null,
      ownerPhone: l.owner?.phone ?? null,
      plan: paidOwners.has(l.ownerId) ? "PAID" : "FREE",
    })),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
}

export async function POST(req: NextRequest) {
  const ctx = await requirePartnerApi();
  if (!ctx) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  if (!(await can("PARTNER", PERMISSIONS.PG_REGISTER))) {
    return NextResponse.json({ success: false, message: "Aapke paas PG register karne ki permission nahi hai" }, { status: 403 });
  }

  const rl = await checkRateLimit(`partner:pg:create:${ctx.partnerId}`, 20, 3600);
  if (!rl.allowed) {
    return NextResponse.json({ success: false, message: "Bahut zyada requests. Thodi der baad try karein." }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));

  // ── owner details ─────────────────────────────────────────────────────
  const ownerName = String(body.ownerName ?? "").trim();
  const ownerPhone = String(body.ownerPhone ?? "").replace(/\D/g, "");
  const ownerEmailInput = String(body.ownerEmail ?? "").trim().toLowerCase();

  // ── PG details ────────────────────────────────────────────────────────
  const title = String(body.title ?? "").trim();
  const pincode = String(body.pincode ?? "").replace(/\D/g, "").slice(0, 6);
  const cityName = String(body.cityName ?? "").trim();
  const stateName = String(body.stateName ?? "").trim();
  const address = String(body.address ?? "").trim();
  const genderAllowed = ["BOYS", "GIRLS", "COED"].includes(body.genderAllowed) ? body.genderAllowed : "BOYS";
  const rent = parseInt(String(body.rent ?? "")) || 0;
  const roomTypesRaw: string[] = Array.isArray(body.roomTypes) ? body.roomTypes : [];
  const roomTypes = roomTypesRaw.filter((r): r is PGType => (VALID_ROOM_TYPES as string[]).includes(r));
  if (roomTypes.length === 0) roomTypes.push("SINGLE_ROOM");

  if (!ownerName || ownerName.length < 2) return NextResponse.json({ success: false, message: "Owner ka naam daalein" }, { status: 400 });
  if (ownerPhone.length !== 10) return NextResponse.json({ success: false, message: "Owner ka 10-digit phone daalein" }, { status: 400 });
  if (!title || title.length < 3) return NextResponse.json({ success: false, message: "PG ka naam daalein" }, { status: 400 });
  if (pincode.length !== 6) return NextResponse.json({ success: false, message: "6-digit PIN code daalein" }, { status: 400 });
  if (!cityName) return NextResponse.json({ success: false, message: "City daalein" }, { status: 400 });
  if (!address) return NextResponse.json({ success: false, message: "Address daalein" }, { status: 400 });
  if (rent <= 0) return NextResponse.json({ success: false, message: "Sahi rent daalein" }, { status: 400 });

  try {
    // Resolve/create the city server-side (same logic as the owner flow).
    const city = await resolveCity({ pincode, cityName, stateName });
    if (!city) {
      return NextResponse.json({ success: false, message: "City resolve nahi hui — PIN code ya city check karein" }, { status: 400 });
    }

    // Find-or-create the OWNER user by phone. If an account already exists we
    // attach the PG to it (never overwrite their name/role).
    // Self-referral guard: registering your own PG under your own partner code
    // is a commission on your own purchase, renewing forever.
    if (
      (ctx.phone && ctx.phone === ownerPhone) ||
      (ownerEmailInput && ctx.email.toLowerCase() === ownerEmailInput)
    ) {
      return NextResponse.json(
        { success: false, message: "Apne hi number/email par owner account nahi bana sakte" },
        { status: 400 },
      );
    }

    let owner = await db.user.findUnique({ where: { phone: ownerPhone }, select: { id: true, role: true } });
    let createdOwner = false;
    // Returned to the partner exactly once, for a brand-new owner only. Without
    // it the owner had no way to log in at all — so they could never see their
    // PG, never buy a plan, and the whole flow stopped at registration.
    let ownerPassword: string | null = null;
    if (!owner) {
      const email = ownerEmailInput || `owner_${ownerPhone}@pgsathi.in`;
      const emailTaken = await db.user.findUnique({ where: { email }, select: { id: true } });
      ownerPassword = generateOwnerPassword();
      owner = await db.user.create({
        data: {
          name: ownerName,
          phone: ownerPhone,
          // Fall back to a phone-based email if the chosen one is taken.
          email: emailTaken ? `owner_${ownerPhone}@pgsathi.in` : email,
          passwordHash: await bcrypt.hash(ownerPassword, 10),
          role: "OWNER",
          isVerified: true,
          // The partner is shown this password once so they can hand it over.
          // Forcing a change at first login is what stops their copy of it
          // remaining a working key to the owner's account.
          mustChangePassword: true,
        },
        select: { id: true, role: true },
      });
      createdOwner = true;
    }

    // Commission follows the OWNER, so the owner has to carry the attribution.
    // First partner to touch them wins and it is never reassigned — that is what
    // keeps payouts unambiguous when an owner ends up with two partners' PGs.
    const { attributeOwnerToPartner } = await import("@/lib/partner-earnings");
    await attributeOwnerToPartner(owner.id, ctx.partnerId);

    const slug = slugify(`${title}-${Date.now().toString().slice(-6)}`, { lower: true, strict: true });

    const num = (v: any) => (v === null || v === undefined || v === "" ? null : parseInt(String(v)) || null);
    const photos: { url: string; publicId: string }[] = Array.isArray(body.photos) ? body.photos : [];
    const amenities: string[] = Array.isArray(body.amenities) ? body.amenities.filter((s: any) => typeof s === "string") : [];

    const listing = await db.listing.create({
      data: {
        ownerId: owner.id,
        partnerId: ctx.partnerId, // permanent attribution
        registeredVia: "PARTNER",
        title,
        slug,
        description: String(body.description ?? "").trim() || `${title} — ${cityName}`,
        roomTypes,
        genderAllowed,
        priceMin: rent,
        priceMax: parseInt(String(body.rentMax ?? "")) || rent,
        securityDeposit: num(body.roomPrices?.[roomTypes[0]]?.deposit),
        electricityCharge: num(body.electricityCharge),
        maintenanceCharge: num(body.maintenanceCharge),
        foodCharge: num(body.foodCharge),
        setupFee: num(body.setupFee),
        foodIncluded: body.foodIncluded === true,
        noticePeriod: body.noticePeriod === true,
        gateClosingTime: body.gateClosingTime === true,
        rentLockIn: body.rentLockIn !== false,
        noGuardiansStay: body.noGuardiansStay !== false,
        laundryService: body.laundryService === true,
        roomCleaning: body.roomCleaning === true,
        parking: body.parking === true,
        address,
        landmark: String(body.landmark ?? "").trim() || null,
        pincode,
        areaLocality: String(body.areaLocality ?? "").trim() || null,
        latitude: body.latitude ?? null,
        longitude: body.longitude ?? null,
        cityId: city.id,
        status: "PENDING", // admin approves partner-registered PGs
        photos: {
          create: photos.map((p, i) => ({
            url: p.url,
            publicId: p.publicId || `pgsathi/listings/${Date.now()}_${i}`,
            sortOrder: i,
            isPrimary: i === 0,
          })),
        },
        amenities: {
          create: amenities.map((s) => ({
            amenity: {
              connectOrCreate: {
                where: { slug: s },
                create: {
                  slug: s,
                  name: s.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
                  icon: "check",
                  category: "GENERAL",
                },
              },
            },
          })),
        },
      },
      select: { id: true, title: true },
    });

    await logPartnerActivity(ctx.partnerId, `PG register kiya: ${title}`, {
      entity: "Listing",
      entityId: listing.id,
      meta: { ownerPhone, createdOwner },
    });

    return NextResponse.json({
      success: true,
      message: createdOwner
        ? "PG register ho gaya. Owner ka account bhi ban gaya. Admin approval ke baad live hoga."
        : "PG register ho gaya. Admin approval ke baad live hoga.",
      data: {
        id: listing.id,
        createdOwner,
        // Hand-over details. The password is hashed in the database and can
        // never be read back — if the partner loses it they must issue a new one
        // from /partner/owners.
        ownerLogin: createdOwner ? { name: ownerName, phone: ownerPhone, password: ownerPassword } : null,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error("[PARTNER_PG_CREATE]", error);
    return NextResponse.json({ success: false, message: "PG register nahi ho paya. Dobara try karein." }, { status: 500 });
  }
}
