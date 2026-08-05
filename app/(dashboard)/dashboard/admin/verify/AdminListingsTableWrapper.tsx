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
      <div className="p-16 flex flex-col items-center text-center bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm mt-4">
        <div className="w-24 h-24 bg-white/80 rounded-full flex items-center justify-center mb-6 text-neutral-400 shadow-sm border border-neutral-200/60">
          <CheckCircle size={48} />
        </div>
        <h3 className="text-2xl font-black text-neutral-900 mb-2 uppercase tracking-tight">No Listings Found</h3>
        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider max-w-sm">There are no listings in the '{currentTab}' category.</p>
      </div>
    );
  }

  return (
    <>
      {selectedIds.length > 0 && (
        <div className="bg-red-50/80 backdrop-blur-md border-b border-red-200/60 px-6 py-3 flex items-center justify-between">
          <div className="text-[10px] font-black uppercase tracking-wider text-red-700">
            {selectedIds.length} listings selected
          </div>
          <button
            onClick={handleBulkDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider font-black transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Delete Selected
          </button>
        </div>
      )}

      <div className="overflow-x-auto hidden md:block">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-white/40 border-b border-neutral-200/60 text-[9px] uppercase tracking-wider font-bold text-neutral-500">
              <th className="py-2 px-4 w-10">
                <input 
                  type="checkbox" 
                  className="rounded border-neutral-300 w-3 h-3 text-violet-600 focus:ring-violet-500 cursor-pointer"
                  checked={selectedIds.length === listings.length && listings.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="py-2 px-4">PG Details</th>
              <th className="py-2 px-4">Owner Info</th>
              <th className="py-2 px-4">Location</th>
              <th className="py-2 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[11px] divide-y divide-neutral-200/60 bg-white/60">
            {listings.map((listing) => (
              <tr key={listing.id} className={`transition-colors group ${selectedIds.includes(listing.id) ? 'bg-red-50/50 hover:bg-red-50/80' : 'hover:bg-white/80'}`}>
                <td className="py-2 px-4">
                  <input 
                    type="checkbox" 
                    className="rounded border-neutral-300 w-3 h-3 text-violet-600 focus:ring-violet-500 cursor-pointer"
                    checked={selectedIds.includes(listing.id)}
                    onChange={() => toggleSelect(listing.id)}
                  />
                </td>
                <td className="py-2 px-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="font-black text-neutral-900 text-xs tracking-tight uppercase">{listing.title}</div>
                    {listing.hasPendingChanges && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 border border-amber-200 px-1 py-0.5 rounded" title="Owner updated this listing after it was verified">
                        Updated
                      </span>
                    )}
                    {/* Partner-sourced PGs earn the partner a commission once the
                        owner goes paid — the admin should see that before approving. */}
                    {listing.partner && (
                      <Link
                        href={`/dashboard/admin/partners/${listing.partner.id}`}
                        className="text-[9px] font-black uppercase tracking-wider text-violet-700 bg-violet-100/80 border border-violet-200/60 px-1.5 py-0.5 rounded shadow-sm hover:bg-violet-200 transition-colors"
                        title={`Registered by partner ${listing.partner.user?.name ?? ""} (${listing.partner.partnerCode})`}
                      >
                        Partner · {listing.partner.partnerCode}
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-neutral-600">
                    <span className="bg-white/60 px-1.5 py-0.5 rounded border border-neutral-200/60 shadow-sm">{listing.roomTypes?.map((r: string) => r.replace("_", " ")).join(", ")}</span>
                    <span className="bg-white/60 px-1.5 py-0.5 rounded border border-neutral-200/60 shadow-sm">{listing.genderAllowed}</span>
                    <span className="text-emerald-700 font-black px-1.5 py-0.5">₹{listing.priceMin}</span>
                  </div>
                </td>
                <td className="py-2 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-violet-100/80 border border-violet-200/60 text-violet-700 rounded-full flex items-center justify-center font-black text-[10px] shadow-sm">
                      {listing.owner?.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <div className="font-black text-neutral-900 tracking-tight">{listing.owner?.name || "Unknown"}</div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">{listing.owner?.phone || "No phone"}</div>
                    </div>
                  </div>
                </td>
                <td className="py-2 px-4 text-[9px] font-bold uppercase tracking-wider text-neutral-600">
                  {[listing.locality?.name, listing.city?.name].filter(Boolean).join(", ")}
                </td>
                <td className="py-2 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
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
          <div key={`mob-${listing.id}`} className={`bg-white/60 backdrop-blur-md border ${selectedIds.includes(listing.id) ? 'border-red-300 ring-2 ring-red-100' : 'border-neutral-200/60'} rounded-2xl p-4 shadow-sm flex flex-col gap-3 relative`}>
            <div className="absolute top-4 right-4 z-10">
              <input 
                type="checkbox" 
                className="rounded border-neutral-300 w-5 h-5 text-primary-600 focus:ring-primary-500 cursor-pointer"
                checked={selectedIds.includes(listing.id)}
                onChange={() => toggleSelect(listing.id)}
              />
            </div>
            <div className="pr-8">
              <div className="flex items-center gap-2 mb-1">
                <div className="font-black text-neutral-900 text-base uppercase tracking-tight">{listing.title}</div>
                {listing.hasPendingChanges && (
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded shadow-sm">
                    Updated
                  </span>
                )}
                {listing.partner && (
                  <Link
                    href={`/dashboard/admin/partners/${listing.partner.id}`}
                    className="text-[9px] font-black uppercase tracking-wider text-violet-700 bg-violet-100/80 border border-violet-200/60 px-1.5 py-0.5 rounded shadow-sm"
                  >
                    Partner · {listing.partner.partnerCode}
                  </Link>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-neutral-700 mt-1">
                <span className="bg-white/60 px-2 py-1 rounded-md border border-neutral-200/60 shadow-sm">{listing.roomTypes?.map((r: string) => r.replace("_", " ")).join(", ")}</span>
                <span className="bg-white/60 px-2 py-1 rounded-md border border-neutral-200/60 shadow-sm">{listing.genderAllowed}</span>
                <span className="text-emerald-700 font-black">₹{listing.priceMin}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 py-2 border-y border-neutral-200/60">
              <div className="w-8 h-8 bg-violet-100/80 border border-violet-200/60 text-violet-700 rounded-full flex items-center justify-center font-black text-xs shadow-sm">
                {listing.owner?.name?.charAt(0) || "U"}
              </div>
              <div>
                <div className="font-black text-neutral-900 tracking-tight text-sm uppercase">{listing.owner?.name || "Unknown"}</div>
                <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-0.5">{listing.owner?.phone || "No phone"}</div>
              </div>
            </div>
            <div className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider">
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
