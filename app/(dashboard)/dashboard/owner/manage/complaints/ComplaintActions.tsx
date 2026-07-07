/**
 * app/(main)/dashboard/owner/manage/complaints/ComplaintActions.tsx
 * Add complaint + quick status update buttons (client)
 */
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";

interface Listing { id: number; title: string }

export function ComplaintActions({ listings }: { listings: Listing[] }) {
  const router = useRouter();
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({ title: "", listingId: "", category: "OTHER", priority: "MEDIUM", description: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.listingId) { toast.error("Title aur property required hai"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/manage/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      toast.success("Complaint register ho gai!");
      setOpen(false);
      setForm({ title: "", listingId: "", category: "OTHER", priority: "MEDIUM", description: "" });
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary text-sm">
        <Plus className="h-4 w-4" /> Add Complaint
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={submit} className="card p-6 w-full max-w-md">
            <h3 className="font-bold text-neutral-900 mb-4">Log New Complaint</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-base" placeholder="e.g., Water leakage in bathroom" required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Property *</label>
                  <select value={form.listingId} onChange={e => setForm({ ...form, listingId: e.target.value })} className="input-base" required>
                    <option value="">Select…</option>
                    {listings.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-base">
                    <option value="PLUMBING">Plumbing</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="CLEANING">Cleaning</option>
                    <option value="WIFI">WiFi/Internet</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="input-base">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="input-base resize-none" />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => setOpen(false)} className="btn-outline flex-1 text-sm">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 text-sm">
                {loading ? "Logging…" : "Log Complaint"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
