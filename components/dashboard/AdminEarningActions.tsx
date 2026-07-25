"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, IndianRupee, Wallet, X, Loader2 } from "lucide-react";

/**
 * Set amount / approve / mark paid / cancel for one partner earning.
 *
 * "Mark Paid" asks for the payment method and reference because the API records
 * a PartnerPayout for it — the same trail the batch payout leaves.
 */
export function AdminEarningActions({ id, amount, status }: { id: number; amount: number; status: string }) {
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
    } catch { alert("Kuch gadbad ho gayi"); } finally { setBusy(""); }
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
      {amount > 0 && status === "PENDING" && (
        <button onClick={() => post("approve")} disabled={!!busy} className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50">
          {spin("approve") ? <Loader2 size={12} className="animate-spin" /> : <Check size={13} />} Approve
        </button>
      )}
      {status === "APPROVED" && (
        <button onClick={() => setPayOpen(true)} disabled={!!busy} className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-bold bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50">
          {spin("mark_paid") ? <Loader2 size={12} className="animate-spin" /> : <Wallet size={13} />} Mark Paid
        </button>
      )}
      <button onClick={() => { if (confirm("Ye earning cancel karein?")) post("cancel"); }} disabled={!!busy} className="inline-flex items-center gap-1 h-8 px-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 disabled:opacity-50">
        {spin("cancel") ? <Loader2 size={12} className="animate-spin" /> : <X size={13} />}
      </button>

      {payOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4" onClick={() => !busy && setPayOpen(false)}>
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl text-left" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <h3 className="font-bold text-neutral-900">Payment record karein</h3>
              <button onClick={() => setPayOpen(false)} className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100"><X size={16} /></button>
            </div>

            <div className="p-5 space-y-4">
              <div className="rounded-xl bg-neutral-50 border border-neutral-200 px-4 py-3">
                <div className="text-xs text-neutral-500">Is earning ka payment</div>
                <div className="text-2xl font-extrabold text-neutral-900">₹{amount.toLocaleString("en-IN")}</div>
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
                <button onClick={() => setPayOpen(false)} className="flex-1 h-11 rounded-xl border-2 border-neutral-200 font-bold text-sm text-neutral-700">Cancel</button>
                <button onClick={() => post("mark_paid", { method, reference })} disabled={!!busy} className="flex-1 h-11 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-1.5">
                  {spin("mark_paid") ? <><Loader2 size={15} className="animate-spin" /> Recording…</> : "Paid confirm karein"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
