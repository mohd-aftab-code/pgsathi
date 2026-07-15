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
        className="cursor-pointer p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="Assign Owner & Send Invite"
      >
        <UserPlus size={18} />
      </button>

      {/* Edit Button */}
      <Link
        href={`/dashboard/owner/listings/${listingId}/edit`}
        className="cursor-pointer p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
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
            className="cursor-pointer p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
            title="Approve Listing"
          >
            {loading === "ACTIVE" ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
          </button>
          <button 
            onClick={() => handleStatusChange("REJECTED")}
            disabled={loading !== null}
            className="cursor-pointer p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50"
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
          className="cursor-pointer p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
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
          className="cursor-pointer p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
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
          className="cursor-pointer p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50"
          title="Soft Delete Listing"
        >
          {loading === "DELETE" ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
        </button>
      )}

      {/* Assign Owner Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
            <div className="p-4 sm:p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Assign Owner</h3>
              <p className="text-sm text-gray-500 mb-6">
                Enter the real owner's details. A new account will be created (if it doesn't exist) and an email with credentials will be sent.
              </p>
              
              <form onSubmit={handleAssignSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                  <input 
                    type="text" 
                    required 
                    value={assignForm.name}
                    onChange={e => setAssignForm({...assignForm, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="E.g. Rahul Sharma"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={assignForm.email}
                    onChange={e => setAssignForm({...assignForm, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="E.g. rahul@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    required 
                    pattern="[0-9]{10}"
                    value={assignForm.phone}
                    onChange={e => setAssignForm({...assignForm, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="10 digit mobile number"
                  />
                </div>
                
                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading === "ASSIGN"}
                    className="cursor-pointer px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors flex items-center gap-2"
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

