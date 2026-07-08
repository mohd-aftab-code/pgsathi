/**
 * app/(main)/dashboard/owner/manage/staff/page.tsx
 */
"use client";
import { useState, useEffect } from "react";
import { UserCheck, Plus, IndianRupee } from "lucide-react";
import { EmptyState } from "@/components/manage/EmptyState";
import { StatusBadge } from "@/components/manage/StatusBadge";
import toast from "react-hot-toast";

function formatINR(n: number) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n); }
function formatDate(d: string) { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }

const ROLES = ["MANAGER", "CLEANER", "COOK", "GUARD", "OTHER"];

export default function StaffPage() {
  const [staff, setStaff]       = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState<number | null>(null);
  const [saving, setSaving]     = useState(false);

  // New staff form
  const [form, setForm] = useState({ name: "", role: "CLEANER", phone: "", salary: "", joinDate: today(), email: "", password: "" });
  
  // Payout form
  const [payForm, setPayForm] = useState({ amount: "", forMonth: currentMonth(), method: "CASH", note: "" });

  async function fetchStaff() {
    setLoading(true);
    try {
      const res = await fetch("/api/manage/staff");
      const d   = await res.json();
      setStaff(d.data ?? []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { fetchStaff(); }, []);

  async function submitStaff(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);
    try {
      const res = await fetch("/api/manage/staff", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      toast.success("Staff member added!");
      setShowModal(false);
      setForm({ name: "", role: "CLEANER", phone: "", salary: "", joinDate: today(), email: "", password: "" });
      fetchStaff();
    } catch (err: any) { toast.error(err.message); } finally { setSaving(false); }
  }

  async function submitPayout(e: React.FormEvent) {
    e.preventDefault();
    if (!showPayModal || !payForm.amount) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/manage/staff/${showPayModal}/payout`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payForm)
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      toast.success("Salary recorded!");
      setShowPayModal(null);
      fetchStaff();
    } catch (err: any) { toast.error(err.message); } finally { setSaving(false); }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900">Staff Management</h1>
          <p className="text-sm text-neutral-500 mt-1">{staff.length} active staff members</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary text-sm">
          <Plus className="h-4 w-4" /> Add Staff
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-32 rounded-2xl skeleton" />)}</div>
      ) : staff.length === 0 ? (
        <div className="card">
          <EmptyState icon={UserCheck} title="Koi staff nahi" description="PG manage karne ke liye staff add karein." />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map(s => (
            <div key={s.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-neutral-900">{s.name}</h3>
                  <div className="text-sm text-neutral-500 mt-0.5">{s.role} · {s.phone || "No phone"}</div>
                </div>
                <StatusBadge status={s.active ? "ACTIVE" : "INACTIVE"} />
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between text-sm">
                <div>
                  <span className="text-xs text-neutral-400 block">Salary</span>
                  <strong className="text-neutral-900">{formatINR(s.salary)}</strong>
                </div>
                <button
                  onClick={() => {
                    setPayForm({ ...payForm, amount: String(s.salary) });
                    setShowPayModal(s.id);
                  }}
                  className="btn-outline px-3 py-1.5 text-xs text-green-700 border-green-200 hover:bg-green-50"
                >
                  <IndianRupee className="h-3.5 w-3.5" /> Pay Salary
                </button>
              </div>
              {s.payouts && s.payouts.length > 0 && (
                <div className="mt-3 text-xs text-neutral-500">
                  Last paid: {s.payouts[0].forMonth} ({formatINR(s.payouts[0].amount)})
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={submitStaff} className="card p-6 w-full max-w-sm">
            <h3 className="font-bold text-neutral-900 mb-4">Add Staff Member</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-base" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Role</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="input-base">
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Salary (₹)</label>
                  <input type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} className="input-base" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Phone</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-base" />
              </div>
              {form.role === "MANAGER" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Email (Login) *</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-base" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Password *</label>
                    <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input-base" required />
                  </div>
                </div>
              )}
            </div>
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1 text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm">{saving ? "Saving…" : "Add Staff"}</button>
            </div>
          </form>
        </div>
      )}

      {/* Pay Salary Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={submitPayout} className="card p-6 w-full max-w-sm">
            <h3 className="font-bold text-neutral-900 mb-4">Record Salary Payout</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Amount (₹) *</label>
                <input type="number" value={payForm.amount} onChange={e => setPayForm({ ...payForm, amount: e.target.value })} className="input-base" required min={1} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">For Month</label>
                  <input type="month" value={payForm.forMonth} onChange={e => setPayForm({ ...payForm, forMonth: e.target.value })} className="input-base" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Method</label>
                  <select value={payForm.method} onChange={e => setPayForm({ ...payForm, method: e.target.value })} className="input-base">
                    <option value="CASH">Cash</option><option value="UPI">UPI</option><option value="BANK">Bank</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => setShowPayModal(null)} className="btn-outline flex-1 text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm text-green-700 bg-green-100 hover:bg-green-200 border-transparent">
                {saving ? "Saving…" : "Record Payout"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function today() { return new Date().toISOString().slice(0, 10); }
function currentMonth() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; }
