"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Loader2, Edit, Trash2, Power, PowerOff, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminListingActions({ listingId, currentStatus }: { listingId: number, currentStatus: string }) {
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
        router.refresh();
      } else {
        alert(`Failed to ${isHard ? 'permanently ' : ''}delete.`);
      }
    } catch (error) {
      console.error(error);
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
        alert(data.message);
        setShowAssignModal(false);
        setAssignForm({ name: "", email: "", phone: "" });
        router.refresh();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while assigning owner.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      {/* Assign Owner Button */}
      <button
        onClick={() => setShowAssignModal(true)}
        className="cursor-pointer p-2 text-blue-600 hover:bg-blue-100 bg-white/60 shadow-sm border border-neutral-200/60 rounded-xl transition-colors"
        title="Assign Owner & Send Invite"
      >
        <UserPlus size={16} />
      </button>

      {/* Edit Button */}
      <Link
        href={`/dashboard/owner/listings/${listingId}/edit`}
        className="cursor-pointer p-2 text-violet-600 hover:bg-violet-100 bg-white/60 shadow-sm border border-neutral-200/60 rounded-xl transition-colors"
        title="Edit Listing (Admin Override)"
      >
        <Edit size={16} />
      </Link>

      {/* Approve / Reject for PENDING */}
      {currentStatus === "PENDING" && (
        <>
          <button 
            onClick={() => handleStatusChange("ACTIVE")}
            disabled={loading !== null}
            className="cursor-pointer p-2 text-emerald-600 hover:bg-emerald-100 bg-white/60 shadow-sm border border-neutral-200/60 rounded-xl transition-colors disabled:opacity-50"
            title="Approve Listing"
          >
            {loading === "ACTIVE" ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
          </button>
          <button 
            onClick={() => handleStatusChange("REJECTED")}
            disabled={loading !== null}
            className="cursor-pointer p-2 text-red-600 hover:bg-red-100 bg-white/60 shadow-sm border border-neutral-200/60 rounded-xl transition-colors disabled:opacity-50"
            title="Reject Listing"
          >
            {loading === "REJECTED" ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
          </button>
        </>
      )}

      {/* Deactivate for ACTIVE */}
      {currentStatus === "ACTIVE" && (
        <button 
          onClick={() => handleStatusChange("INACTIVE")}
          disabled={loading !== null}
          className="cursor-pointer p-2 text-amber-600 hover:bg-amber-100 bg-white/60 shadow-sm border border-neutral-200/60 rounded-xl transition-colors disabled:opacity-50"
          title="Deactivate Listing"
        >
          {loading === "INACTIVE" ? <Loader2 size={16} className="animate-spin" /> : <PowerOff size={16} />}
        </button>
      )}

      {/* Activate for INACTIVE or REJECTED */}
      {(currentStatus === "INACTIVE" || currentStatus === "REJECTED") && (
        <button 
          onClick={() => handleStatusChange("ACTIVE")}
          disabled={loading !== null}
          className="cursor-pointer p-2 text-emerald-600 hover:bg-emerald-100 bg-white/60 shadow-sm border border-neutral-200/60 rounded-xl transition-colors disabled:opacity-50"
          title="Activate Listing"
        >
          {loading === "ACTIVE" ? <Loader2 size={16} className="animate-spin" /> : <Power size={16} />}
        </button>
      )}

      {/* Delete Button */}
      {currentStatus !== "INACTIVE" ? (
        <button 
          onClick={() => handleDelete(false)}
          disabled={loading !== null}
          className="cursor-pointer p-2 text-red-600 hover:bg-red-100 bg-white/60 shadow-sm border border-neutral-200/60 rounded-xl transition-colors disabled:opacity-50"
          title="Soft Delete Listing"
        >
          {loading === "DELETE" ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
      ) : (
        <button 
          onClick={() => handleDelete(true)}
          disabled={loading !== null}
          className="cursor-pointer p-2 text-white bg-red-600 hover:bg-red-700 shadow-sm border border-red-700/60 rounded-xl transition-colors disabled:opacity-50"
          title="Permanently Delete Listing"
        >
          {loading === "DELETE" ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
      )}

      {/* Assign Owner Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-neutral-200/60 w-full max-w-md overflow-hidden relative">
            <div className="p-4 sm:p-6">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-neutral-900 mb-2">Assign Owner</h3>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-6">
                Enter the real owner's details. A new account will be created (if it doesn't exist) and an email with credentials will be sent.
              </p>
              
              <form onSubmit={handleAssignSubmit} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-neutral-700 mb-1">Owner Name</label>
                  <input 
                    type="text" 
                    required 
                    value={assignForm.name}
                    onChange={e => setAssignForm({...assignForm, name: e.target.value})}
                    className="w-full px-4 py-2 border border-neutral-200/60 rounded-xl bg-white/60 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-xs font-black tracking-tight"
                    placeholder="E.g. Rahul Sharma"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-neutral-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={assignForm.email}
                    onChange={e => setAssignForm({...assignForm, email: e.target.value})}
                    className="w-full px-4 py-2 border border-neutral-200/60 rounded-xl bg-white/60 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-xs font-black tracking-tight"
                    placeholder="E.g. rahul@example.com"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-neutral-700 mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    required 
                    pattern="[0-9]{10}"
                    value={assignForm.phone}
                    onChange={e => setAssignForm({...assignForm, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-neutral-200/60 rounded-xl bg-white/60 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-xs font-black tracking-tight"
                    placeholder="10 digit mobile number"
                  />
                </div>
                
                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="cursor-pointer px-4 py-2 text-[10px] uppercase tracking-wider font-black text-neutral-700 bg-neutral-100/80 hover:bg-neutral-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading === "ASSIGN"}
                    className="cursor-pointer px-4 py-2 text-[10px] uppercase tracking-wider font-black text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {loading === "ASSIGN" ? <Loader2 size={16} className="animate-spin" /> : null}
                    {loading === "ASSIGN" ? "Assigning..." : "Assign & Invite"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

