"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Edit, Eye, Trash2, Zap, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface ListingActionsProps {
  listingId: number;
  listingSlug: string;
  status: string;
}

export default function ListingActions({ listingId, listingSlug, status }: ListingActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Listing deleted successfully");
        router.refresh(); // Re-fetch page data
      } else {
        toast.error(data.message || "Problem occurred while deleting.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-1.5 sm:gap-2">
      {status === "ACTIVE" && (
        <button className="bg-orange-50 hover:bg-orange-100 text-orange-600 px-2.5 sm:px-3 h-9 sm:h-8 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 border border-orange-200 cursor-pointer active:scale-95">
          <Zap size={13} /> <span>Boost</span>
        </button>
      )}
      <Link
        href={`/dashboard/owner/listings/${listingId}/edit`}
        className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center bg-neutral-100/80 hover:bg-neutral-200 active:scale-95 text-neutral-700 rounded-xl transition-all border border-neutral-200/80 shrink-0"
        title="Edit Listing"
      >
        <Edit size={15} />
      </Link>
      <Link
        href={`/pg/${listingSlug}`}
        className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center bg-neutral-100/80 hover:bg-neutral-200 active:scale-95 text-neutral-700 rounded-xl transition-all border border-neutral-200/80 shrink-0"
        title="View Listing"
      >
        <Eye size={15} />
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 active:scale-95 text-red-600 rounded-xl transition-all cursor-pointer border border-red-200/80 disabled:opacity-50 shrink-0"
        title="Delete Listing"
      >
        {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
      </button>
    </div>
  );
}
