import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import { ensureProgramSettingsRow, nextPayoutDate } from "@/lib/partner-settings";
import { PartnerProgramSettings } from "@/components/dashboard/PartnerProgramSettings";

export const metadata = { title: "Partner Program Settings — Admin | PGSathi" };

export default async function PartnerProgramPage() {
  const s = await ensureProgramSettingsRow();

  return (
    <div className="space-y-4">
      <Link href="/dashboard/admin" className="inline-flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 hover:text-neutral-900 uppercase tracking-wider transition-colors">
        <ArrowLeft size={12} /> Admin
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Partner Program Settings</h1>
          <p className="text-neutral-500 text-xs font-medium mt-0.5">
            Refer &amp; Earn ke rules — hold window, payout cycle, TDS aur tiers. Har change audit log me jata hai.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-violet-200/60 bg-violet-50/50 px-4 py-3 text-[11px] font-medium text-violet-900">
        <Info size={14} className="text-violet-600 mt-0.5 shrink-0" />
        <p>
          Abhi ka setup: earning <b className="font-extrabold">{s.holdDays} din</b> hold rehti hai
          {s.autoApproveEnabled ? <> aur uske baad <b className="font-extrabold">₹{s.autoApproveMaxAmount.toLocaleString("en-IN")} tak</b> apne aap approve ho jaati hai</> : <> aur har earning <b className="font-extrabold">manually</b> approve karni hoti hai</>}.
          Payout har mahine ki <b className="font-extrabold">{s.payoutDayOfMonth} tareekh</b> ko (agla: {nextPayoutDate(s.payoutDayOfMonth).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}),
          minimum <b className="font-extrabold">₹{s.minPayoutAmount.toLocaleString("en-IN")}</b>.
          TDS <b className="font-extrabold uppercase">{s.tdsEnabled ? "on" : "off"}</b> hai.
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
