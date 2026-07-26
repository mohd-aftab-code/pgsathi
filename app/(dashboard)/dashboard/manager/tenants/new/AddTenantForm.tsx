/**
 * app/(main)/dashboard/manager/tenants/new/AddTenantForm.tsx
 * Client form for adding a new tenant.
 */
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Listing { id: number; title: string }
interface Prefill { name?: string; phone?: string; email?: string }

export function AddTenantForm({ listings, prefill = {} }: { listings: Listing[]; prefill?: Prefill }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  type RoomOpt = {
    id: number; name: string; listingId: number; floor: string | null;
    price: number; sharing: number; freeBeds: number; totalBeds: number;
  };
  const [rooms, setRooms] = useState<RoomOpt[]>([]);
  const [beds, setBeds] = useState<{ id: number; name: string; roomId: number; isOccupied: boolean }[]>([]);
  const [selectedListing, setSelectedListing] = useState("");
  const [selectedRoom, setSelectedRoom]       = useState("");
  // Rent is a controlled field so picking a room can fill it from the room's
  // preset price — while still leaving it editable for a one-off amount.
  const [rent, setRent] = useState("");
  const [rentFromRoom, setRentFromRoom] = useState(false);

  async function loadRooms(listingId: string) {
    setSelectedListing(listingId);
    setSelectedRoom("");
    setBeds([]);
    setRentFromRoom(false);
    if (!listingId) { setRooms([]); return; }
    const res = await fetch(`/api/rooms?listingId=${listingId}`);
    const d   = await res.json();
    setRooms(d.data ?? []);
  }

  async function loadBeds(roomId: string) {
    setSelectedRoom(roomId);
    if (!roomId) { setBeds([]); setRentFromRoom(false); return; }

    // Pre-fill rent from the room's set price. Only overwrite while the value is
    // still the one we filled in — a rent the user typed themselves is never
    // silently replaced.
    const room = rooms.find((r) => String(r.id) === roomId);
    if (room && room.price > 0 && (rent === "" || rentFromRoom)) {
      setRent(String(room.price));
      setRentFromRoom(true);
    }

    const res = await fetch(`/api/beds?roomId=${roomId}`);
    const d   = await res.json();
    setBeds((d.data ?? []).filter((b: any) => !b.isOccupied));
  }

  /** "Double Sharing" from a bed count — matches the Rooms screen's wording. */
  function sharingLabel(n: number): string {
    const names: Record<number, string> = { 1: "Single", 2: "Double", 3: "Triple", 4: "Four", 5: "Five", 6: "Six" };
    return n === 0 ? "No beds" : `${names[n] ?? n} Sharing`;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd   = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());

    try {
      const res = await fetch("/api/manage/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      toast.success("Tenant add ho gaya!");
      router.push(`/dashboard/manager/tenants/${d.data.id}`);
    } catch (err: any) {
      toast.error(err.message ?? "Kuch error aa gaya");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:gap-6 lg:grid-cols-3">
      {/* Left: Basic Info */}
      <div className="lg:col-span-2 space-y-4 sm:space-y-6">
        {/* Personal Details */}
        <div className="card p-4 sm:p-6">
          <h2 className="mb-4 font-bold text-neutral-900">Personal Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Full Name *</label>
              <input name="name" required className="input-base" placeholder="Rahul Sharma" defaultValue={prefill.name ?? ""} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Phone *</label>
              <input name="phone" required type="tel" className="input-base" placeholder="9876543210" defaultValue={prefill.phone ?? ""} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Email</label>
              <input name="email" type="email" className="input-base" placeholder="rahul@email.com" defaultValue={prefill.email ?? ""} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Gender</label>
              <select name="gender" className="input-base">
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* KYC */}
        <div className="card p-4 sm:p-6">
          <h2 className="mb-4 font-bold text-neutral-900">KYC Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">ID Type</label>
              <select name="idType" className="input-base">
                <option value="">Select…</option>
                <option value="AADHAAR">Aadhaar Card</option>
                <option value="PAN">PAN Card</option>
                <option value="VOTER_ID">Voter ID</option>
                <option value="PASSPORT">Passport</option>
                <option value="DL">Driving License</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">ID Number</label>
              <input name="idNumber" className="input-base" placeholder="XXXX XXXX XXXX" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Guardian Name</label>
              <input name="guardianName" className="input-base" placeholder="Father/Guardian ka naam" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Guardian Phone</label>
              <input name="guardianPhone" type="tel" className="input-base" placeholder="9876543210" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Permanent Address</label>
              <textarea name="permanentAddress" rows={2} className="input-base resize-none" placeholder="Ghar ka address…" />
            </div>
          </div>
        </div>

        {/* Rent & Stay */}
        <div className="card p-4 sm:p-6">
          <h2 className="mb-4 font-bold text-neutral-900">Rent & Stay</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Monthly Rent (₹)</label>
              <input
                name="monthlyRent"
                type="number"
                min="0"
                required
                className="input-base"
                placeholder="5000"
                value={rent}
                onChange={(e) => { setRent(e.target.value); setRentFromRoom(false); }}
              />
              {rentFromRoom ? (
                <p className="text-[11px] text-primary-600 mt-1 font-semibold">
                  Room ke set price se aaya — badalna ho to yahin edit kar dijiye.
                </p>
              ) : (
                selectedRoom && (
                  <p className="text-[11px] text-neutral-400 mt-1">Aapka apna amount — room ke price se alag.</p>
                )
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Security Deposit (₹)</label>
              <input name="securityDeposit" type="number" min="0" className="input-base" placeholder="10000" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Rent Due Day</label>
              <input name="rentDueDay" type="number" min="1" max="31" defaultValue={5} className="input-base" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Check-In Date</label>
              <input name="checkInDate" type="date" className="input-base" defaultValue={new Date().toISOString().slice(0,10)} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Notes</label>
              <textarea name="notes" rows={2} className="input-base resize-none" placeholder="Koi special note…" />
            </div>
          </div>
        </div>
      </div>

      {/* Right: PG Assignment */}
      <div className="space-y-4 sm:space-y-6">
        <div className="card p-4 sm:p-6">
          <h2 className="mb-4 font-bold text-neutral-900">PG Assignment</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">PG Property *</label>
              <select
                name="listingId" required value={selectedListing}
                onChange={(e) => loadRooms(e.target.value)}
                className="input-base"
              >
                <option value="">Select property…</option>
                {listings.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
              </select>
            </div>
            {selectedListing && rooms.length === 0 && (
              <div className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                Is PG mein koi Room add nahi kiya gaya hai. Pehle <strong>Rooms & Beds</strong> section mein jaakar naya room add karein.
              </div>
            )}
            
            {rooms.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Room *</label>
                <select
                  name="roomId" required value={selectedRoom}
                  onChange={(e) => loadBeds(e.target.value)}
                  className="input-base"
                >
                  <option value="">Select Room...</option>
                  {/* Sharing type and price come from how the room was set up in
                      Rooms, so the person adding a tenant picks by what the room
                      actually is rather than by number alone. */}
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id} disabled={r.freeBeds === 0}>
                      Room {r.name}
                      {r.floor ? ` (${r.floor})` : ""} · {sharingLabel(r.sharing)}
                      {r.price > 0 ? ` · ₹${r.price.toLocaleString("en-IN")}` : ""}
                      {r.freeBeds === 0 ? " · FULL" : ` · ${r.freeBeds} bed khaali`}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {selectedRoom && beds.length === 0 && (
              <div className="text-sm font-medium text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                Is Room me koi Bed khali nahi hai. Kripya dusra room chunein.
              </div>
            )}

            {beds.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Available Bed *</label>
                <select name="bedId" required className="input-base">
                  <option value="">Select Bed...</option>
                  {beds.map((b) => <option key={b.id} value={b.id}>Bed {b.name}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-primary-50 border border-primary-100 p-4">
          <p className="text-xs text-primary-700">
            💡 Tenant add karne ke baad aap unka rent record kar sakte hain, bills generate kar sakte hain, aur WhatsApp reminders bhej sakte hain.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !selectedListing || (!!selectedListing && rooms.length === 0) || (!!selectedRoom && beds.length === 0)}
          id="submit-add-tenant"
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving…" : "Add Tenant"}
        </button>
      </div>
    </form>
  );
}
