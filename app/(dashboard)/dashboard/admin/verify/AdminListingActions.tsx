"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Loader2, Edit, Trash2, Power, PowerOff, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AdminListingActions({ 
  listingId, 
  currentStatus,
  isMobile = false,
}: { 
  listingId: number; 
  currentStatus: string;
  isMobile?: boolean;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({ name: "", email: "", phone: "" });
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
        toast.success(`Listing status updated to ${newStatus}`);
        router.refresh();
      } else {
        const d = await res.json().catch(() => ({}));
        toast.error(d.message || "Action failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while updating status.");
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (isHard: boolean = false) => {
    const confirmMsg = isHard 
      ? "Are you sure you want to PERMANENTLY delete this listing? This action cannot be undone."
      : "Are you sure you want to soft delete this listing? It will become inactive.";
    
    if (!confirm(confirmMsg)) return;
    
    setLoading("DELETE");
    try {
      const res = await fetch(`/api/listings/${listingId}${isHard ? '?hard=true' : ''}`, {
        method: "DELETE"
      });
      if (res.ok) {
        toast.success(`Listing ${isHard ? 'permanently ' : ''}deleted successfully`);
        router.refresh();
      } else {
        const d = await res.json().catch(() => ({}));
        toast.error(d.message || `Failed to ${isHard ? 'permanently ' : ''}delete.`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete listing.");
    } finally {
      setLoading(null);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("ASSIGN");
    try {
      const res = await fetch(`/api/admin/assign-owner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          name: assignForm.name,
          email: assignForm.email,
          phone: assignForm.phone,
        }),
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Owner assigned successfully");
        setShowAssignModal(false);
        setAssignForm({ name: "", email: "", phone: "" });
        router.refresh();
      } else {
        toast.error(data.message || "Failed to assign owner");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while assigning owner.");
    } finally {
      setLoading(null);
    }
  };

  const renderAssignModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200/80 w-full max-w-md overflow-hidden relative">
        <div className="p-4 sm:p-6">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-1">Assign Owner</h3>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-5">
            Enter the real owner&apos;s details. A new account will be created (if it doesn&apos;t exist) and an email with credentials will be sent.
          </p>
          
          <form onSubmit={handleAssignSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Owner Name</label>
              <input 
                type="text" 
                required 
                value={assignForm.name}
                onChange={e => setAssignForm({...assignForm, name: e.target.value})}
                className="w-full px-3.5 py-2 border border-slate-200/80 rounded-lg bg-white focus:ring-1 focus:ring-violet-400 focus:border-violet-400 text-xs font-bold"
                placeholder="E.g. Rahul Sharma"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Email Address</label>
              <input 
                type="email" 
                required 
                value={assignForm.email}
                onChange={e => setAssignForm({...assignForm, email: e.target.value})}
                className="w-full px-3.5 py-2 border border-slate-200/80 rounded-lg bg-white focus:ring-1 focus:ring-violet-400 focus:border-violet-400 text-xs font-bold"
                placeholder="E.g. rahul@example.com"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Phone Number</label>
              <input 
                type="tel" 
                required 
                pattern="[0-9]{10}"
                value={assignForm.phone}
                onChange={e => setAssignForm({...assignForm, phone: e.target.value})}
                className="w-full px-3.5 py-2 border border-slate-200/80 rounded-lg bg-white focus:ring-1 focus:ring-violet-400 focus:border-violet-400 text-xs font-bold"
                placeholder="10 digit mobile number"
              />
            </div>
            
            <div className="flex items-center justify-end gap-2.5 pt-3">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="cursor-pointer px-4 py-2 text-xs uppercase tracking-wider font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading === "ASSIGN"}
                className="cursor-pointer px-4 py-2 text-xs uppercase tracking-wider font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
              >
                {loading === "ASSIGN" ? <Loader2 size={14} className="animate-spin" /> : null}
                {loading === "ASSIGN" ? "Assigning..." : "Assign & Invite"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="flex flex-col gap-2 w-full pt-2 border-t border-slate-100">
        {/* Primary Action Row for PENDING */}
        {currentStatus === "PENDING" && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleStatusChange("ACTIVE")}
              disabled={loading !== null}
              className="h-9 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading === "ACTIVE" ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              Approve
            </button>
            <button
              onClick={() => handleStatusChange("REJECTED")}
              disabled={loading !== null}
              className="h-9 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading === "REJECTED" ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
              Reject
            </button>
          </div>
        )}

        {/* Primary Action for ACTIVE */}
        {currentStatus === "ACTIVE" && (
          <button
            onClick={() => handleStatusChange("INACTIVE")}
            disabled={loading !== null}
            className="w-full h-9 px-3 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/80 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading === "INACTIVE" ? <Loader2 size={14} className="animate-spin" /> : <PowerOff size={14} />}
            Deactivate Listing
          </button>
        )}

        {/* Primary Action for INACTIVE or REJECTED */}
        {(currentStatus === "INACTIVE" || currentStatus === "REJECTED") && (
          <button
            onClick={() => handleStatusChange("ACTIVE")}
            disabled={loading !== null}
            className="w-full h-9 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading === "ACTIVE" ? <Loader2 size={14} className="animate-spin" /> : <Power size={14} />}
            Re-Activate Listing
          </button>
        )}

        {/* Secondary Tool Row */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowAssignModal(true)}
            className="flex-1 h-9 px-2 bg-blue-50/80 hover:bg-blue-100 text-blue-700 border border-blue-200/60 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 shadow-2xs transition-colors cursor-pointer"
          >
            <UserPlus size={13} /> Assign
          </button>
          <Link
            href={`/dashboard/owner/listings/${listingId}/edit`}
            className="flex-1 h-9 px-2 bg-violet-50/80 hover:bg-violet-100 text-violet-700 border border-violet-200/60 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 shadow-2xs transition-colors"
          >
            <Edit size={13} /> Edit
          </Link>
          <button
            onClick={() => handleDelete(currentStatus === "INACTIVE")}
            disabled={loading !== null}
            className="h-9 px-3 bg-rose-50/80 hover:bg-rose-100 text-rose-700 border border-rose-200/60 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 shadow-2xs transition-colors disabled:opacity-50 cursor-pointer shrink-0"
          >
            {loading === "DELETE" ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            {currentStatus === "INACTIVE" ? "Purge" : "Del"}
          </button>
        </div>

        {/* Assign Owner Modal */}
        {showAssignModal && renderAssignModal()}
      </div>
    );
  }

  return (
    <>
      {/* Assign Owner Button */}
      <button
        onClick={() => setShowAssignModal(true)}
        className="cursor-pointer p-2 text-blue-600 hover:bg-blue-50 bg-white shadow-2xs border border-slate-200/80 rounded-lg transition-colors"
        title="Assign Owner & Send Invite"
      >
        <UserPlus size={15} />
      </button>

      {/* Edit Button */}
      <Link
        href={`/dashboard/owner/listings/${listingId}/edit`}
        className="cursor-pointer p-2 text-violet-600 hover:bg-violet-50 bg-white shadow-2xs border border-slate-200/80 rounded-lg transition-colors"
        title="Edit Listing (Admin Override)"
      >
        <Edit size={15} />
      </Link>

      {/* Approve / Reject for PENDING */}
      {currentStatus === "PENDING" && (
        <>
          <button 
            onClick={() => handleStatusChange("ACTIVE")}
            disabled={loading !== null}
            className="cursor-pointer p-2 text-emerald-600 hover:bg-emerald-50 bg-white shadow-2xs border border-slate-200/80 rounded-lg transition-colors disabled:opacity-50"
            title="Approve Listing"
          >
            {loading === "ACTIVE" ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
          </button>
          <button 
            onClick={() => handleStatusChange("REJECTED")}
            disabled={loading !== null}
            className="cursor-pointer p-2 text-rose-600 hover:bg-rose-50 bg-white shadow-2xs border border-slate-200/80 rounded-lg transition-colors disabled:opacity-50"
            title="Reject Listing"
          >
            {loading === "REJECTED" ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
          </button>
        </>
      )}

      {/* Deactivate for ACTIVE */}
      {currentStatus === "ACTIVE" && (
        <button 
          onClick={() => handleStatusChange("INACTIVE")}
          disabled={loading !== null}
          className="cursor-pointer p-2 text-amber-600 hover:bg-amber-50 bg-white shadow-2xs border border-slate-200/80 rounded-lg transition-colors disabled:opacity-50"
          title="Deactivate Listing"
        >
          {loading === "INACTIVE" ? <Loader2 size={15} className="animate-spin" /> : <PowerOff size={15} />}
        </button>
      )}

      {/* Activate for INACTIVE or REJECTED */}
      {(currentStatus === "INACTIVE" || currentStatus === "REJECTED") && (
        <button 
          onClick={() => handleStatusChange("ACTIVE")}
          disabled={loading !== null}
          className="cursor-pointer p-2 text-emerald-600 hover:bg-emerald-50 bg-white shadow-2xs border border-slate-200/80 rounded-lg transition-colors disabled:opacity-50"
          title="Activate Listing"
        >
          {loading === "ACTIVE" ? <Loader2 size={15} className="animate-spin" /> : <Power size={15} />}
        </button>
      )}

      {/* Delete Button */}
      {currentStatus !== "INACTIVE" ? (
        <button 
          onClick={() => handleDelete(false)}
          disabled={loading !== null}
          className="cursor-pointer p-2 text-rose-600 hover:bg-rose-50 bg-white shadow-2xs border border-slate-200/80 rounded-lg transition-colors disabled:opacity-50"
          title="Soft Delete Listing"
        >
          {loading === "DELETE" ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
        </button>
      ) : (
        <button 
          onClick={() => handleDelete(true)}
          disabled={loading !== null}
          className="cursor-pointer p-2 text-white bg-rose-600 hover:bg-rose-700 shadow-2xs border border-rose-700/60 rounded-lg transition-colors disabled:opacity-50"
          title="Permanently Delete Listing"
        >
          {loading === "DELETE" ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
        </button>
      )}

      {/* Assign Owner Modal */}
      {showAssignModal && renderAssignModal()}
    </>
  );
}

