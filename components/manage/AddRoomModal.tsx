"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus, X } from "lucide-react";

interface Listing {
  id: number;
  title: string;
}

interface AddRoomModalProps {
  listings: Listing[];
  defaultListingId?: number;
}

export function AddRoomModal({ listings, defaultListingId }: AddRoomModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());

    try {
      const res = await fetch("/api/inventory/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to create room");
      
      toast.success("Room successfully added!");
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
      >
        <Plus size={16} />
        Add Room
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-neutral-100">
              <h3 className="font-bold text-lg">Add New Room</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Select Property *</label>
                <select name="listingId" required defaultValue={defaultListingId || ""} className="input-base">
                  <option value="" disabled>Select PG...</option>
                  {listings.map(l => (
                    <option key={l.id} value={l.id}>{l.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Room No/Name *</label>
                  <input name="name" required placeholder="e.g. 101" className="input-base" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Floor (Optional)</label>
                  <input name="floor" placeholder="e.g. Ground" className="input-base" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Room Type *</label>
                  <select name="type" required className="input-base">
                    <option value="SINGLE_ROOM">Single Room</option>
                    <option value="DOUBLE_SHARING">Double Sharing</option>
                    <option value="TRIPLE_SHARING">Triple Sharing</option>
                    <option value="DORMITORY">Dormitory</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Number of Beds *</label>
                  <input name="bedCount" type="number" min="1" max="10" required defaultValue="1" className="input-base" />
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="btn-ghost flex-1 py-2"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary flex-1 py-2"
                >
                  {loading ? "Saving..." : "Save Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
