"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ReviewsToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);

  async function handleToggle() {
    const next = !enabled;
    setEnabled(next);
    setSaving(true);
    try {
      const res = await fetch("/api/owner/reviews-toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success(next ? "Reviews are now visible on your PGs" : "Reviews are now hidden on your PGs");
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
      className={`cursor-pointer relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${enabled ? "bg-primary-500" : "bg-neutral-300"}`}
      role="switch"
      aria-checked={enabled}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}
