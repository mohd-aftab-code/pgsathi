"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, IndianRupee, Wallet, X, Loader2, PauseCircle, PlayCircle } from "lucide-react";

/**
 * Set amount / hold / approve / pay / cancel for one partner earning.
 *
 * "Pay" creates a PROCESSING payout through the same pipeline as the batch
 * route — KYC gate, TDS, idempotency — and the money is only recorded as sent
 * once a UTR is entered on the payouts page.
 *
 * An earning on hold cannot be approved: the hold is the refund window and the
 * risk review, so the button is not offered until it is lifted.
 */
export function AdminEarningActions({
  id, amount, status, onHold, holdReason,
}: {
  id: number;
  amount: number;
  status: string;
  onHold?: boolean;
  holdReason?: string | null;
}) {
  const router = useRouter();
  const [val, setVal] = useState(String(amount || ""));
  const [busy, setBusy] = useState("");
  const [payOpen, setPayOpen] = useState(false);
  const [method, setMethod] = useState("UPI");
  const [reference, setReference] = useState("");

  async function post(action: string, extra: any = {}) {
    setBusy(action);
    try {
      const res = await fetch(`/api/admin/partner-earnings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const d = await res.json();
      if (!d.success) alert(d.message || "Action failed");
      else { setPayOpen(false); router.refresh(); }
    } catch { alert("Something went wrong"); } finally { setBusy(""); }
  }

  const spin = (a: string) => busy === a;

  if (status === "PAID" || status === "CANCELLED") {
    return <span className="text-xs text-neutral-400">—</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 justify-end">
      {(status === "PENDING") && (
        <>
          <div className="relative">
            <IndianRupee size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              value={val}
              onChange={(e) => setVal(e.target.value.replace(/\D/g, ""))}
              placeholder="amount"
              className="w-24 h-8 pl-6 pr-2 rounded-lg border border-neutral-300 text-xs focus:ring-1 focus:ring-primary-400 outline-none"
            />
          </div>
          <button
            onClick={() => post("set_amount", { amount: parseInt(val) || 0 })}
            disabled={!!busy}
            className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-bold bg-neutral-900 text-white hover:bg-black disabled:opacity-50"
          >
            {spin("set_amount") ? <Loader2 size={12} className="animate-spin" /> : "Set"}
          </button>
        </>
      )}
      {/* Hold has to be lifted before approval — that is the whole point of it. */}
      {status === "PENDING" && onHold && (
        <button
          onClick={() => post("unhold")}
          disabled={!!busy}
          title={holdReason ?? "On hold"}
          className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-bold bg-orange-50 text-orange-700 hover:bg-orange-100 disabled:opacity-50"
        >
          {spin("unhold") ? <Loader2 size={12} className="animate-spin" /> : <PlayCircle size={13} />} Release
        </button>
      )}
      {status === "PENDING" && !onHold && (
        <button
          onClick={() => {
            const reason = prompt("Hold karne ki wajah?");
            if (reason) post("hold", { reason });
          }}
          disabled={!!busy}
          className="inline-flex items-center gap-1 h-8 px-2 rounded-lg text-xs font-bold text-neutral-500 hover:bg-neutral-100 disabled:opacity-50"
          title="Hold this earning"
        >
          {spin("hold") ? <Loader2 size={12} className="animate-spin" /> : <PauseCircle size={13} />}
        </button>
      )}
      {amount > 0 && status === "PENDING" && !onHold && (
        <button onClick={() => post("approve")} disabled={!!busy} className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50">
          {spin("approve") ? <Loader2 size={12} className="animate-spin" /> : <Check size={13} />} Approve
        </button>
      )}
      {status === "APPROVED" && (
        <button onClick={() => setPayOpen(true)} disabled={!!busy} className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-bold bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50">
          {spin("mark_paid") ? <Loader2 size={12} className="animate-spin" /> : <Wallet size={13} />} Pay
        </button>
      )}
      <button onClick={() => { if (confirm("Cancel this earning?")) post("cancel"); }} disabled={!!busy} className="inline-flex items-center gap-1 h-8 px-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 disabled:opacity-50">
        {spin("cancel") ? <Loader2 size={12} className="animate-spin" /> : <X size={13} />}
      </button>

      {payOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4" onClick={() => !busy && setPayOpen(false)}>
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl text-left" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <h3 className="font-bold text-neutral-900">Record Payment</h3>
              <button onClick={() => setPayOpen(false)} className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100"><X size={16} /></button>
            </div>

            <div className="p-5 space-y-4">
              <div className="rounded-xl bg-neutral-50 border border-neutral-200 px-4 py-3">
                <div className="text-xs text-neutral-500">Payment for this earning</div>
                <div className="text-2xl font-extrabold text-neutral-900">₹{amount.toLocaleString("en-IN")}</div>
                <div className="text-[11px] text-neutral-500 mt-1">
                  TDS lagu hone par net amount kam ho sakta hai — payout banne ke baad exact figure dikhega.
                </div>
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
                Isse ek <b>PROCESSING</b> payout banega. Actual transfer aapko bank/UPI se karna hoga, aur
                Payouts page par UTR daalne ke baad hi wo COMPLETED hoga.
              </p>

              <div className="flex gap-2 pt-1">
                <button onClick={() => setPayOpen(false)} className="flex-1 h-11 rounded-xl border-2 border-neutral-200 font-bold text-sm text-neutral-700">Cancel</button>
                <button onClick={() => post("mark_paid", { method, reference })} disabled={!!busy} className="flex-1 h-11 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-1.5">
                  {spin("mark_paid") ? <><Loader2 size={15} className="animate-spin" /> Ban raha hai…</> : "Payout banayein"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
