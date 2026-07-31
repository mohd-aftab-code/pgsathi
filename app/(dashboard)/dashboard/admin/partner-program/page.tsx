import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import { ensureProgramSettingsRow, nextPayoutDate } from "@/lib/partner-settings";
import { PartnerProgramSettings } from "@/components/dashboard/PartnerProgramSettings";

export const metadata = { title: "Partner Program Settings — Admin | PGSathi" };

export default async function PartnerProgramPage() {
  const s = await ensureProgramSettingsRow();

  return (
    <div className="space-y-5">
      <Link href="/dashboard/admin" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900">
        <ArrowLeft size={15} /> Admin
      </Link>

      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900">Partner Program Settings</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Refer &amp; Earn ke rules — hold window, payout cycle, TDS aur tiers. Har change audit log me jata hai.
        </p>
      </div>

      <div className="flex items-start gap-2.5 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm">
        <Info size={16} className="text-violet-600 mt-0.5 shrink-0" />
        <p className="text-violet-900">
          Abhi ka setup: earning <b>{s.holdDays} din</b> hold rehti hai
          {s.autoApproveEnabled ? <> aur uske baad <b>₹{s.autoApproveMaxAmount.toLocaleString("en-IN")} tak</b> apne aap approve ho jaati hai</> : <> aur har earning <b>manually</b> approve karni hoti hai</>}.
          Payout har mahine ki <b>{s.payoutDayOfMonth} tareekh</b> ko (agla: {nextPayoutDate(s.payoutDayOfMonth).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}),
          minimum <b>₹{s.minPayoutAmount.toLocaleString("en-IN")}</b>.
          TDS <b>{s.tdsEnabled ? "on" : "off"}</b> hai.
        </p>
      </div>

      <PartnerProgramSettings
        initial={{
          holdDays: s.holdDays,
          autoApproveEnabled: s.autoApproveEnabled,
          autoApproveMaxAmount: s.autoApproveMaxAmount,
          minPayoutAmount: s.minPayoutAmount,
          payoutDayOfMonth: s.payoutDayOfMonth,
          makerCheckerAbove: s.makerCheckerAbove,
          tdsEnabled: s.tdsEnabled,
          tdsRateWithPan: s.tdsRateWithPan,
          tdsRateWithoutPan: s.tdsRateWithoutPan,
          tdsThresholdYearly: s.tdsThresholdYearly,
          goldAfterConversions: s.goldAfterConversions,
          platinumAfterConversions: s.platinumAfterConversions,
          goldBonusPercent: s.goldBonusPercent,
          platinumBonusPercent: s.platinumBonusPercent,
        }}
      />
    </div>
  );
}
