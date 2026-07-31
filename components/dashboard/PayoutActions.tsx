"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X, CheckCircle2, Undo2, Layers } from "lucide-react";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/**
 * Finish or undo one payout.
 *
 * A payout is created PROCESSING because the transfer happens in a bank app,
 * outside this system — claiming "paid" at creation time asserted something the
 * system could not know. `complete` demands a UTR, which is the only thing that
 * makes the payout reconcilable against a bank statement.
 *
 * `reverse` exists because earnings are terminal once PAID: a transfer that
 * failed cannot be fixed by editing them, only by reversing the payout that
 * swallowed them.
 */
export function PayoutRowActions({
  payoutId,
  status,
  amount,
}: {
  payoutId: number;
  status: string;
  amount: number;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<null | "complete" | "reverse">(null);
  const [reference, setReference] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/partner-payouts/${payoutId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "complete"
            ? { action: "complete", reference, proofUrl: proofUrl || null }
            : { action: "reverse", reason },
        ),
      });
      const d = await res.json();
      if (!d.success) { setError(d.message || "Action failed"); return; }
      setMode(null);
      router.refresh();
    } catch {
      setError("Kuch galat ho gaya");
    } finally {
      setBusy(false);
    }
  };

  if (status === "COMPLETED") {
    return (
      <button
        onClick={() => setMode("reverse")}
        className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-bold text-neutral-500 hover:bg-neutral-100"
        title="Transfer fail hua? Reverse karein"
      >
        <Undo2 size={13} /> Reverse
      </button>
    );
  }

  if (status !== "PROCESSING") {
    return <span className="text-xs text-neutral-400">—</span>;
  }

  return (
    <>
      <div className="flex items-center gap-1.5 justify-end">
        <button
          onClick={() => setMode("complete")}
          className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-bold bg-green-50 text-green-700 hover:bg-green-100"
        >
          <CheckCircle2 size={13} /> UTR daalein
        </button>
        <button
          onClick={() => setMode("reverse")}
          className="inline-flex items-center gap-1 h-8 px-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50"
          title="Transfer nahi ho paya"
        >
          <Undo2 size={13} />
        </button>
      </div>

      {mode && (
        <Modal
          title={mode === "complete" ? "Transfer confirm karein" : "Payout reverse karein"}
          onClose={() => !busy && setMode(null)}
        >
          <div className="rounded-xl bg-neutral-50 border border-neutral-200 px-4 py-3">
            <div className="text-xs text-neutral-500">Net amount</div>
            <div className="text-2xl font-extrabold text-neutral-900">{inr(amount)}</div>
          </div>

          {error && <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}

          {mode === "complete" ? (
            <>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  UTR / Reference <span className="text-red-500">*</span>
                </label>
                <input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. UTR123456789"
                  className="w-full h-11 px-3 rounded-xl border-2 border-neutral-200 text-sm"
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  Iske bina bank statement se milaan possible nahi — isliye mandatory hai.
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Receipt URL <span className="text-neutral-400 font-normal">(optional)</span>
                </label>
                <input
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  placeholder="screenshot ka link"
                  className="w-full h-11 px-3 rounded-xl border-2 border-neutral-200 text-sm"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                Reverse karne ki wajah <span className="text-red-500">*</span>
              </label>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. bank transfer fail ho gaya"
                className="w-full h-11 px-3 rounded-xl border-2 border-neutral-200 text-sm"
              />
              <p className="text-[11px] text-neutral-400 mt-1">
                Isme shamil saari earnings wapas APPROVED ho jayengi aur agle payout me aayengi.
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button onClick={() => setMode(null)} className="flex-1 h-11 rounded-xl border-2 border-neutral-200 font-bold text-sm text-neutral-700">
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={busy || (mode === "complete" ? !reference.trim() : reason.trim().length < 3)}
              className={`flex-1 h-11 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-1.5 disabled:opacity-50 ${
                mode === "complete" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {busy ? <Loader2 size={15} className="animate-spin" /> : null}
              {mode === "complete" ? "Complete karein" : "Reverse karein"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

/**
 * One click for the whole monthly cycle.
 *
 * Every partner who is skipped is listed with the reason — a bulk action that
 * silently drops people reads as "everyone got paid".
 */
export function BulkPayoutButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [method, setMethod] = useState("UPI");
  type BulkOutcome = { partnerId: number; name: string; ok: boolean; message: string; amount?: number };
  type Skipped = { partnerId: number; name: string; blocked: string };
  const [result, setResult] = useState<null | { results: BulkOutcome[]; skipped: Skipped[]; message: string }>(null);
  const [error, setError] = useState("");

  const run = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/partner-payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "bulk", method }),
      });
      const d = await res.json();
      if (!d.success) { setError(d.message || "Bulk payout failed"); return; }
      setResult({ results: d.data.results ?? [], skipped: d.data.skipped ?? [], message: d.message });
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
        onClick={() => { setOpen(true); setResult(null); setError(""); }}
        className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold"
      >
        <Layers size={15} /> Cycle payout chalayein
      </button>

      {open && (
        <Modal title="Bulk payout" onClose={() => !busy && setOpen(false)}>
          {error && <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}

          {!result ? (
            <>
              <p className="text-sm text-neutral-600">
                Har us partner ka payout banega jiska balance minimum se upar hai aur jinki KYC verified hai.
                Baaki skip honge — unki list neeche dikhegi.
              </p>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">Payment method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border-2 border-neutral-200 text-sm cursor-pointer"
                >
                  <option value="UPI">UPI</option>
                  <option value="BANK">Bank Transfer</option>
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setOpen(false)} className="flex-1 h-11 rounded-xl border-2 border-neutral-200 font-bold text-sm text-neutral-700">
                  Cancel
                </button>
                <button
                  onClick={run}
                  disabled={busy}
                  className="flex-1 h-11 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-1.5"
                >
                  {busy ? <><Loader2 size={15} className="animate-spin" /> Chal raha hai…</> : "Payouts banayein"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm font-bold text-green-800">
                {result.message}
              </div>

              {result.skipped.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-500 mb-2">
                    Skip hue ({result.skipped.length})
                  </p>
                  <ul className="space-y-1.5 max-h-52 overflow-y-auto">
                    {result.skipped.map((s) => (
                      <li key={s.partnerId} className="flex items-start justify-between gap-3 text-xs border-b border-neutral-100 pb-1.5">
                        <span className="font-semibold text-neutral-800">{s.name}</span>
                        <span className="text-amber-700 text-right">{s.blocked}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-[11px] text-neutral-400">
                Sab payouts abhi PROCESSING hain — transfer karke har ek ka UTR record karna baaki hai.
              </p>

              <button onClick={() => setOpen(false)} className="h-11 w-full rounded-xl bg-neutral-900 text-white font-bold text-sm">
                Theek hai
              </button>
            </>
          )}
        </Modal>
      )}
    </>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 sticky top-0 bg-white">
          <h3 className="font-bold text-neutral-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">{children}</div>
      </div>
    </div>
  );
}
