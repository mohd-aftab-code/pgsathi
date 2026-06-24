"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Edit, Eye, Trash2, Zap, Loader2 } from "lucide-react";

interface ListingActionsProps {
  listingId: number;
  listingSlug: string;
  status: string;
}

export default function ListingActions({ listingId, listingSlug, status }: ListingActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Kya aap sach mein is listing ko delete karna chahte hain? Yeh action undo nahi ho sakta.")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        router.refresh(); // Re-fetch page data
      } else {
        alert(data.message || "Delete karne mein problem aayi.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      {status === "ACTIVE" && (
        <button className="bg-orange-50 hover:bg-orange-100 text-orange-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 border border-orange-200 cursor-pointer">
          <Zap size={14} /> Boost
        </button>
      )}
      <Link
        href={`/dashboard/owner/listings/${listingId}/edit`}
        className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 p-2 rounded-lg transition-colors border border-neutral-200"
        title="Edit Listing"
      >
        <Edit size={16} />
      </Link>
      <Link
        href={`/pg/${listingSlug}`}
        className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 p-2 rounded-lg transition-colors border border-neutral-200"
        title="View Listing"
      >
        <Eye size={16} />
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors cursor-pointer border border-red-100 disabled:opacity-50"
        title="Delete Listing"
      >
        {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
      </button>
    </div>
  );
}
