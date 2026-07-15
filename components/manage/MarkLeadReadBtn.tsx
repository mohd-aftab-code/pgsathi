"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import toast from "react-hot-toast";

export function MarkLeadReadBtn({ leadId }: { leadId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleMarkRead() {
    setLoading(true);
    try {
      const res = await fetch(`/api/manage/leads/${leadId}`, {
        method: "PATCH",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || "Failed to mark as read");
      
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleMarkRead}
      disabled={loading}
      className="p-1.5 rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors"
      title="Mark as Read"
    >
      <Check size={14} />
    </button>
  );
}
