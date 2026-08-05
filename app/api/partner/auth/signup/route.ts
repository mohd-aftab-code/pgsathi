/**
 * app/api/partner/auth/signup/route.ts
 * POST — partner self-registration.
 *
 * Creates the user (role PARTNER), the profile (status PENDING) and default
 * settings in one transaction, so a half-created partner can never exist.
 * The account cannot be used until an admin approves it.
 *
 * The generic /api/auth/register route deliberately only allows TENANT|OWNER,
 * so PARTNER can never be self-assigned through it.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendPartnerApplicationReceivedEmail, sendAdminNewUserNotificationEmail } from "@/lib/email";
import type { PartnerType } from "@prisma/client";

const VALID_TYPES: PartnerType[] = [
  "FREELANCER",
  "CHANNEL_PARTNER",
  "MARKETING_EXECUTIVE",
  "SALES_EXECUTIVE",
  "SUB_BROKER",
];

/** PS + 6 chars, checked for collision. Shown to the partner as their code. */
async function generatePartnerCode(): Promise<string> {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no look-alike chars
  for (let attempt = 0; attempt < 10; attempt++) {
    let code = "PS";
    for (let i = 0; i < 6; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
    const clash = await db.partnerProfile.findUnique({ where: { partnerCode: code }, select: { id: true } });
    if (!clash) return code;
  }
  throw new Error("Could not generate a unique partner code");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body.name ?? "").trim();
    const phone = String(body.phone ?? "").replace(/\D/g, "");
    const emailInput = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const city = String(body.city ?? "").trim();
    const company = String(body.company ?? "").trim();
    const type = VALID_TYPES.includes(body.type) ? (body.type as PartnerType) : "FREELANCER";

    // ── validation ────────────────────────────────────────────────────────
    if (!name || name.length < 2) {
      return NextResponse.json({ success: false, message: "Poora naam daalein" }, { status: 400 });
    }
    if (phone.length !== 10) {
      return NextResponse.json({ success: false, message: "10-digit phone number daalein" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ success: false, message: "Password kam se kam 8 characters ka ho" }, { status: 400 });
    }
    if (emailInput && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
      return NextResponse.json({ success: false, message: "Email sahi nahi hai" }, { status: 400 });
    }

    // ── rate limit: stops automated signup floods ─────────────────────────
    const rl = await checkRateLimit(`partner:signup:${phone}`, 3, 3600);
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, message: "Bahut zyada koshishein. Ek ghante baad try karein." },
        { status: 429 }
      );
    }
    
    if (!emailInput) {
      return NextResponse.json(
        { success: false, message: "Email daalna zaroori hai" },
        { status: 400 }
      );
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailInput)) {
      return NextResponse.json(
        { success: false, message: "Sahi email daalein" },
        { status: 400 }
      );
    }

    // ── uniqueness (phone and email are both unique on users) ─────────────
    const existingPhone = await db.user.findUnique({ where: { phone }, select: { id: true } });
    if (existingPhone) {
      return NextResponse.json(
        { success: false, message: "Is phone number se account pehle se hai. Login karein." },
        { status: 409 }
      );
    }

    const email = emailInput;
    const existingEmail = await db.user.findUnique({ where: { email }, select: { id: true } });
    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: "Ye email pehle se kisi aur account me registered hai." },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 10);
    const partnerCode = await generatePartnerCode();

    // One transaction: user + profile + settings, or nothing at all.
    const created = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          phone,
          email,
          passwordHash,
          role: "PARTNER",
          isVerified: true,
        },
        select: { id: true },
      });

      const profile = await tx.partnerProfile.create({
        data: {
          userId: user.id,
          partnerCode,
          type,
          status: "PENDING", // admin must approve before the portal opens
          city: city || undefined,
          company: company || undefined,
        },
        select: { id: true, partnerCode: true },
      });

      await tx.partnerSetting.create({ data: { partnerId: profile.id } });

      return profile;
    });

    await sendPartnerApplicationReceivedEmail(email, name).catch((e) => {
      console.error("[PARTNER_APP_EMAIL_ERROR]", e);
    });

    await sendAdminNewUserNotificationEmail(name, `PARTNER (${type})`, phone, email).catch((e) => {
      console.error("[ADMIN_NOTIFY_EMAIL_ERROR]", e);
    });

    return NextResponse.json(
      {
        success: true,
        message: "Registration ho gaya. Admin approval ke baad login kar payenge.",
        partnerCode: created.partnerCode,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[PARTNER_SIGNUP_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Kuch gadbad ho gayi. Dobara try karein." },
      { status: 500 }
    );
  }
}
