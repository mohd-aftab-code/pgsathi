"use client";

import { useState } from "react";
import { Loader2, Save, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export type ProgramSettingsShape = {
  holdDays: number;
  autoApproveEnabled: boolean;
  autoApproveMaxAmount: number;
  minPayoutAmount: number;
  payoutDayOfMonth: number;
  makerCheckerAbove: number;
  tdsEnabled: boolean;
  tdsRateWithPan: number;
  tdsRateWithoutPan: number;
  tdsThresholdYearly: number;
  goldAfterConversions: number;
  platinumAfterConversions: number;
  goldBonusPercent: number;
  platinumBonusPercent: number;
};

export function PartnerProgramSettings({ initial }: { initial: ProgramSettingsShape }) {
  const [f, setF] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const num = (k: keyof ProgramSettingsShape) => (v: string) => setF({ ...f, [k]: v === "" ? 0 : parseInt(v) || 0 });
  const bool = (k: keyof ProgramSettingsShape) => () => setF({ ...f, [k]: !f[k] });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/partner-program", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const data = await res.json();
      if (!data.success) {
        const err = data.message ?? "Save nahi hua";
        setError(err);
        toast.error(err);
        return;
      }
      setSaved(true);
      toast.success("Partner program settings saved successfully!");
      setTimeout(() => setSaved(false), 2500);
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Section
        title="Earning approval"
        hint="Hold window wo samay hai jisme refund aa sakta hai. Uske andar aayi wapasi ka commission kabhi payable hi nahi hota."
      >
        <Num label="Hold days" value={f.holdDays} onChange={num("holdDays")} suffix="din" />
        <Toggle label="Auto-approve" desc="Hold nikalne ke baad apne aap approve" checked={f.autoApproveEnabled} onChange={bool("autoApproveEnabled")} />
        <Num label="Manual review above" value={f.autoApproveMaxAmount} onChange={num("autoApproveMaxAmount")} prefix="₹" />
      </Section>

      <Section
        title="Payouts"
        hint="Fixed date aur minimum se partner ko pata rehta hai paisa kab aayega — sabse zyada poocha jaane wala sawaal."
      >
        <Num label="Minimum payout" value={f.minPayoutAmount} onChange={num("minPayoutAmount")} prefix="₹" />
        <Num label="Payout day of month" value={f.payoutDayOfMonth} onChange={num("payoutDayOfMonth")} suffix="tareekh" />
        <Num label="Maker-checker above" value={f.makerCheckerAbove} onChange={num("makerCheckerAbove")} prefix="₹" hint="0 = off" />
      </Section>

      <Section
        title="TDS (section 194H)"
        hint="Threshold cross hone ke baad hi deduct hota hai. PAN na ho to zyada rate lagti hai — isiliye payout se pehle PAN mandatory hai."
      >
        <Toggle label="TDS deduction" desc="Payout par TDS kaatein" checked={f.tdsEnabled} onChange={bool("tdsEnabled")} />
        <Num label="Rate with PAN" value={f.tdsRateWithPan} onChange={num("tdsRateWithPan")} suffix="%" />
        <Num label="Rate without PAN" value={f.tdsRateWithoutPan} onChange={num("tdsRateWithoutPan")} suffix="%" />
        <Num label="FY threshold" value={f.tdsThresholdYearly} onChange={num("tdsThresholdYearly")} prefix="₹" />
      </Section>

      <Section
        title="Tiers"
        hint="Tier ab sirf badge nahi hai — bonus seedha commission par lagta hai, isliye ye numbers unit economics ko affect karte hain."
      >
        <Num label="Gold after" value={f.goldAfterConversions} onChange={num("goldAfterConversions")} suffix="paid owners" />
        <Num label="Gold bonus" value={f.goldBonusPercent} onChange={num("goldBonusPercent")} suffix="%" />
        <Num label="Platinum after" value={f.platinumAfterConversions} onChange={num("platinumAfterConversions")} suffix="paid owners" />
        <Num label="Platinum bonus" value={f.platinumBonusPercent} onChange={num("platinumBonusPercent")} suffix="%" />
      </Section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="h-9 px-5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-[11px] uppercase tracking-wider inline-flex items-center gap-2 disabled:opacity-60 transition-colors shadow-sm"
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
        {saving ? "Save kar rahe hain…" : saved ? "Save ho gaya" : "Settings save karein"}
      </button>
    </form>
  );
}

function Section({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
      <h2 className="font-bold text-slate-900 text-xs uppercase tracking-wide">{title}</h2>
      <p className="text-[11px] text-slate-500 mt-0.5 mb-4 max-w-2xl font-normal">{hint}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">{children}</div>
    </section>
  );
}

function Num({
  label, value, onChange, prefix, suffix, hint,
}: {
  label: string;
  value: number;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</label>
      <div className="flex items-center gap-1.5">
        {prefix && <span className="text-xs font-bold text-slate-400">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8.5 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all shadow-2xs"
        />
        {suffix && <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap">{suffix}</span>}
      </div>
      {hint && <p className="text-[10px] text-slate-400 mt-1 font-medium">{hint}</p>}
    </div>
  );
}

function Toggle({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-2.5 shadow-2xs">
      <div className="min-w-0">
        <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">{label}</div>
        <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">{desc}</div>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`w-9 h-5 rounded-full relative transition-colors shrink-0 ${checked ? "bg-violet-600" : "bg-slate-300"}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${checked ? "translate-x-4.5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}
