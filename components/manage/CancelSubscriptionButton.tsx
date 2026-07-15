"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export function CancelSubscriptionButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your active subscription? You will lose access to premium features immediately.")) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/subscription/cancel", {
        method: "POST",
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Failed to cancel");
      
      toast.success("Subscription cancelled successfully.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleCancel}
      disabled={loading}
      className="text-sm font-bold text-red-600 hover:text-red-700 w-full text-left py-2 border-t border-neutral-100 mt-2 disabled:opacity-50"
    >
      {loading ? "Cancelling..." : "Cancel Subscription"}
    </button>
  );
}
