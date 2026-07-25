/**
 * lib/partner-auth.ts (server-only)
 * Session helpers for the Partner Portal.
 *
 * `partnerId` always comes from the session — never from a URL, query string or
 * request body. Every partner-scoped query must filter on the value returned
 * here, which is what makes cross-partner data access impossible.
 *
 * Partner approval `status` is read fresh from the database on every request
 * rather than baked into the JWT, so an admin approving a partner takes effect
 * immediately instead of after the partner logs out and back in.
 */
import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { PartnerStatus, PartnerType } from "@prisma/client";

export type PartnerContext = {
  userId: number;
  partnerId: number;
  partnerCode: string;
  name: string;
  email: string;
  phone: string | null;
  status: PartnerStatus;
  type: PartnerType;
};

/**
 * Resolves the signed-in partner, or null. Never redirects — use this in API
 * routes so they can return a proper 401/403 instead of an HTML redirect.
 * Returns the context regardless of approval status; callers decide.
 */
export async function getPartnerContext(): Promise<PartnerContext | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (session.user.role !== "PARTNER") return null;

  // A manager session carries an id like "manager:12" — never a partner.
  const userId = parseInt(session.user.id, 10);
  if (Number.isNaN(userId)) return null;

  const profile = await db.partnerProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      partnerCode: true,
      status: true,
      type: true,
      user: { select: { name: true, email: true, phone: true } },
    },
  });
  if (!profile) return null;

  return {
    userId,
    partnerId: profile.id,
    partnerCode: profile.partnerCode,
    name: profile.user.name,
    email: profile.user.email,
    phone: profile.user.phone,
    status: profile.status,
    type: profile.type,
  };
}

/**
 * Requires an APPROVED partner. Redirects to login (not signed in) or to the
 * portal root (signed in but not yet approved / blocked), where the status
 * screen explains what is happening.
 *
 * Use in server pages. For API routes use `requirePartnerApi()`.
 */
export async function requirePartner(): Promise<PartnerContext> {
  const ctx = await getPartnerContext();
  if (!ctx) redirect("/partner/login");
  if (ctx.status !== "APPROVED") redirect("/partner/dashboard");
  return ctx;
}

/**
 * API-route variant: returns the context only for an APPROVED partner,
 * otherwise null so the caller can respond with 401/403.
 */
export async function requirePartnerApi(): Promise<PartnerContext | null> {
  const ctx = await getPartnerContext();
  if (!ctx || ctx.status !== "APPROVED") return null;
  return ctx;
}

/** Records a partner action. Never throws — logging must not break a flow. */
export async function logPartnerActivity(
  partnerId: number,
  action: string,
  opts: { entity?: string; entityId?: number; meta?: any; ip?: string } = {}
): Promise<void> {
  try {
    await db.partnerActivityLog.create({
      data: {
        partnerId,
        action,
        entity: opts.entity ?? null,
        entityId: opts.entityId ?? null,
        meta: opts.meta ?? undefined,
        ip: opts.ip ?? null,
      },
    });
  } catch {
    // activity logging is best-effort
  }
}
