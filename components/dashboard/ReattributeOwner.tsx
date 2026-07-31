"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Link2, X, AlertTriangle } from "lucide-react";

/**
 * Moves an owner from one partner to another.
 *
 * "First touch wins, never overwritten" stays the rule — this is the single
 * audited exception, so disputes stop being resolved by hand-written UPDATEs
 * against production.
 *
 * Only future commission moves. Approved and paid earnings stay with whoever
 * earned them at the time; rewriting those would desync money from the payouts
 * that already carried it.
 */
export function ReattributeOwner({
  ownerId,
  ownerName,
  currentPartner,
  partners,
}: {
  ownerId: number;
  ownerName: string;
  currentPartner: { id: number; label: string } | null;
  partners: { id: number; label: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [partnerId, setPartnerId] = useState("");
  const [reason, setReason] = useState("");
  const [movePending, setMovePending] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/attribution", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId,
          partnerId: partnerId === "" ? null : partnerId,
          reason,
          movePending,
        }),
      });
      const d = await res.json();
      if (!d.success) { setError(d.message || "Change nahi hua"); return; }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Kuch galat ho gaya");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={() => { setOpen(true); setPartnerId(""); setReason(""); setError(""); }}
        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-bold border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
      >
        <Link2 size={13} /> Attribution badlein
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4" onClick={() => !busy && setOpen(false)}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <h3 className="font-bold text-neutral-900">Owner attribution</h3>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100"><X size={16} /></button>
            </div>

            <div className="p-5 space-y-4">
              {error && <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}

              <div className="rounded-xl bg-neutral-50 border border-neutral-200 px-4 py-3 text-sm">
                <div className="font-bold text-neutral-900">{ownerName}</div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  Abhi: {currentPartner ? currentPartner.label : "koi partner nahi"}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">Naya partner</label>
                <select
                  value={partnerId}
                  onChange={(e) => setPartnerId(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border-2 border-neutral-200 text-sm cursor-pointer"
                >
                  <option value="">Koi nahi (attribution hatayein)</option>
                  {partners.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Wajah <span className="text-red-500">*</span>
                </label>
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. dispute — owner ne confirm kiya kaun laya tha"
                  className="w-full h-11 px-3 rounded-xl border-2 border-neutral-200 text-sm"
                />
                <p className="text-[11px] text-neutral-400 mt-1">Audit log me jayegi aur dono partners ko bhi bheji jayegi.</p>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={movePending}
                  onChange={(e) => setMovePending(e.target.checked)}
                  className="mt-0.5"
                />
                <span className="text-xs text-neutral-600">
                  Pending (abhi tak approve na hui) earnings bhi naye partner ko de dein
                </span>
              </label>

              <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5 text-xs text-amber-800">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <span>
                  Approved aur paid earnings nahi badlengi — wo jinhone kamayi thi unki hi rahengi.
                  Commission ka clock naye partner ke liye aaj se shuru hoga.
                </span>
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={() => setOpen(false)} className="flex-1 h-11 rounded-xl border-2 border-neutral-200 font-bold text-sm text-neutral-700">
                  Cancel
                </button>
                <button
                  onClick={submit}
                  disabled={busy || reason.trim().length < 3}
                  className="flex-1 h-11 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-1.5"
                >
                  {busy ? <Loader2 size={15} className="animate-spin" /> : null} Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
