"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Loader2, Edit, Trash2, Power, PowerOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminListingActions({ listingId, currentStatus }: { listingId: number, currentStatus: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleStatusChange = async (newStatus: "ACTIVE" | "INACTIVE" | "REJECTED") => {
    if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
    
    setLoading(newStatus);
    
    try {
      // We can use the generic PATCH endpoint since we are ADMIN
      const res = await fetch(`/api/admin/verify-listing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          status: newStatus,
          isVerified: newStatus === "ACTIVE"
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

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to soft delete this listing? It will become inactive.")) return;
    setLoading("DELETE");
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to delete.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      {/* Edit Button */}
      <Link
        href={`/dashboard/owner/listings/${listingId}/edit`}
        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
        title="Edit Listing (Admin Override)"
      >
        <Edit size={18} />
      </Link>

      {/* Approve / Reject for PENDING */}
      {currentStatus === "PENDING" && (
        <>
          <button 
            onClick={() => handleStatusChange("ACTIVE")}
            disabled={loading !== null}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
            title="Approve Listing"
          >
            {loading === "ACTIVE" ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
          </button>
          <button 
            onClick={() => handleStatusChange("REJECTED")}
            disabled={loading !== null}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Reject Listing"
          >
            {loading === "REJECTED" ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
          </button>
        </>
      )}

      {/* Deactivate for ACTIVE */}
      {currentStatus === "ACTIVE" && (
        <button 
          onClick={() => handleStatusChange("INACTIVE")}
          disabled={loading !== null}
          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
          title="Deactivate Listing"
        >
          {loading === "INACTIVE" ? <Loader2 size={18} className="animate-spin" /> : <PowerOff size={18} />}
        </button>
      )}

      {/* Activate for INACTIVE or REJECTED */}
      {(currentStatus === "INACTIVE" || currentStatus === "REJECTED") && (
        <button 
          onClick={() => handleStatusChange("ACTIVE")}
          disabled={loading !== null}
          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
          title="Activate Listing"
        >
          {loading === "ACTIVE" ? <Loader2 size={18} className="animate-spin" /> : <Power size={18} />}
        </button>
      )}

      {/* Delete Button */}
      {currentStatus !== "INACTIVE" && (
        <button 
          onClick={handleDelete}
          disabled={loading !== null}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          title="Soft Delete Listing"
        >
          {loading === "DELETE" ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
        </button>
      )}
    </>
  );
}
