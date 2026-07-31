import { requirePartner } from "@/lib/partner-auth";
import { db } from "@/lib/db";
import { qrSvg } from "@/lib/qr";
import { getPartnerFunnel } from "@/lib/partner-funnel";
import { MarketingView } from "@/components/partner/MarketingView";

export const metadata = { title: "Marketing & Referrals — Partner | PGSathi" };

export default async function PartnerMarketingPage() {
  const ctx = await requirePartner();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pgsathi.in";
  const shortLink = `${appUrl}/r/${ctx.partnerCode}`;

  const [funnel, bonusPlan] = await Promise.all([
    getPartnerFunnel(ctx.partnerId),
    // The headline offer to put in front of an owner: the biggest bonus any
    // live plan gives someone who arrives through a referral.
    db.plan.findFirst({
      where: { isActive: true, referralBonusDays: { gt: 0 } },
      orderBy: { referralBonusDays: "desc" },
      select: { referralBonusDays: true },
    }),
  ]);

  // Rendered on the server: the QR encoder is Node-only, and the code never
  // changes for a given partner.
  const qr = qrSvg(shortLink, { size: 190, dark: "#171717" });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">Marketing &amp; Referrals</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Link, QR aur ready-made messages — PG owners tak pahunchne ke liye sab kuch.
        </p>
      </div>

      <MarketingView
        partnerCode={ctx.partnerCode}
        appUrl={appUrl}
        qrSvg={qr}
        funnel={funnel}
        bonusDays={bonusPlan?.referralBonusDays ?? 0}
      />
    </div>
  );
}
