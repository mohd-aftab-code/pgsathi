"use client";

import { useState } from "react";
import { CheckCircle, Eye, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import AdminListingActions from "./AdminListingActions";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminListingsTableWrapper({ 
  listings, 
  currentTab 
}: { 
  listings: any[], 
  currentTab: string 
}) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const toggleSelectAll = () => {
    if (selectedIds.length === listings.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(listings.map(l => l.id));
    }
  };

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selId => selId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to soft delete ${selectedIds.length} selected listings?`)) return;
    
    setIsDeleting(true);
    const toastId = toast.loading(`Deleting ${selectedIds.length} listings...`);
    
    try {
      // Execute deletions in sequence to avoid rate limiting
      for (const id of selectedIds) {
        await fetch(`/api/listings/${id}`, { method: "DELETE" });
      }
      toast.success("Successfully deleted selected listings", { id: toastId });
      setSelectedIds([]);
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete some listings", { id: toastId });
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (listings.length === 0) {
    return (
      <div className="p-16 flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center mb-6 text-neutral-400 shadow-inner border border-neutral-100">
          <CheckCircle size={48} />
        </div>
        <h3 className="text-2xl font-extrabold text-neutral-900 mb-2">No Listings Found</h3>
        <p className="text-neutral-500 max-w-sm">There are no listings in the '{currentTab}' category.</p>
      </div>
    );
  }

  return (
    <>
      {selectedIds.length > 0 && (
        <div className="bg-red-50 border-b border-red-100 px-6 py-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-red-700">
            {selectedIds.length} listings selected
          </div>
          <button
            onClick={handleBulkDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Delete Selected
          </button>
        </div>
      )}

      <div className="overflow-x-auto hidden md:block">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50/80 border-b border-neutral-200 text-xs uppercase tracking-wider font-bold text-neutral-700">
              <th className="py-5 px-6 w-12">
                <input 
                  type="checkbox" 
                  className="rounded border-neutral-300 w-4 h-4 text-primary-600 focus:ring-primary-500 cursor-pointer"
                  checked={selectedIds.length === listings.length && listings.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="py-5 px-6">PG Details</th>
              <th className="py-5 px-6">Owner Info</th>
              <th className="py-5 px-6">Location</th>
              <th className="py-5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {listings.map((listing) => (
              <tr key={listing.id} className={`border-b border-neutral-100 transition-colors group ${selectedIds.includes(listing.id) ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-neutral-50'}`}>
                <td className="py-4 px-6">
                  <input 
                    type="checkbox" 
                    className="rounded border-neutral-300 w-4 h-4 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    checked={selectedIds.includes(listing.id)}
                    onChange={() => toggleSelect(listing.id)}
                  />
                </td>
                <td className="py-4 px-6">
                  <div className="font-extrabold text-neutral-900 mb-1 text-base">{listing.title}</div>
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-700">
                    <span className="bg-neutral-100 px-2 py-1 rounded-md border border-neutral-200">{listing.roomTypes?.map((r: string) => r.replace("_", " ")).join(", ")}</span>
                    <span className="bg-neutral-100 px-2 py-1 rounded-md border border-neutral-200">{listing.genderAllowed}</span>
                    <span className="text-primary-700 font-bold">₹{listing.priceMin}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                      {listing.owner?.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <div className="font-bold text-neutral-900">{listing.owner?.name || "Unknown"}</div>
                      <div className="text-xs text-neutral-500">{listing.owner?.phone || "No phone"}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-neutral-600 font-medium">
                  {[listing.locality?.name, listing.city?.name].filter(Boolean).join(", ")}
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    <Link 
                      href={`/pg/${listing.slug}`} 
                      target="_blank"
                      className="cursor-pointer p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" 
                      title="Preview"
                    >
                      <Eye size={18} />
                    </Link>
                    <AdminListingActions listingId={listing.id} currentStatus={listing.status} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
        {listings.map((listing) => (
          <div key={`mob-${listing.id}`} className={`bg-white border ${selectedIds.includes(listing.id) ? 'border-red-300 ring-2 ring-red-100' : 'border-neutral-100'} rounded-xl p-4 shadow-sm flex flex-col gap-3 relative`}>
            <div className="absolute top-4 right-4 z-10">
              <input 
                type="checkbox" 
                className="rounded border-neutral-300 w-5 h-5 text-primary-600 focus:ring-primary-500 cursor-pointer"
                checked={selectedIds.includes(listing.id)}
                onChange={() => toggleSelect(listing.id)}
              />
            </div>
            <div className="pr-8">
              <div className="font-extrabold text-neutral-900 mb-1 text-base">{listing.title}</div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-neutral-700">
                <span className="bg-neutral-100 px-2 py-1 rounded-md border border-neutral-200">{listing.roomTypes?.map((r: string) => r.replace("_", " ")).join(", ")}</span>
                <span className="bg-neutral-100 px-2 py-1 rounded-md border border-neutral-200">{listing.genderAllowed}</span>
                <span className="text-primary-700 font-bold">₹{listing.priceMin}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 py-2 border-y border-neutral-50">
              <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs">
                {listing.owner?.name?.charAt(0) || "U"}
              </div>
              <div>
                <div className="font-bold text-neutral-900 text-sm">{listing.owner?.name || "Unknown"}</div>
                <div className="text-xs text-neutral-500">{listing.owner?.phone || "No phone"}</div>
              </div>
            </div>
            <div className="text-sm text-neutral-600 font-medium">
              {[listing.locality?.name, listing.city?.name].filter(Boolean).join(", ")}
            </div>
            <div className="flex items-center justify-end gap-2 mt-2">
              <Link 
                href={`/pg/${listing.slug}`} 
                target="_blank"
                className="cursor-pointer p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" 
                title="Preview"
              >
                <Eye size={18} />
              </Link>
              <AdminListingActions listingId={listing.id} currentStatus={listing.status} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
