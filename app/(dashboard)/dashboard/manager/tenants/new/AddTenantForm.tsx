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
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm p-4 sm:p-6">
          <h2 className="mb-4 text-[10px] font-black text-neutral-900 uppercase tracking-wider">Personal Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-[9px] font-bold text-neutral-600 uppercase tracking-wider mb-1">Full Name *</label>
              <input name="name" required className="input-base" placeholder="Rahul Sharma" defaultValue={prefill.name ?? ""} />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-neutral-600 uppercase tracking-wider mb-1">Phone *</label>
              <input name="phone" required type="tel" className="input-base" placeholder="9876543210" defaultValue={prefill.phone ?? ""} />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-neutral-600 uppercase tracking-wider mb-1">Email</label>
              <input name="email" type="email" className="input-base" placeholder="rahul@email.com" defaultValue={prefill.email ?? ""} />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-neutral-600 uppercase tracking-wider mb-1">Gender</label>
              <select name="gender" className="input-base">
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Work / Education Verification */}
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm p-4 sm:p-6">
          <h2 className="mb-4 text-[10px] font-black text-neutral-900 uppercase tracking-wider flex items-center gap-2">
            🎓 Work &amp; Education Verification
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[9px] font-bold text-neutral-600 uppercase tracking-wider mb-1">Occupation Type</label>
              <select name="occupation" className="input-base" defaultValue="STUDENT">
                <option value="STUDENT">Student (College/School)</option>
                <option value="WORKING_PROFESSIONAL">Working Professional (Job/IT)</option>
                <option value="SELF_EMPLOYED">Self Employed / Business</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-bold text-neutral-600 uppercase tracking-wider mb-1">Company / Institute Name</label>
              <input name="workplace" className="input-base" placeholder="e.g. TCS / Christ University" />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-neutral-600 uppercase tracking-wider mb-1">Employee / Student Roll ID</label>
              <input name="workplaceId" className="input-base" placeholder="e.g. EMP-99812 / 21BC045" />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-neutral-600 uppercase tracking-wider mb-1">Blood Group</label>
              <select name="bloodGroup" className="input-base">
                <option value="">Select Blood Group...</option>
                <option value="A+">A+</option>
                <option value="B+">B+</option>
                <option value="O+">O+</option>
                <option value="AB+">AB+</option>
                <option value="A-">A-</option>
                <option value="B-">B-</option>
                <option value="O-">O-</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[9px] font-bold text-neutral-600 uppercase tracking-wider mb-1">Office / College Address</label>
              <input name="workplaceAddress" className="input-base" placeholder="e.g. Manyata Tech Park, Nagavara, Bangalore" />
            </div>
          </div>
        </div>

        {/* KYC & Verification Details */}
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm p-4 sm:p-6">
          <h2 className="mb-4 text-[10px] font-black text-neutral-900 uppercase tracking-wider flex items-center gap-2">
            📄 KYC &amp; Police Verification
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[9px] font-bold text-neutral-600 uppercase tracking-wider mb-1">ID Type</label>
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
              <label className="block text-[9px] font-bold text-neutral-600 uppercase tracking-wider mb-1">ID Number</label>
              <input name="idNumber" className="input-base" placeholder="XXXX XXXX XXXX" />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-neutral-600 uppercase tracking-wider mb-1">Police Verification Status</label>
              <select name="policeVerificationStatus" className="input-base" defaultValue="NOT_SUBMITTED">
                <option value="NOT_SUBMITTED">Not Submitted Yet</option>
                <option value="PENDING">Form Submitted (Under Process)</option>
                <option value="VERIFIED">Verified by Police Station</option>
                <option value="REJECTED">Rejected / Resubmit Required</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-bold text-neutral-600 uppercase tracking-wider mb-1">Police Ack / Token Ref No.</label>
              <input name="policeVerificationRef" className="input-base" placeholder="e.g. PV-BLR-2026-9812" />
            </div>
          </div>
        </div>

        {/* Guardian & Emergency Contacts */}
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm p-4 sm:p-6">
          <h2 className="mb-4 text-[10px] font-black text-neutral-900 uppercase tracking-wider flex items-center gap-2">
            📞 Guardian &amp; Emergency Contacts
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[9px] font-bold text-neutral-600 uppercase tracking-wider mb-1">Guardian / Parent Name</label>
              <input name="guardianName" className="input-base" placeholder="Father/Guardian ka naam" />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-neutral-600 uppercase tracking-wider mb-1">Guardian Phone</label>
              <input name="guardianPhone" type="tel" className="input-base" placeholder="9876543210" />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-neutral-600 uppercase tracking-wider mb-1">Relation</label>
              <select name="guardianRelation" className="input-base" defaultValue="FATHER">
                <option value="FATHER">Father</option>
                <option value="MOTHER">Mother</option>
                <option value="SPOUSE">Spouse</option>
                <option value="BROTHER">Brother / Sister</option>
                <option value="RELATIVE">Relative / Local Guardian</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-bold text-neutral-600 uppercase tracking-wider mb-1">Vehicle Type</label>
              <select name="vehicleType" className="input-base" defaultValue="NONE">
                <option value="NONE">No Vehicle</option>
                <option value="TWO_WHEELER">Two Wheeler (Bike / Scooter)</option>
                <option value="FOUR_WHEELER">Four Wheeler (Car)</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[9px] font-bold text-neutral-600 uppercase tracking-wider mb-1">Vehicle Registration Number</label>
              <input name="vehicleNumber" className="input-base" placeholder="e.g. KA 01 EV 1234 (Optional)" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[9px] font-bold text-neutral-600 uppercase tracking-wider mb-1">Permanent Home Address</label>
              <textarea name="permanentAddress" rows={2} className="input-base resize-none" placeholder="Ghar ka poora address…" />
            </div>
          </div>
        </div>

        {/* Rent & Stay */}
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm p-4 sm:p-6">
          <h2 className="mb-4 text-[10px] font-black text-neutral-900 uppercase tracking-wider">Rent & Stay</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[9px] font-bold text-neutral-600 uppercase tracking-wider mb-1">Monthly Rent (₹)</label>
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
              <label className="block text-[9px] font-bold text-neutral-600 uppercase tracking-wider mb-1">Security Deposit (₹)</label>
              <input name="securityDeposit" type="number" min="0" className="input-base" placeholder="10000" />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-neutral-600 uppercase tracking-wider mb-1">Rent Due Day</label>
              <input name="rentDueDay" type="number" min="1" max="31" defaultValue={5} className="input-base" />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-neutral-600 uppercase tracking-wider mb-1">Check-In Date</label>
              <input name="checkInDate" type="date" className="input-base" defaultValue={new Date().toISOString().slice(0,10)} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[9px] font-bold text-neutral-600 uppercase tracking-wider mb-1">Notes</label>
              <textarea name="notes" rows={2} className="input-base resize-none" placeholder="Koi special note…" />
            </div>
          </div>
        </div>
      </div>

      {/* Right: PG Assignment */}
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm p-4 sm:p-6">
          <h2 className="mb-4 text-[10px] font-black text-neutral-900 uppercase tracking-wider">PG Assignment</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[9px] font-bold text-neutral-600 uppercase tracking-wider mb-1">PG Property *</label>
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
              <div className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50/80 p-3 rounded-lg border border-red-200/60 shadow-sm">
                Is PG mein koi Room add nahi kiya gaya hai. Pehle <strong className="font-black">Rooms & Beds</strong> section mein jaakar naya room add karein.
              </div>
            )}
            
            {rooms.length > 0 && (
              <div>
                <label className="block text-[9px] font-bold text-neutral-600 uppercase tracking-wider mb-1">Room *</label>
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
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50/80 p-3 rounded-lg border border-amber-200/60 shadow-sm">
                Is Room me koi Bed khali nahi hai. Kripya dusra room chunein.
              </div>
            )}

            {beds.length > 0 && (
              <div>
                <label className="block text-[9px] font-bold text-neutral-600 uppercase tracking-wider mb-1">Available Bed *</label>
                <select name="bedId" required className="input-base">
                  <option value="">Select Bed...</option>
                  {beds.map((b) => <option key={b.id} value={b.id}>Bed {b.name}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-violet-50/80 border border-violet-200/60 p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-violet-700">
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
