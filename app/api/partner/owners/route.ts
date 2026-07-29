/**
 * app/api/partner/owners/route.ts
 * GET  — the owners this partner brought in, with their PG count and plan.
 * POST — register a new owner on the partner's behalf.
 *
 * The partner registers the OWNER first, then lists PGs under them. The owner
 * gets a real account with a real password straight away, so the partner can
 * hand over "phone + password" and the owner logs in immediately.
 *
 * Commission follows the owner (see lib/partner-earnings), so creating the owner
 * here is what establishes the partner's claim on every future payment.
 */
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { generateOwnerPassword } from "@/lib/owner-credentials";
import { requirePartnerApi, logPartnerActivity } from "@/lib/partner-auth";
import { attributeOwnerToPartner } from "@/lib/partner-earnings";
import { sendOwnerInviteEmail, sendAdminNewUserNotificationEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function GET() {
  const ctx = await requirePartnerApi();
  if (!ctx) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const owners = await db.user.findMany({
    where: { partnerId: ctx.partnerId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, phone: true, email: true, createdAt: true,
      _count: { select: { listings: true } },
      subscriptions: {
        where: { status: { in: ["ACTIVE", "TRIAL"] }, endDate: { gt: new Date() } },
        orderBy: { endDate: "desc" },
        take: 1,
        select: { amount: true, billingCycle: true, endDate: true, plan: { select: { name: true } } },
      },
    },
  });

  return NextResponse.json({
    success: true,
    data: owners.map((o) => ({
      id: o.id,
      name: o.name,
      phone: o.phone,
      email: o.email,
      createdAt: o.createdAt,
      pgCount: o._count.listings,
      plan: o.subscriptions[0]
        ? {
            name: o.subscriptions[0].plan.name,
            amount: o.subscriptions[0].amount,
            billingCycle: o.subscriptions[0].billingCycle,
            endDate: o.subscriptions[0].endDate,
          }
        : null,
    })),
  });
}

export async function POST(req: NextRequest) {
  const ctx = await requirePartnerApi();
  if (!ctx) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").replace(/\D/g, "");
  const emailInput = String(body.email ?? "").trim().toLowerCase();
  const city = String(body.city ?? "").trim();

  if (name.length < 2) return NextResponse.json({ success: false, message: "Owner ka poora naam daalein" }, { status: 400 });
  if (phone.length !== 10) return NextResponse.json({ success: false, message: "10-digit phone number daalein" }, { status: 400 });
  if (emailInput && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailInput)) {
    return NextResponse.json({ success: false, message: "Email sahi nahi hai" }, { status: 400 });
  }

  const existing = await db.user.findUnique({
    where: { phone },
    select: { id: true, name: true, role: true, partnerId: true },
  });

  if (existing) {
    // Never reset a live account's password from here — that would let a partner
    // take over any existing user by typing their phone number.
    const mine = existing.partnerId === ctx.partnerId;
    if (!mine && existing.partnerId !== null) {
      return NextResponse.json(
        { success: false, message: "Ye owner kisi aur partner ke saath registered hai" },
        { status: 409 },
      );
    }
    // Unattributed existing owner: first partner to touch them wins.
    const claimed = await attributeOwnerToPartner(existing.id, ctx.partnerId);
    return NextResponse.json({
      success: true,
      alreadyExisted: true,
      message: claimed
        ? `${existing.name} pehle se registered the — ab aapke owners mein aa gaye.`
        : `${existing.name} pehle se aapke owners mein hain.`,
      data: { id: existing.id, name: existing.name, phone, password: null },
    });
  }

  const password = generateOwnerPassword();
  const fallbackEmail = `owner_${phone}@pgsathi.in`;
  const emailTaken = emailInput
    ? await db.user.findUnique({ where: { email: emailInput }, select: { id: true } })
    : null;

  const owner = await db.user.create({
    data: {
      name,
      phone,
      email: emailInput && !emailTaken ? emailInput : fallbackEmail,
      passwordHash: await bcrypt.hash(password, 10),
      role: "OWNER",
      isVerified: true,
      partnerId: ctx.partnerId,
      ownerType: city || null,
    },
    select: { id: true, name: true, phone: true, email: true },
  });

  await logPartnerActivity(ctx.partnerId, "owner.created", {
    entity: "User",
    entityId: owner.id,
    meta: { name: owner.name, phone: owner.phone },
  });

  if (owner.email && !owner.email.includes("@pgsathi.in")) {
    await sendOwnerInviteEmail(owner.email, owner.name, undefined, phone, password).catch(e => {
      console.error("[OWNER_INVITE_EMAIL_ERROR]", e);
    });
  }

  await sendAdminNewUserNotificationEmail(owner.name, "OWNER (via Partner)", owner.phone || "", owner.email || "").catch(e => {
    console.error("[ADMIN_NOTIFY_EMAIL_ERROR]", e);
  });

  // The password is returned exactly once, here. It is hashed in the database and
  // can never be read back — a partner who loses it must issue a new one.
  return NextResponse.json({
    success: true,
    alreadyExisted: false,
    message: `${owner.name} ka account ban gaya.`,
    data: { id: owner.id, name: owner.name, phone: owner.phone, email: owner.email, password },
  });
}
