/**
 * lib/referral.ts (server-only)
 * Attribution — turning a shared link into a durable claim.
 *
 * The old flow only read `?ref=` out of the URL at the moment the register form
 * submitted, so a visitor who browsed for two minutes and then signed up lost
 * the referral silently. A cookie set the moment the link is opened is what
 * makes attribution survive that gap; `proxy.ts` sets it at the edge and this
 * module is the server-side half.
 *
 * Two kinds of code flow through here and stay deliberately separate:
 *   • partner codes  (`PartnerProfile.partnerCode`, "PS…")  → User.partnerId
 *   • owner codes    (`User.referralCode`,          "PG…")  → User.referredBy
 * A partner earns commission; an owner earns bonus days. Mixing the two ledgers
 * would make either one impossible to reconcile.
 */
import "server-only";
import { db } from "@/lib/db";

/** Cookie the referral code is parked in between landing and registration. */
export const REFERRAL_COOKIE = "ps_ref";
/** 30 days — long enough to cover a realistic PG-owner decision cycle. */
export const REFERRAL_COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

const PARTNER_PREFIX = "PS";
const OWNER_PREFIX = "PGO";
/** No O/0/I/1 — these codes get read aloud and copied off posters. */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Uppercased, stripped of anything a code can never contain. */
export function normalizeCode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const code = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20);
  return code.length >= 4 ? code : null;
}

export type ResolvedReferral =
  | { kind: "PARTNER"; partnerId: number; partnerUserId: number; name: string }
  | { kind: "OWNER"; referrerUserId: number; name: string };

/**
 * Turns a code into who it credits, or null.
 *
 * A partner code only resolves while the partner is APPROVED and not archived.
 * That is deliberate: a rejected or suspended partner's link keeps circulating
 * on WhatsApp long after the decision, and it must stop collecting owners the
 * moment the decision is made — not the moment the link stops being shared.
 */
export async function resolveReferralCode(raw: string | null | undefined): Promise<ResolvedReferral | null> {
  const code = normalizeCode(raw);
  if (!code) return null;

  const partner = await db.partnerProfile.findUnique({
    where: { partnerCode: code },
    select: {
      id: true,
      userId: true,
      status: true,
      archivedAt: true,
      user: { select: { name: true } },
    },
  });
  if (partner) {
    if (partner.status !== "APPROVED" || partner.archivedAt) return null;
    return { kind: "PARTNER", partnerId: partner.id, partnerUserId: partner.userId, name: partner.user.name };
  }

  const referrer = await db.user.findUnique({
    where: { referralCode: code },
    select: { id: true, name: true, isActive: true, role: true },
  });
  if (referrer && referrer.isActive && (referrer.role === "OWNER" || referrer.role === "TENANT")) {
    return { kind: "OWNER", referrerUserId: referrer.id, name: referrer.name };
  }

  return null;
}

/**
 * Records a referral-link open. Never throws — a tracking failure must not stop
 * the visitor reaching the page.
 *
 * Only the short-link route (`/r/<code>`) records clicks; a bare `?ref=` link
 * is handled at the edge where there is no database. Conversions from those
 * still land in the table via `markClickConverted`, which creates the row when
 * no click matched, so the funnel never over-counts but also never loses a
 * signup.
 */
export async function recordReferralClick(input: {
  code: string;
  landingPath?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}): Promise<void> {
  try {
    const code = normalizeCode(input.code);
    if (!code) return;
    const resolved = await resolveReferralCode(code);

    await db.referralClick.create({
      data: {
        code,
        partnerId: resolved?.kind === "PARTNER" ? resolved.partnerId : null,
        referrerUserId: resolved?.kind === "OWNER" ? resolved.referrerUserId : null,
        landingPath: input.landingPath?.slice(0, 300) ?? null,
        ip: input.ip?.slice(0, 45) ?? null,
        userAgent: input.userAgent?.slice(0, 300) ?? null,
        utmSource: input.utmSource?.slice(0, 60) ?? null,
        utmMedium: input.utmMedium?.slice(0, 60) ?? null,
        utmCampaign: input.utmCampaign?.slice(0, 60) ?? null,
      },
    });
  } catch (e) {
    console.error("[referral] click record failed (non-fatal):", e);
  }
}

