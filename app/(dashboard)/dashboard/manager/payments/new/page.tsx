/**
 * app/(main)/dashboard/manager/payments/new/page.tsx
 * Record a new payment — client-side form.
 */
"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { Suspense } from "react";

function RecordPaymentForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const preselectedTenantId = sp.get("tenantId") ?? "";

  const [tenants, setTenants]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tenantId, setTenantId] = useState(preselectedTenantId);
  const [amount, setAmount]     = useState("");
  const [type, setType]         = useState("RENT");
  const [method, setMethod]     = useState("CASH");
  const [forMonth, setForMonth] = useState(currentMonth());
  const [paidOn, setPaidOn]     = useState(today());
  const [note, setNote]         = useState("");

  useEffect(() => {
    fetch("/api/manage/tenants?status=ACTIVE")
      .then(r => r.json())
      .then(d => {
        setTenants(d.data ?? []);
        if (preselectedTenantId) {
          const t = (d.data ?? []).find((t: any) => String(t.id) === preselectedTenantId);
          if (t) setAmount(String(t.monthlyRent));
        }
      });
  }, []);

  useEffect(() => {
    if (!tenantId || tenantId === preselectedTenantId) return;
    const t = tenants.find(t => String(t.id) === tenantId);
    if (t && type === "RENT") setAmount(String(t.monthlyRent));
  }, [tenantId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId) { toast.error("Tenant select karein"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/manage/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, amount, type, method, forMonth, paidOn, note }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      toast.success("Payment record ho gaya!");
      router.push("/dashboard/manager/payments");
    } catch (err: any) {
      toast.error(err.message ?? "Error aa gaya");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="card p-4 sm:p-4 sm:p-6 max-w-lg mx-auto">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">Tenant *</label>
            <select value={tenantId} onChange={e => setTenantId(e.target.value)} className="input-base" required>
              <option value="">Select tenant…</option>
              {tenants.map(t => <option key={t.id} value={t.id}>{t.name} ({t.phone})</option>)}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Payment Type</label>
              <select value={type} onChange={e => setType(e.target.value)} className="input-base">
                <option value="RENT">Rent</option>
                <option value="DEPOSIT">Security Deposit</option>
                <option value="ELECTRICITY">Electricity</option>
                <option value="LATE_FEE">Late Fee</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Amount (₹) *</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="input-base" required min={1} />
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
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">For Month</label>
              <input type="month" value={forMonth} onChange={e => setForMonth(e.target.value)} className="input-base" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Paid On</label>
              <input type="date" value={paidOn} onChange={e => setPaidOn(e.target.value)} className="input-base" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">Note (optional)</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} className="input-base" placeholder="e.g., UPI ref: 1234567" />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <Link href="/dashboard/manager/payments" className="btn-outline flex-1 text-sm text-center">Cancel</Link>
          <button type="submit" disabled={submitting} className="btn-primary flex-1 text-sm">
            {submitting ? "Saving…" : "Record Payment"}
          </button>
        </div>
      </div>
    </form>
  );
}

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function RecordPaymentPage() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard/manager/payments" className="grid h-9 w-9 place-items-center rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900">Record Payment</h1>
          <p className="text-sm text-neutral-500">Tenant ki payment manually record karein</p>
        </div>
      </div>
      <Suspense fallback={<div className="card p-4 sm:p-4 sm:p-6 text-center text-neutral-400">Loading…</div>}>
        <RecordPaymentForm />
      </Suspense>
    </div>
  );
}
