"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2 } from "lucide-react";

/**
 * One-click KYC verify button for the payout cycle page.
 * Only shown when all documents are filled but kycVerifiedAt is still null.
 * Calls the same PATCH /api/admin/partners/[id] endpoint AdminPartnerControls uses.
 */
export function QuickKycVerifyButton({ partnerId }: { partnerId: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function verify() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/partners/${partnerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "kyc_verify" }),
      });
      const d = await res.json();
      if (!d.success) {
        setError(d.message || "Verify failed");
        return;
      }
      setDone(true);
      router.refresh();
    } catch {
      setError("Kuch galat ho gaya");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded-lg">
        <ShieldCheck size={11} /> Verified!
      </span>
    );
  }

  return (
    <div className="inline-flex flex-col items-end gap-0.5">
      <button
        onClick={verify}
        disabled={busy}
        className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold disabled:opacity-50 transition-colors"
        title="Sabhi documents fill hain — KYC verify karein taaki payout unlock ho"
      >
        {busy ? (
          <Loader2 size={11} className="animate-spin" />
        ) : (
          <ShieldCheck size={11} />
        )}
        {busy ? "Verifying…" : "KYC Verify ✓"}
      </button>
      {error && <span className="text-[10px] text-red-600">{error}</span>}
    </div>
  );
}
