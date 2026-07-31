import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendWelcomeEmail, sendPartnerApplicationReceivedEmail, sendAdminNewUserNotificationEmail } from "@/lib/email";
import { z } from "zod";
import { withErrorHandler } from "@/lib/api-error-handler";
import {
  REFERRAL_COOKIE,
  resolveReferralCode,
  markClickConverted,
  generatePartnerCode,
  normalizeCode,
} from "@/lib/referral";

type AllowedRole = "TENANT" | "OWNER" | "PARTNER";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().length(10, "Phone number must be exactly 10 digits").regex(/^\d+$/, "Phone number must contain only digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["TENANT", "OWNER", "PARTNER"]).optional().default("TENANT"),
  referralCode: z.string().optional()
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  // IP-based rate limit: 5 registrations per hour per IP.
  // Prevents account spam and phone-number enumeration.
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = await checkRateLimit(`register:${ip}`, 5, 3600);
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, message: "Too many registration attempts. Please try again later." },
      { status: 429 }
    );
  }

  const body = await req.json();
  // Zod throws an error which is caught by withErrorHandler
  const parseResult = registerSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json(
      { success: false, message: parseResult.error.issues[0].message },
      { status: 400 }
    );
  }

  const { name, email, phone, password, role, referralCode } = parseResult.data;

  // Validate role
  const allowedRoles: AllowedRole[] = ["TENANT", "OWNER", "PARTNER"];
  const userRole: AllowedRole =
    allowedRoles.includes(role as AllowedRole) ? (role as AllowedRole) : "TENANT";

  // Check if user already exists
  const existingUser = await db.user.findFirst({
    where: {
      OR: [{ phone }, { email }],
    },
  });
  if (existingUser) {
    return NextResponse.json(
      { success: false, message: "An account with this phone number or email already exists" },
      { status: 400 }
    );
  }

  const passwordHash = await hash(password, 10);

  // ── Referral resolution ───────────────────────────────────────────────────
  // The form value wins, but a code parked in the cookie by `proxy.ts` is used
  // when the form has none — that is what lets someone open the link today and
  // register on Thursday without the referral being lost.
  const cookieCode = req.cookies.get(REFERRAL_COOKIE)?.value ?? null;
  const rawCode = normalizeCode(referralCode) ?? normalizeCode(cookieCode);
  // resolveReferralCode only resolves APPROVED, non-archived partners: a
  // rejected or suspended partner's link keeps circulating long after the
  // decision and must stop collecting owners immediately.
  const resolved = rawCode ? await resolveReferralCode(rawCode) : null;

  let partnerId: number | undefined;
  let referredBy: number | undefined;
  let attributionBlocked: string | null = null;

  if (resolved) {
    if (resolved.kind === "PARTNER") {
      // Only owners carry a partner attribution — a tenant produces no
      // commission, and a partner referring a partner is not a thing.
      if (userRole !== "OWNER") {
        attributionBlocked = "not an owner signup";
      } else {
        // Self-referral guard: a partner signing themselves up as their own
        // owner would earn commission on their own purchase, forever.
        const partnerUser = await db.user.findUnique({
          where: { id: resolved.partnerUserId },
          select: { phone: true, email: true },
        });
        const selfPhone = partnerUser?.phone && partnerUser.phone === phone;
        const selfEmail = partnerUser?.email && partnerUser.email.toLowerCase() === email.trim().toLowerCase();
        if (selfPhone || selfEmail) {
          attributionBlocked = "self-referral";
        } else {
          // Velocity limit: one referral link producing a burst of signups from
          // one IP is the cheapest fraud there is.
          const velocity = await checkRateLimit(`ref:${resolved.partnerId}:${ip}`, 3, 86400);
          if (!velocity.allowed) {
            attributionBlocked = "velocity limit";
          } else {
            partnerId = resolved.partnerId;
          }
        }
      }
    } else {
      // Owner-to-owner (or tenant-to-tenant) referral.
      if (resolved.referrerUserId) referredBy = resolved.referrerUserId;
    }
  }

  if (attributionBlocked) {
    console.warn(`[register] referral ${rawCode} not applied (${attributionBlocked})`);
  }

  let createdUserId: number | null = null;

  if (userRole === "PARTNER") {
    const partnerCode = await generatePartnerCode();
    await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          phone,
          email: email.trim().toLowerCase(),
          passwordHash,
          role: userRole,
          isVerified: true,
        },
        select: { id: true },
      });
      createdUserId = user.id;

      const profile = await tx.partnerProfile.create({
        data: {
          userId: user.id,
          partnerCode,
          type: "FREELANCER",
          status: "PENDING",
        },
        select: { id: true },
      });

      await tx.partnerSetting.create({ data: { partnerId: profile.id } });
    });
  } else {
    const user = await db.user.create({
      data: {
        name: name.trim(),
        phone,
        email: email.trim().toLowerCase(),
        passwordHash,
        role: userRole,
        isVerified: true,
        partnerId,
        partnerAttributedAt: partnerId ? new Date() : undefined,
        referredBy,
      },
      select: { id: true },
    });
    createdUserId = user.id;
  }

  // Close the funnel loop: this click produced a signup.
  if (rawCode && createdUserId && (partnerId || referredBy)) {
    await markClickConverted(rawCode, createdUserId);
  }

  if (userRole === "PARTNER") {
    sendPartnerApplicationReceivedEmail(email.trim().toLowerCase(), name.trim()).catch((e) => {
      console.error("[PARTNER_APP_EMAIL_ERROR]", e);
    });
  } else {
    sendWelcomeEmail(email.trim().toLowerCase(), name.trim(), userRole, phone, password).catch((e) => {
      console.error("[WELCOME_EMAIL_ERROR]", e);
    });
  }

  sendAdminNewUserNotificationEmail(name.trim(), userRole, phone, email.trim().toLowerCase()).catch((e) => {
    console.error("[ADMIN_NOTIFY_EMAIL_ERROR]", e);
  });

  const res = NextResponse.json(
    { success: true, message: "Registration successful" },
    { status: 201 }
  );
  // The cookie has done its job; leaving it would attribute the next person who
  // registers on this browser to the same partner.
  if (cookieCode) res.cookies.delete(REFERRAL_COOKIE);
  return res;
});
