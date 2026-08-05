/**
 * app/(dashboard)/dashboard/manager/expenses/page.tsx
 */
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Receipt, Plus, TrendingDown } from "lucide-react";
import { EmptyState } from "@/components/manage/EmptyState";
import { StatusBadge } from "@/components/manage/StatusBadge";
import toast from "react-hot-toast";

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const CATEGORIES = ["MAINTENANCE", "SALARY", "GROCERY", "UTILITY", "WIFI", "REPAIRS", "OTHER"];

export default function ExpensesPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [form, setForm] = useState({ title: "", amount: "", category: "OTHER", spentOn: today(), note: "", listingId: "" });

  async function fetchExpenses() {
    setLoading(true);
    try {
      const res = await fetch("/api/manage/expenses");
      if (res.status === 401) { router.push("/login"); return; }
      const d   = await res.json();
      setExpenses(d.data ?? []);
      setTotal(d.totalAmount ?? 0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchExpenses();
    // Fetch owner's own listings for the property selector
    fetch("/api/manage/listings")
      .then(r => {
        if (r.status === 401) { router.push("/login"); return null; }
        return r.json();
      })
      .then(d => { if (d) setListings(d.data || []); })
      .catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.amount) return;
    setSaving(true);
    try {
      const res = await fetch("/api/manage/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      toast.success("Expense add ho gaya!");
      setShowModal(false);
      setForm({ title: "", amount: "", category: "OTHER", spentOn: today(), note: "", listingId: "" });
      fetchExpenses();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight uppercase">Expenses</h1>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-1">
            {expenses.length} records · Total: <strong className="text-red-600">{formatINR(total)}</strong>
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary text-sm">
          <Plus className="h-4 w-4" /> Add Expense
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl skeleton" />)}
        </div>
      ) : expenses.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden">
          <EmptyState icon={TrendingDown} title="Koi expense nahi" description="PG ke kharche yahan track karein." />
        </div>
      ) : (
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/40 border-b border-neutral-200/60">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-neutral-500">Title</th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-neutral-500 hidden sm:table-cell">Category</th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-neutral-500 hidden md:table-cell">Property</th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-neutral-500">Date</th>
                  <th className="px-4 py-3 text-right text-[10px] uppercase tracking-wider font-bold text-neutral-500">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/60">
                {expenses.map((e: any) => (
                  <tr key={e.id} className="hover:bg-white/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-xs font-black text-neutral-900">{e.title}</div>
                      {e.note && <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-0.5">{e.note}</div>}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="rounded bg-neutral-100/80 px-2 py-0.5 text-[9px] font-black tracking-wider uppercase text-neutral-600 border border-neutral-200/60">{e.category}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-[10px] font-bold text-neutral-500 uppercase tracking-wider">{e.listing?.title ?? "All PGs"}</td>
                    <td className="px-4 py-3 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">{formatDate(e.spentOn)}</td>
                    <td className="px-4 py-3 text-right text-xs font-black text-red-600">{formatINR(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <form onSubmit={submit} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-neutral-200/60 p-5 sm:p-6 w-full max-w-md">
            <h3 className="text-lg font-black text-neutral-900 uppercase tracking-tight mb-4">Add Expense</h3>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-wider mb-1">Title *</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-base" placeholder="e.g., Plumber ka paisa" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-wider mb-1">Property</label>
                  <select value={form.listingId} onChange={e => setForm({ ...form, listingId: e.target.value })} className="input-base">
                    <option value="">All PGs / General</option>
                    {listings.map(l => (
                      <option key={l.id} value={l.id}>{l.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-wider mb-1">Amount (₹) *</label>
                  <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="input-base" required min={1} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-wider mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-base">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-wider mb-1">Date</label>
                  <input type="date" value={form.spentOn} onChange={e => setForm({ ...form, spentOn: e.target.value })} className="input-base" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-wider mb-1">Note</label>
                <input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} className="input-base" />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1 text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm">
                {saving ? "Saving…" : "Add Expense"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function today() { return new Date().toISOString().slice(0, 10); }
