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
      <div className="card p-4 space-y-2">
        <button
          onClick={() => setShowPayModal(true)}
          id="record-payment-btn"
          className="btn-primary w-full text-sm"
        >
          <Receipt className="h-4 w-4" /> Record Rent Payment
        </button>
        <button
          onClick={markVacated}
          disabled={deleting}
          className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition"
        >
          <Trash2 className="h-4 w-4" />
          {deleting ? "Processing…" : "Mark as Vacated"}
        </button>
      </div>

      {/* Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card p-4 sm:p-4 sm:p-6 w-full max-w-sm">
            <h3 className="font-bold text-neutral-900 mb-4">Record Payment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Amount (₹)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="input-base" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Payment Method</label>
                <select value={method} onChange={e => setMethod(e.target.value)} className="input-base">
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="BANK">Bank Transfer</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowPayModal(false)} className="btn-outline flex-1 text-sm">Cancel</button>
              <button onClick={recordPayment} disabled={recording} className="btn-primary flex-1 text-sm">
                {recording ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
