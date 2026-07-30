import { requirePartner } from "@/lib/partner-auth";
import { MarketingView } from "@/components/partner/MarketingView";

export const metadata = { title: "Marketing & Referrals — Partner | PGSathi" };

export default async function PartnerMarketingPage() {
  const ctx = await requirePartner();
  
  // Hardcoded for now. Could be fetched from process.env.NEXT_PUBLIC_APP_URL
  const appUrl = "https://pgsathi.in";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">Marketing & Referrals</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Grow your earnings by referring PG Owners to the platform.
        </p>
      </div>

      <MarketingView partnerCode={ctx.partnerCode} appUrl={appUrl} />
    </div>
  );
}
