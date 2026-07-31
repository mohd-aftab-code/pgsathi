/**
 * app/api/account/referral/route.ts
 * GET — this user's own referral code, link and results.
 *
 * `User.referralCode` and `User.referredBy` have existed in the schema since the
 * beginning and were never written to by anything — the owner-to-owner referral
 * they were designed for was planned and then not built. This route is what
 * finally uses them, so a channel that needs no new tables costs one endpoint.
 *
 * Codes are minted on first request rather than at signup, so the column stays
 * empty for the users who never ask.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateOwnerReferralCode } from "@/lib/referral";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const userId = parseInt(session.user.id, 10);
  if (Number.isNaN(userId)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const code = await getOrCreateOwnerReferralCode(userId);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pgsathi.in";

  const [clicks, referred, bonusPlan] = await Promise.all([
    db.referralClick.count({ where: { code } }),
    db.user.findMany({
      where: { referredBy: userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, name: true, createdAt: true, referralRewardAt: true },
    }),
    db.plan.findFirst({
      where: { isActive: true, referralBonusDays: { gt: 0 } },
      orderBy: { referralBonusDays: "desc" },
      select: { referralBonusDays: true },
    }),
  ]);

  // "Converted" means they actually took a paid plan — which is also the moment
  // the reward is granted, so the two can never disagree.
  const converted = referred.filter((r) => r.referralRewardAt !== null).length;

  return NextResponse.json({
    success: true,
    data: {
      code,
      link: `${appUrl}/r/${code}`,
      bonusDays: bonusPlan?.referralBonusDays ?? 0,
      clicks,
      signups: referred.length,
      converted,
      referred: referred.map((r) => ({
        id: r.id,
        name: r.name,
        joinedAt: r.createdAt,
        rewarded: r.referralRewardAt !== null,
      })),
    },
  });
}
