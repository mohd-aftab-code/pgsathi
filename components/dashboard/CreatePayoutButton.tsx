"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, Loader2, X } from "lucide-react";

/**
 * Pays out every approved-but-unpaid earning for one partner in a single batch.
 *
 * Creates a PROCESSING payout — the transfer itself still happens in a bank app,
 * and the payout only becomes COMPLETED once its UTR is recorded. Blocked
 * outright when the partner's payout details are not verified: marking earnings
 * PAID with nowhere to send the money put them in a terminal state describing
 * something that never happened.
 */
export function CreatePayoutButton({
  partnerId,
  count,
  amount,
  hasPayoutDetails,
  kycGaps = [],
}: {
  partnerId: number;
  count: number;
  amount: number;
  hasPayoutDetails: boolean;
  /** Anything still missing before a payout can legally be created. */
  kycGaps?: string[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState("UPI");
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/admin/partner-payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId, method, reference }),
      });
      const d = await res.json();
      if (!d.success) { setError(d.message || "Payout failed"); setBusy(false); return; }
      setOpen(false);
      router.refresh();
    } catch { setError("Something went wrong"); } finally { setBusy(false); }
  }

  if (count === 0) {
    return (
      <button disabled className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-neutral-100 text-neutral-400 text-sm font-bold cursor-not-allowed">
        <Wallet size={15} /> Create Payout
      </button>
    );
  }

  // The API refuses this anyway; showing why here saves a pointless round trip.
  if (kycGaps.length > 0) {
    return (
      <div className="inline-flex flex-col items-start gap-1">
        <button disabled className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-neutral-100 text-neutral-400 text-sm font-bold cursor-not-allowed">
          <Wallet size={15} /> KYC pending
        </button>
        <span className="text-[11px] text-amber-700">Baaki: {kycGaps.join(", ")}</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold transition-colors"
      >
        <Wallet size={15} /> Payout ₹{amount.toLocaleString("en-IN")}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4" onClick={() => !busy && setOpen(false)}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <h3 className="font-bold text-neutral-900">Record Payout</h3>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100"><X size={16} /></button>
            </div>

            <div className="p-5 space-y-4">
              {error && <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}

              {!hasPayoutDetails && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
                  Is partner ne payout details (UPI/bank) nahi di hain. Confirm karein ki paisa kahan bhejna hai.
                </div>
              )}

              <div className="rounded-xl bg-neutral-50 border border-neutral-200 px-4 py-3">
                <div className="text-xs text-neutral-500">Total payout</div>
                <div className="text-2xl font-extrabold text-neutral-900">₹{amount.toLocaleString("en-IN")}</div>
                <div className="text-xs text-neutral-500 mt-0.5">{count} approved earning(s) in this batch</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">Payment method</label>
                <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full h-11 px-3 rounded-xl border-2 border-neutral-200 text-sm cursor-pointer">
                  <option value="UPI">UPI</option>
                  <option value="BANK">Bank Transfer</option>
                  <option value="CASH">Cash</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">Reference / UTR <span className="text-neutral-400 font-normal">(baad me bhi daal sakte hain)</span></label>
                <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. UTR123456789" className="w-full h-11 px-3 rounded-xl border-2 border-neutral-200 text-sm" />
              </div>

              <p className="text-[11px] text-neutral-400">
                Isse ek <b>PROCESSING</b> payout banega aur TDS (agar lagu ho) apne aap kat jayega. Actual transfer
                bank/UPI se karke UTR record karein — tabhi payout COMPLETED hoga.
              </p>

              <div className="flex gap-2 pt-1">
                <button onClick={() => setOpen(false)} className="flex-1 h-11 rounded-xl border-2 border-neutral-200 font-bold text-sm text-neutral-700">Cancel</button>
                <button onClick={submit} disabled={busy} className="flex-1 h-11 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-1.5">
                  {busy ? <><Loader2 size={15} className="animate-spin" /> Recording…</> : "Confirm Payout"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
