"use client";
import { useState, useEffect } from "react";
import { Wrench, Plus, CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const CATEGORIES = [
  { value: "PLUMBING", label: "Plumbing (Pipe/Tap)" },
  { value: "ELECTRICAL", label: "Electrical (Light/Fan)" },
  { value: "CLEANING", label: "Cleaning" },
  { value: "WIFI", label: "WiFi / Internet" },
  { value: "FOOD", label: "Mess / Food" },
  { value: "OTHER", label: "Other" },
];

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: any }> = {
  OPEN:        { label: "Open",        cls: "bg-red-50 text-red-700 border-red-200",    icon: AlertCircle },
  IN_PROGRESS: { label: "In Progress", cls: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  RESOLVED:    { label: "Resolved",    cls: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 },
  CLOSED:      { label: "Closed",      cls: "bg-neutral-100 text-neutral-500 border-neutral-200", icon: CheckCircle2 },
};

export default function TenantComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [saving, setSaving]         = useState(false);
  const [form, setForm]             = useState({ title: "", description: "", category: "OTHER" });

  async function fetchComplaints() {
    setLoading(true);
    try {
      const res = await fetch("/api/tenant/complaints");
      const d   = await res.json();
      setComplaints(d.data ?? []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { fetchComplaints(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/tenant/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      toast.success("Complaint filed! Manager ko notification mil gaya.");
      setShowForm(false);
      setForm({ title: "", description: "", category: "OTHER" });
      fetchComplaints();
    } catch (err: any) {
      toast.error(err.message ?? "Kuch error aa gaya");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 pb-5 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Wrench className="text-violet-600" size={22} /> My Complaints
          </h1>
          <p className="text-sm text-neutral-500 mt-1">File a complaint and track its status in real-time.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm flex items-center gap-2">
          <Plus size={16} /> New Complaint
        </button>
      </div>

      {/* New Complaint Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <form onSubmit={submit} className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-neutral-900">File a New Complaint</h3>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Category</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="input-base"
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Subject / Title *</label>
              <input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="input-base"
                placeholder="e.g. AC is not working in Room 101"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Details (Optional)</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="input-base resize-none"
                rows={3}
                placeholder="Describe the issue in detail…"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1 text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm">
                {saving ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Submit Complaint"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-28 rounded-2xl skeleton" />)}
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-12 text-center">
          <Wrench size={36} className="mx-auto text-neutral-300 mb-3" />
          <h3 className="font-bold text-neutral-700 mb-1">No Complaints Filed</h3>
          <p className="text-sm text-neutral-500">Click "New Complaint" to report an issue in your PG.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map(c => {
            const cfg = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.OPEN;
            const Icon = cfg.icon;
            return (
              <div key={c.id} className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 flex items-start gap-4">
                <div className={`mt-0.5 p-2 rounded-lg border ${cfg.cls} shrink-0`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-neutral-900 line-clamp-1">{c.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wide shrink-0 ${cfg.cls}`}>
                      {cfg.label}
                    </span>
                  </div>
                  {c.description && (
                    <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{c.description}</p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-xs text-neutral-400">
                    <span className="font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded">{c.category}</span>
                    <span>{c.listing?.title}</span>
                    <span>{new Date(c.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
