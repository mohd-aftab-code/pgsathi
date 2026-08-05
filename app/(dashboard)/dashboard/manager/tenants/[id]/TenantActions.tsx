/**
 * app/(main)/dashboard/manager/tenants/[id]/TenantActions.tsx
 * Client component with action buttons for tenant detail page.
 */
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Receipt, BellRing, Trash2 } from "lucide-react";

interface Props {
  tenantId: number;
  listingId: number;
  forMonth: string;
  monthlyRent: number;
}

export function TenantActions({ tenantId, listingId, forMonth, monthlyRent }: Props) {
  const router = useRouter();
  const [recording, setRecording] = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [amount, setAmount] = useState(String(monthlyRent));
  const [method, setMethod] = useState("CASH");

  async function recordPayment() {
    setRecording(true);
    try {
      const res = await fetch("/api/manage/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, amount, method, forMonth, type: "RENT" }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      toast.success(`₹${amount} payment record ho gaya!`);
      setShowPayModal(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setRecording(false);
    }
  }

  async function markVacated() {
    if (!confirm("Is tenant ko vacated mark karna chahte hain?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/manage/tenants/${tenantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "VACATED", checkOutDate: new Date().toISOString() }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      toast.success("Tenant ko vacated mark kar diya");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="bg-white/60 backdrop-blur-md border border-neutral-200/60 rounded-2xl shadow-sm p-4 space-y-2">
        <button
          onClick={() => setShowPayModal(true)}
          id="record-payment-btn"
          className="btn-primary w-full text-[10px] uppercase tracking-wider font-black py-2.5"
        >
          <Receipt className="h-4 w-4" /> Record Rent Payment
        </button>
        <button
          onClick={markVacated}
          disabled={deleting}
          className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[10px] uppercase tracking-wider font-black text-red-600 bg-white/40 border border-red-200/60 hover:bg-red-50/80 transition-colors shadow-sm disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          {deleting ? "Processing…" : "Mark as Vacated"}
        </button>
      </div>

      {/* Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-xl p-4 sm:p-6 w-full max-w-sm">
            <h3 className="font-black text-[10px] text-neutral-900 uppercase tracking-wider mb-4">Record Payment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-neutral-600 uppercase tracking-wider mb-1">Amount (₹)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="input-base" />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-neutral-600 uppercase tracking-wider mb-1">Payment Method</label>
                <select value={method} onChange={e => setMethod(e.target.value)} className="input-base">
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="BANK">Bank Transfer</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowPayModal(false)} className="btn-outline flex-1 text-[10px] uppercase tracking-wider font-black py-2">Cancel</button>
              <button onClick={recordPayment} disabled={recording} className="btn-primary flex-1 text-[10px] uppercase tracking-wider font-black py-2 disabled:opacity-50">
                {recording ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
