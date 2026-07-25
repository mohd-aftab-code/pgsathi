"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, Loader2, X } from "lucide-react";

/**
 * Pays out every approved-but-unpaid earning for one partner in a single batch.
 * Disabled when there is nothing payable, and warns if the partner hasn't filled
 * in payout details yet (you can't transfer money to a blank UPI/account).
 */
export function CreatePayoutButton({
  partnerId,
  count,
  amount,
  hasPayoutDetails,
}: {
  partnerId: number;
  count: number;
  amount: number;
  hasPayoutDetails: boolean;
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
      if (!d.success) { setError(d.message || "Payout nahi bana"); setBusy(false); return; }
      setOpen(false);
      router.refresh();
    } catch { setError("Kuch gadbad ho gayi"); } finally { setBusy(false); }
  }

  if (count === 0) {
    return (
      <button disabled className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-neutral-100 text-neutral-400 text-sm font-bold cursor-not-allowed">
        <Wallet size={15} /> Payout karein
      </button>
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
              <h3 className="font-bold text-neutral-900">Payout record karein</h3>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100"><X size={16} /></button>
            </div>

            <div className="p-5 space-y-4">
              {error && <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}

              {!hasPayoutDetails && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
                  Is partner ne payout details (UPI/bank) nahi bhare hain. Confirm kar lein ki paisa kahan bhejna hai.
                </div>
              )}

              <div className="rounded-xl bg-neutral-50 border border-neutral-200 px-4 py-3">
                <div className="text-xs text-neutral-500">Total payout</div>
                <div className="text-2xl font-extrabold text-neutral-900">₹{amount.toLocaleString("en-IN")}</div>
                <div className="text-xs text-neutral-500 mt-0.5">{count} approved earning(s) is batch mein</div>
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
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">Reference / UTR <span className="text-neutral-400 font-normal">(optional)</span></label>
                <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. UTR123456789" className="w-full h-11 px-3 rounded-xl border-2 border-neutral-200 text-sm" />
              </div>

              <p className="text-[11px] text-neutral-400">
                Ye record karta hai ki paisa bhej diya gaya. Actual transfer aapko apne bank/UPI se karna hoga.
              </p>

              <div className="flex gap-2 pt-1">
                <button onClick={() => setOpen(false)} className="flex-1 h-11 rounded-xl border-2 border-neutral-200 font-bold text-sm text-neutral-700">Cancel</button>
                <button onClick={submit} disabled={busy} className="flex-1 h-11 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-1.5">
                  {busy ? <><Loader2 size={15} className="animate-spin" /> Recording…</> : "Payout confirm karein"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