/**
 * Attaches a registration to the most recent unconverted click for its code.
 * When no click was recorded (a bare `?ref=` link, or a cookie that outlived
 * its click row) one is created already-converted, so signup counts stay right.
 */
export async function markClickConverted(rawCode: string, userId: number): Promise<void> {
  try {
    const code = normalizeCode(rawCode);
    if (!code) return;

    const click = await db.referralClick.findFirst({
      where: { code, convertedUserId: null },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    if (click) {
      await db.referralClick.update({
        where: { id: click.id },
        data: { convertedUserId: userId, convertedAt: new Date() },
      });
      return;
    }

    const resolved = await resolveReferralCode(code);
    await db.referralClick.create({
      data: {
        code,
        partnerId: resolved?.kind === "PARTNER" ? resolved.partnerId : null,
        referrerUserId: resolved?.kind === "OWNER" ? resolved.referrerUserId : null,
        landingPath: "(untracked)",
        convertedUserId: userId,
        convertedAt: new Date(),
      },
    });
  } catch (e) {
    console.error("[referral] conversion mark failed (non-fatal):", e);
  }
}

/** `PGO` + 6 chars, collision-checked. */
export async function generateOwnerReferralCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    let code = OWNER_PREFIX;
    for (let i = 0; i < 6; i++) code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    const clash = await db.user.findUnique({ where: { referralCode: code }, select: { id: true } });
    if (!clash) return code;
  }
  throw new Error("Could not generate a unique referral code");
}

/** `PS` + 6 chars, collision-checked. */
export async function generatePartnerCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    let code = PARTNER_PREFIX;
    for (let i = 0; i < 6; i++) code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    const clash = await db.partnerProfile.findUnique({ where: { partnerCode: code }, select: { id: true } });
    if (!clash) return code;
  }
  throw new Error("Could not generate a unique partner code");
}

/** This user's own shareable code, generated on first request. */
export async function getOrCreateOwnerReferralCode(userId: number): Promise<string> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { referralCode: true } });
  if (user?.referralCode) return user.referralCode;

  const code = await generateOwnerReferralCode();
  await db.user.update({ where: { id: userId }, data: { referralCode: code } });
  return code;
}

/**
 * Two-sided referral: extra free days on the plan the referred user just took.
 *
 * Granted once per user ever (`referralRewardAt`), on their first paid
 * subscription, and only when the plan actually offers a bonus. Returns the
 * days added so the caller can tell the user about it.
 */
export async function applyReferralBonusDays(userId: number, subscriptionId: number): Promise<number> {
  try {
    const [user, sub] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: { referredBy: true, partnerId: true, referralRewardAt: true },
      }),
      db.subscription.findUnique({
        where: { id: subscriptionId },
        select: { id: true, endDate: true, plan: { select: { referralBonusDays: true } } },
      }),
    ]);

    if (!user || !sub) return 0;
    if (user.referralRewardAt) return 0; // already rewarded, ever
    if (!user.referredBy && !user.partnerId) return 0; // not referred by anyone
    const days = sub.plan.referralBonusDays;
    if (days <= 0) return 0;

    const newEnd = new Date(sub.endDate.getTime() + days * 24 * 60 * 60 * 1000);
    await db.$transaction([
      db.subscription.update({ where: { id: sub.id }, data: { endDate: newEnd } }),
      db.user.update({ where: { id: userId }, data: { referralRewardAt: new Date() } }),
    ]);
    return days;
  } catch (e) {
    console.error("[referral] bonus grant failed (non-fatal):", e);
    return 0;
  }
}
