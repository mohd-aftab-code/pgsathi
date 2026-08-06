"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Megaphone, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AnnouncementsPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", listingId: "" });

  useEffect(() => {
    fetchAnnouncements();
    // Fix: use /api/manage/listings (owner's own listings, not public API)
    fetch("/api/manage/listings")
      .then(r => {
        if (r.status === 401) { router.push("/login"); return null; }
        return r.json();
      })
      .then(d => { if (d) setListings(d.data || []); })
      .catch(() => {});
  }, []);

  async function fetchAnnouncements() {
    setLoading(true);
    try {
      const res = await fetch("/api/manage/announcements");
      if (res.status === 401) { router.push("/login"); return; }
      const d = await res.json();
      if (d.success) setAnnouncements(d.data);
    } finally {
      setLoading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.message) return;
    setSaving(true);
    try {
      const res = await fetch("/api/manage/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, listingId: form.listingId || null }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      toast.success("Announcement published!");
      setShowModal(false);
      setForm({ title: "", message: "", listingId: "" });
      fetchAnnouncements();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteAnn(id: number) {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const res = await fetch(`/api/manage/announcements?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Deleted successfully");
        fetchAnnouncements();
      }
    } catch (err) {
      toast.error("Failed to delete");
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 flex items-center gap-2">
            <Megaphone className="text-violet-600" size={24} /> Notices & Announcements
          </h1>
          <p className="text-sm text-neutral-500 mt-1">Publish notices for your tenants. They will see this on their portal.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary text-sm flex items-center gap-2">
          <Plus size={16} /> New Notice
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2].map(i => <div key={i} className="h-32 skeleton rounded-2xl" />)}
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-violet-100/80 rounded-full flex items-center justify-center mx-auto mb-4 border border-violet-200">
            <Megaphone className="text-violet-600" size={28} />
          </div>
          <h3 className="text-lg font-black text-neutral-900 mb-1">No Announcements Yet</h3>
          <p className="text-[11px] font-medium text-neutral-500 max-w-sm mx-auto">Click 'New Notice' to broadcast a message to your tenants (e.g. WiFi down, Maintenance tomorrow).</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {announcements.map(a => (
            <div key={a.id} className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm p-4 sm:p-5 flex flex-col group relative">
              <div className="flex items-start justify-between mb-3">
                <span className={`text-[9px] font-black tracking-wider px-2 py-0.5 rounded uppercase border ${a.listing ? "bg-blue-100/80 text-blue-800 border-blue-200/60" : "bg-violet-100/80 text-violet-800 border-violet-200/60"}`}>
                  {a.listing ? a.listing.title : "All PGs"}
                </span>
                <button onClick={() => deleteAnn(a.id)} className="text-neutral-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 p-1 bg-white/60 rounded-2xl hover:bg-red-50">
                  <Trash2 size={14} />
                </button>
              </div>
              <h3 className="font-black text-neutral-900 mb-2">{a.title}</h3>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-4 whitespace-pre-wrap flex-1">{a.message}</p>
              <div className="text-[10px] font-bold text-neutral-500 pt-3 border-t border-neutral-200/60 uppercase tracking-wider">
                Published on {new Date(a.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <form onSubmit={submit} className="bg-white/80 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-xl p-5 sm:p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-black text-neutral-900 uppercase tracking-tight">Broadcast Notice</h3>
            
            <div>
              <label className="block text-[10px] font-bold text-neutral-600 mb-1 uppercase tracking-wider">Target Audience</label>
              <select value={form.listingId} onChange={e => setForm({ ...form, listingId: e.target.value })} className="input-base">
                <option value="">All Tenants (All PGs)</option>
                {listings.map(l => <option key={l.id} value={l.id}>Only {l.title}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-600 mb-1 uppercase tracking-wider">Subject / Title *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-base" placeholder="e.g. Scheduled Power Cut Tomorrow" required />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-600 mb-1 uppercase tracking-wider">Message *</label>
              <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="input-base resize-none" rows={4} placeholder="Type your notice here..." required />
            </div>

            <div className="flex gap-3 pt-3">
              <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1 text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm">
                {saving ? "Publishing…" : "Publish Now"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
