"use client";
import { useState, useEffect } from "react";
import { Megaphone, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", listingId: "" });

  useEffect(() => {
    fetchAnnouncements();
    fetch("/api/listings")
      .then(r => r.json())
      .then(d => setListings(d.data || d.listings || []))
      .catch(() => {});
  }, []);

  async function fetchAnnouncements() {
    setLoading(true);
    try {
      const res = await fetch("/api/manage/announcements");
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
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Megaphone className="text-violet-400" size={28} />
          </div>
          <h3 className="font-bold text-neutral-700 mb-1">No Announcements Yet</h3>
          <p className="text-sm text-neutral-500 max-w-sm mx-auto">Click 'New Notice' to broadcast a message to your tenants (e.g. WiFi down, Maintenance tomorrow).</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {announcements.map(a => (
            <div key={a.id} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 flex flex-col group relative">
              <div className="flex items-start justify-between mb-3">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase border ${a.listing ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-violet-50 text-violet-700 border-violet-100"}`}>
                  {a.listing ? a.listing.title : "All PGs"}
                </span>
                <button onClick={() => deleteAnn(a.id)} className="text-neutral-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1">
                  <Trash2 size={16} />
                </button>
              </div>
              <h3 className="font-bold text-neutral-900 mb-2">{a.title}</h3>
              <p className="text-sm text-neutral-600 mb-4 whitespace-pre-wrap flex-1">{a.message}</p>
              <div className="text-xs text-neutral-400 pt-3 border-t border-neutral-100">
                Published on {new Date(a.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <form onSubmit={submit} className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-neutral-900">Broadcast Notice</h3>
            
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Target Audience</label>
              <select value={form.listingId} onChange={e => setForm({ ...form, listingId: e.target.value })} className="input-base">
                <option value="">All Tenants (All PGs)</option>
                {listings.map(l => <option key={l.id} value={l.id}>Only {l.title}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Subject / Title *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-base" placeholder="e.g. Scheduled Power Cut Tomorrow" required />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Message *</label>
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
