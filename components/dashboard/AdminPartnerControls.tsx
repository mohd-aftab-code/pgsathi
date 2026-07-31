"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, ShieldAlert, Flag, Percent, Network, Archive } from "lucide-react";

/**
 * The controls that decide what a partner is worth and whether they can be paid.
 *
 * KYC verification is the gate the payout pipeline checks — verifying details
 * that are not even filled in would make that gate meaningless, so the API
 * refuses it and this only offers the button once the partner has supplied them.
 *
 * Flagging does not stop a partner earning: the referral may well be genuine.
 * It puts every new earning of theirs on hold so a human decides.
 */
export function AdminPartnerControls({
  partnerId,
  kycVerifiedAt,
  kycGaps,
  riskFlagged,
  riskReason,
  commissionOverridePercent,
  tierOverride,
  parentPartnerId,
  parentOverridePercent,
  archivedAt,
  parentOptions,
}: {
  partnerId: number;
  kycVerifiedAt: string | Date | null;
  kycGaps: string[];
  riskFlagged: boolean;
  riskReason: string | null;
  commissionOverridePercent: number | null;
  tierOverride: string | null;
  parentPartnerId: number | null;
  parentOverridePercent: number;
  archivedAt: string | Date | null;
  parentOptions: { id: number; label: string }[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const [commission, setCommission] = useState(commissionOverridePercent?.toString() ?? "");
  const [tier, setTier] = useState(tierOverride ?? "");
  const [parent, setParent] = useState(parentPartnerId?.toString() ?? "");
  const [override, setOverride] = useState(parentOverridePercent.toString());

  const post = async (action: string, extra: Record<string, unknown> = {}) => {
    setBusy(action);
    setError("");
    try {
      const res = await fetch(`/api/admin/partners/${partnerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const d = await res.json();
      if (!d.success) { setError(d.message || "Action failed"); return; }
      router.refresh();
    } catch {
      setError("Kuch galat ho gaya");
    } finally {
      setBusy("");
    }
  };

  const spin = (a: string) => busy === a;
  const missing = kycGaps.filter((g) => g !== "admin verification");

  return (
    <div className="space-y-4">
      {error && <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}

      {/* ── KYC ────────────────────────────────────────────────── */}
      <Block
        icon={kycVerifiedAt ? <ShieldCheck size={15} className="text-green-600" /> : <ShieldAlert size={15} className="text-amber-600" />}
        title="Payout KYC"
        desc={
          kycVerifiedAt
            ? "Verified — is partner ka payout ban sakta hai."
            : missing.length
              ? `Partner ne abhi nahi diya: ${missing.join(", ")}`
              : "Details aa gayi hain — verify karne par payout ban sakega."
        }
      >
        {kycVerifiedAt ? (
          <button
            onClick={() => post("kyc_revoke")}
            disabled={!!busy}
            className="h-9 px-3 rounded-lg text-xs font-bold border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
          >
            {spin("kyc_revoke") ? <Loader2 size={13} className="animate-spin" /> : "Revoke"}
          </button>
        ) : (
          <button
            onClick={() => post("kyc_verify")}
            disabled={!!busy || missing.length > 0}
            title={missing.length ? "Pehle partner ko details bharni hongi" : undefined}
            className="h-9 px-3 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-40"
          >
            {spin("kyc_verify") ? <Loader2 size={13} className="animate-spin" /> : "Verify karein"}
          </button>
        )}
      </Block>

      {/* ── Risk flag ──────────────────────────────────────────── */}
      <Block
        icon={<Flag size={15} className={riskFlagged ? "text-red-600" : "text-neutral-400"} />}
        title="Risk flag"
        desc={
          riskFlagged
            ? `Flagged${riskReason ? `: ${riskReason}` : ""} — nayi earnings hold par ja rahi hain.`
            : "Flag karne par is partner ki har nayi earning hold par jayegi (earning banegi phir bhi)."
        }
      >
        {riskFlagged ? (
          <button
            onClick={() => post("unflag")}
            disabled={!!busy}
            className="h-9 px-3 rounded-lg text-xs font-bold border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
          >
            {spin("unflag") ? <Loader2 size={13} className="animate-spin" /> : "Flag hatayein"}
          </button>
        ) : (
          <button
            onClick={() => {
              const reason = prompt("Flag karne ki wajah?");
              if (reason) post("flag", { reason });
            }}
            disabled={!!busy}
            className="h-9 px-3 rounded-lg text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            {spin("flag") ? <Loader2 size={13} className="animate-spin" /> : "Flag karein"}
          </button>
        )}
      </Block>

      {/* ── Commission override ────────────────────────────────── */}
      <Block
        icon={<Percent size={15} className="text-violet-600" />}
        title="Custom commission rate"
        desc="Set karne par plan ki rate ki jagah yehi lagegi — bade channel partners ki negotiated deal ke liye. Khaali chhodne par standard rate."
      >
        <div className="flex items-center gap-1.5">
          <input
            value={commission}
            onChange={(e) => setCommission(e.target.value.replace(/\D/g, ""))}
            placeholder="—"
            className="w-16 h-9 px-2 rounded-lg border border-neutral-200 text-xs text-center"
          />
          <span className="text-xs font-bold text-neutral-400">%</span>
          <button
            onClick={() => post("set_commission", { commissionOverridePercent: commission === "" ? null : commission })}
            disabled={!!busy}
            className="h-9 px-3 rounded-lg text-xs font-bold bg-neutral-900 text-white hover:bg-black disabled:opacity-50"
          >
            {spin("set_commission") ? <Loader2 size={13} className="animate-spin" /> : "Set"}
          </button>
        </div>
      </Block>

      {/* ── Tier pin ───────────────────────────────────────────── */}
      <Block
        icon={<Percent size={15} className="text-amber-500" />}
        title="Tier"
        desc="Normally paid owners se apne aap decide hota hai. Yahan pin kar sakte hain."
      >
        <div className="flex items-center gap-1.5">
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className="h-9 px-2 rounded-lg border border-neutral-200 text-xs"
          >
            <option value="">Auto</option>
            <option value="SILVER">Silver</option>
            <option value="GOLD">Gold</option>
            <option value="PLATINUM">Platinum</option>
          </select>
          <button
            onClick={() => post("set_tier", { tierOverride: tier === "" ? null : tier })}
            disabled={!!busy}
            className="h-9 px-3 rounded-lg text-xs font-bold bg-neutral-900 text-white hover:bg-black disabled:opacity-50"
          >
            {spin("set_tier") ? <Loader2 size={13} className="animate-spin" /> : "Set"}
          </button>
        </div>
      </Block>

      {/* ── Sub-partner hierarchy ──────────────────────────────── */}
      <Block
        icon={<Network size={15} className="text-blue-600" />}
        title="Channel partner ke under"
        desc="Parent ko is partner ki har earning ka set kiya hua % override milega — alag earning row banegi, hisaab saaf rahega."
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <select
            value={parent}
            onChange={(e) => setParent(e.target.value)}
            className="h-9 px-2 rounded-lg border border-neutral-200 text-xs max-w-[180px]"
          >
            <option value="">Koi nahi</option>
            {parentOptions.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
          <input
            value={override}
            onChange={(e) => setOverride(e.target.value.replace(/\D/g, ""))}
            className="w-14 h-9 px-2 rounded-lg border border-neutral-200 text-xs text-center"
          />
          <span className="text-xs font-bold text-neutral-400">%</span>
          <button
            onClick={() => post("set_parent", { parentPartnerId: parent === "" ? null : parent, parentOverridePercent: override })}
            disabled={!!busy}
            className="h-9 px-3 rounded-lg text-xs font-bold bg-neutral-900 text-white hover:bg-black disabled:opacity-50"
          >
            {spin("set_parent") ? <Loader2 size={13} className="animate-spin" /> : "Set"}
          </button>
        </div>
      </Block>

      {/* ── Archive ────────────────────────────────────────────── */}
      <Block
        icon={<Archive size={15} className="text-neutral-500" />}
        title="Archive"
        desc={
          archivedAt
            ? "Archived — referral code kaam nahi karta, history surakshit hai."
            : "Delete ki jagah archive: code band ho jata hai par earnings aur payouts ka record rehta hai."
        }
      >
        <button
          onClick={() => post(archivedAt ? "unarchive" : "archive")}
          disabled={!!busy}
          className="h-9 px-3 rounded-lg text-xs font-bold border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
        >
          {spin("archive") || spin("unarchive")
            ? <Loader2 size={13} className="animate-spin" />
            : archivedAt ? "Restore" : "Archive"}
        </button>
      </Block>
    </div>
  );
}

function Block({ icon, title, desc, children }: { icon: React.ReactNode; title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-neutral-200 p-3.5">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-xs font-bold text-neutral-800">{title}</span>
        </div>
        <p className="text-[11px] text-neutral-500 mt-1 max-w-md">{desc}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
