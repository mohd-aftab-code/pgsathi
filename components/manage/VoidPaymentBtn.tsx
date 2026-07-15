"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

export function VoidPaymentBtn({ paymentId }: { paymentId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleVoid() {
    if (!confirm("Are you sure you want to void this payment? This action cannot be undone.")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/manage/payments/${paymentId}`, {
        method: "PATCH",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || "Failed to void payment");
      
      toast.success("Payment voided successfully");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleVoid}
      disabled={loading}
      className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      title="Void Payment"
    >
      <Trash2 size={16} />
    </button>
  );
}
