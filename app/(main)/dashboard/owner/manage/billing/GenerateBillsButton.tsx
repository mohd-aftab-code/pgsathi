/**
 * app/(main)/dashboard/owner/manage/billing/GenerateBillsButton.tsx
 * Client button to trigger auto-generation of bills.
 */
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Play } from "lucide-react";

export function GenerateBillsButton({ currentMonth }: { currentMonth: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!confirm(`Are you sure you want to generate bills for ${currentMonth} for all active tenants?`)) return;
    setLoading(true);
    try {
      const res = await fetch("/api/manage/billing/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: currentMonth }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      toast.success(`${d.created} bills generated, ${d.skipped} already existed.`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={generate} disabled={loading} className="btn-primary text-sm">
      <Play className="h-4 w-4" />
      {loading ? "Generating…" : "Generate Bills"}
    </button>
  );
}
