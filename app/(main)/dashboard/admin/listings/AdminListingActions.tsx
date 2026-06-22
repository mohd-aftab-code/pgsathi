"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminListingActions({ listingId }: { listingId: number }) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const router = useRouter();

  const handleAction = async (action: "approve" | "reject") => {
    if (!confirm(`Are you sure you want to ${action} this listing?`)) return;
    
    setLoading(action);
    
    try {
      const res = await fetch("/api/admin/verify-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          status: action === "approve" ? "ACTIVE" : "REJECTED",
          isVerified: action === "approve"
        }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Action failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <button 
        onClick={() => handleAction("approve")}
        disabled={loading !== null}
        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
        title="Approve Listing"
      >
        {loading === "approve" ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
      </button>
      <button 
        onClick={() => handleAction("reject")}
        disabled={loading !== null}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        title="Reject Listing"
      >
        {loading === "reject" ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
      </button>
    </>
  );
}
