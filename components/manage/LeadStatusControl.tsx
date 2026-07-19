"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StickyNote, CalendarClock, Check } from "lucide-react";
import toast from "react-hot-toast";

export const LEAD_STAGES = [
  { value: "NEW", label: "New", cls: "bg-orange-50 text-orange-700 border-orange-200" },
  { value: "CONTACTED", label: "Contacted", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "VISIT_SCHEDULED", label: "Visit set", cls: "bg-violet-50 text-violet-700 border-violet-200" },
  { value: "CONVERTED", label: "Converted", cls: "bg-green-50 text-green-700 border-green-200" },
  { value: "LOST", label: "Lost", cls: "bg-neutral-100 text-neutral-500 border-neutral-200" },
] as const;

export function LeadStatusControl({
  leadId,
  status,
  followUpAt,
  notes,
}: {
  leadId: number;
  status: string;
  followUpAt?: string | null;
  notes?: string | null;
}) {
  const router = useRouter();
  const [stage, setStage] = useState(status || "NEW");
  const [open, setOpen] = useState(false);
  const [follow, setFollow] = useState(followUpAt ? followUpAt.slice(0, 10) : "");
  const [note, setNote] = useState(notes || "");
  const [saving, setSaving] = useState(false);

  async function patch(payload: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch(`/api/manage/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message || "Failed to update");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  function onStageChange(next: string) {
    setStage(next);
    patch({ status: next });
  }

  async function saveDetails() {
    await patch({ followUpAt: follow || null, notes: note });
    setOpen(false);
    toast.success("Saved");
  }

  const cur = LEAD_STAGES.find((s) => s.value === stage) ?? LEAD_STAGES[0];
  const hasDetails = Boolean(follow || note);

  return (
    <div className="relative inline-flex items-center gap-1.5">
      <select
        value={stage}
        disabled={saving}
        onChange={(e) => onStageChange(e.target.value)}
        aria-label="Lead stage"
        className={`text-xs font-bold rounded-lg border px-2 py-1.5 cursor-pointer outline-none focus:ring-2 focus:ring-violet-500/30 disabled:opacity-60 ${cur.cls}`}
      >
        {LEAD_STAGES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Follow-up date & notes"
        className={`p-1.5 rounded-lg border transition-colors ${
          hasDetails
            ? "bg-violet-50 text-violet-700 border-violet-200"
            : "bg-white text-neutral-400 border-neutral-200 hover:text-neutral-600"
        }`}
      >
        <StickyNote size={13} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-30 w-64 bg-white rounded-xl border border-neutral-200 shadow-xl p-3 text-left">
            <label className="block text-[11px] font-bold uppercase tracking-wide text-neutral-500 mb-1 flex items-center gap-1">
              <CalendarClock size={12} /> Follow-up date
            </label>
            <input
              type="date"
              value={follow}
              onChange={(e) => setFollow(e.target.value)}
              className="w-full text-sm border border-neutral-200 rounded-lg px-2 py-1.5 mb-3 outline-none focus:border-violet-500"
            />
            <label className="block text-[11px] font-bold uppercase tracking-wide text-neutral-500 mb-1">Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Budget, move-in date, what they asked…"
              className="w-full text-sm border border-neutral-200 rounded-lg px-2 py-1.5 resize-none outline-none focus:border-violet-500"
            />
            <button
              type="button"
              onClick={saveDetails}
              disabled={saving}
              className="mt-2 w-full flex items-center justify-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold py-2 rounded-lg transition-colors disabled:opacity-60"
            >
              <Check size={13} /> {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
