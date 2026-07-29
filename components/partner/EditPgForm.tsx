"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, X } from "lucide-react";

/**
 * Inline editor for the fields a partner is allowed to change on a PG.
 * The server route (PATCH /api/partner/pgs/[id]) is the real gate — it
 * re-checks ownership and the allow-list; this is just the UI.
 */
export function EditPgForm({
  id,
  initial,
}: {
  id: number;
  initial: { title: string; description: string; landmark: string; areaLocality: string; genderAllowed: string };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSaving(true);
    try {
      const res = await fetch(`/api/partner/pgs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!d.success) { setError(d.message || "Update failed"); setSaving(false); return; }
      setOpen(false);
      router.refresh();
    } catch { setError("Something went wrong"); } finally { setSaving(false); }
  }

  const inp = "w-full h-11 px-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none";
  const lbl = "block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5";

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">
        <Pencil size={14} /> Edit
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4" onClick={() => !saving && setOpen(false)}>
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="font-bold text-neutral-900 dark:text-white">Edit PG</h3>
          <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"><X size={16} /></button>
        </div>
        <form onSubmit={save} className="p-5 space-y-4">
          {error && <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-3 py-2 text-sm text-red-700 dark:text-red-300">{error}</div>}
          <div>
            <label className={lbl}>PG Name</label>
            <input className={inp} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className={lbl}>Description</label>
            <textarea rows={2} className={`${inp} h-auto py-2 resize-none`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Area</label>
              <input className={inp} value={form.areaLocality} onChange={(e) => setForm({ ...form, areaLocality: e.target.value })} />
            </div>
            <div>
              <label className={lbl}>Landmark</label>
              <input className={inp} value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} />
            </div>
          </div>
          <div>
            <label className={lbl}>For Whom</label>
            <div className="grid grid-cols-3 gap-2">
              {[["BOYS", "Boys"], ["GIRLS", "Girls"], ["COED", "Co-living"]].map(([v, l]) => (
                <button type="button" key={v} onClick={() => setForm({ ...form, genderAllowed: v })}
                  className={`h-10 rounded-xl border-2 text-sm font-semibold ${form.genderAllowed === v ? "border-primary-400 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300" : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setOpen(false)} className="flex-1 h-11 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 font-bold text-sm text-neutral-700 dark:text-neutral-300">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 h-11 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-1.5">
              {saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
