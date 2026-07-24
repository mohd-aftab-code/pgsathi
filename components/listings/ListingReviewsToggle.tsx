"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import toast from "react-hot-toast";

export default function ListingReviewsToggle({ listingId, initialEnabled }: { listingId: number; initialEnabled: boolean }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);

  async function handleToggle() {
    const next = !enabled;
    setEnabled(next);
    setSaving(true);
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewsEnabled: next }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success(next ? "Reviews visible on this PG" : "Reviews hidden on this PG");
      router.refresh();
    } catch (err: any) {
      setEnabled(!next);
      toast.error(err.message ?? "Failed to update setting");
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={saving}
      title={enabled ? "Reviews are visible on this PG — click to hide" : "Reviews are hidden on this PG — click to show"}
      className={`cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors border disabled:opacity-50 ${
        enabled
          ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
          : "bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-neutral-200"
      }`}
    >
      <Star size={14} className={enabled ? "fill-amber-400 text-amber-400" : ""} />
      Reviews {enabled ? "On" : "Off"}
    </button>
  );
}
