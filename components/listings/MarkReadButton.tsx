"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck, Loader2 } from "lucide-react";

interface MarkReadButtonProps {
  leadId: number;
  isRead: boolean;
}

export default function MarkReadButton({ leadId, isRead }: MarkReadButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [read, setRead] = useState(isRead);

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: !read }),
      });
      const data = await res.json();
      if (data.success) {
        setRead(!read);
        router.refresh();
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  if (read) return null; // Already read — no button needed

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="inline-flex items-center gap-1.5 bg-neutral-50 hover:bg-green-50 text-neutral-500 hover:text-green-700 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors border border-neutral-200 hover:border-green-200 disabled:opacity-50"
      title="Mark as read"
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : <CheckCheck size={12} />}
      Mark Read
    </button>
  );
}
