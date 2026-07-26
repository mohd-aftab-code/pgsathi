import { auth } from "@/lib/auth";
import { db as prisma } from "@/lib/db";
import Link from "next/link";
import { Building2, BedDouble, Users, CheckCircle2, ArrowRight, PlusCircle, MapPin } from "lucide-react";

export const metadata = {
  title: "Bed Inventory Report - PGSathi",
};

export default async function InventoryPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const listings = await prisma.listing.findMany({
    where: { ownerId: parseInt(session.user.id) },
    orderBy: { createdAt: "desc" },
    include: {
      city: true,
      photos: { take: 1, orderBy: { sortOrder: "asc" } },
      rooms: {
        include: { beds: true }
      }
    }
  });

  const totalRooms = listings.reduce((s, l) => s + l.rooms.length, 0);
  const totalBeds = listings.reduce((s, l) => s + l.rooms.reduce((rs, r) => rs + r.beds.length, 0), 0);
  const occupiedBeds = listings.reduce((s, l) => s + l.rooms.reduce((rs, r) => rs + r.beds.filter(b => b.isOccupied).length, 0), 0);
  const occupancyPct = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Bed Inventory</h1>
          <p className="text-neutral-500 mt-1">
            Har property mein kitne bed khaali aur kitne bhare hain — ek nazar mein.
          </p>
          {/* This screen is read-only on purpose. Rooms and beds are created in PG
              Manager, where tenants are assigned to them, so there is only ever one
              place to enter the data. */}
          <p className="text-xs text-neutral-400 mt-1.5">
            Ye report hai. Room aur bed add karne ke liye{" "}
            <Link href="/dashboard/manager/rooms" className="font-bold text-primary-600 hover:underline">
              PG Manager → Rooms
            </Link>{" "}
            par jaayein.
          </p>
        </div>
        <Link
          href="/dashboard/owner/listings/new"
          className="bg-neutral-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          <PlusCircle size={20} /> Add New PG
        </Link>
      </div>

      {listings.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 mb-8">
          {[
            { label: "Properties", value: listings.length, icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Total Rooms", value: totalRooms, icon: BedDouble, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Occupied Beds", value: occupiedBeds, icon: Users, color: "text-red-600", bg: "bg-red-50" },
            { label: "Occupancy", value: `${occupancyPct}%`, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl md:rounded-3xl p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 border border-neutral-100 relative overflow-hidden group">
              <div className={`absolute -right-6 -top-6 w-24 h-24 ${stat.bg} rounded-full blur-3xl transition-transform duration-500 group-hover:scale-125 pointer-events-none hidden md:block`}></div>
              <div className="flex items-center justify-between mb-2 relative z-10">
                <span className="text-xs sm:text-sm font-bold text-neutral-500">{stat.label}</span>
                <div className={`w-9 h-9 sm:w-11 sm:h-11 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300`}>
                  <stat.icon size={18} />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-neutral-900 relative z-10">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {listings.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-50/50 pointer-events-none"></div>
          <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-500 shadow-inner relative z-10">
            <BedDouble size={40} />
          </div>
          <h3 className="text-2xl font-black text-neutral-900 mb-3 relative z-10">No listings yet</h3>
          <p className="text-neutral-500 mb-8 max-w-md mx-auto text-base font-medium relative z-10">You need to add a PG listing before you can manage its rooms and beds.</p>
          <Link
            href="/dashboard/owner/listings/new"
            className="bg-neutral-900 hover:bg-black text-white px-8 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 inline-flex items-center gap-2 relative z-10"
          >
            <PlusCircle size={20} /> Create Your First Listing
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {listings.map(listing => {
            const listingBeds = listing.rooms.reduce((s, r) => s + r.beds.length, 0);
            const listingOccupied = listing.rooms.reduce((s, r) => s + r.beds.filter(b => b.isOccupied).length, 0);
            const listingPct = listingBeds > 0 ? Math.round((listingOccupied / listingBeds) * 100) : 0;

            return (
              <Link
                key={listing.id}
                href={`/dashboard/manager/rooms?listingId=${listing.id}`}
                className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-primary-200 transition-all duration-300 group flex flex-col sm:flex-row sm:items-center gap-5"
              >
                <div className="w-full sm:w-20 h-32 sm:h-20 bg-neutral-100 rounded-xl overflow-hidden shrink-0 border border-neutral-200">
                  {listing.photos.length > 0 ? (
                    <img src={listing.photos[0].url} alt={listing.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                      <Building2 size={24} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-neutral-900 text-lg group-hover:text-primary-600 transition-colors truncate">{listing.title}</h3>
                  {listing.city?.name && (
                    <div className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                      <MapPin size={12} /> {listing.city.name}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs font-semibold text-neutral-600 bg-neutral-50 px-2.5 py-1 rounded-md border border-neutral-200">{listing.rooms.length} Rooms</span>
                    <span className="text-xs font-semibold text-neutral-600 bg-neutral-50 px-2.5 py-1 rounded-md border border-neutral-200">{listingBeds} Beds</span>
                    <span className="text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-100">{listingOccupied} Occupied</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:w-48 shrink-0">
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] font-bold text-neutral-400 mb-1 uppercase tracking-wider">
                      <span>Occupancy</span>
                      <span>{listingPct}%</span>
                    </div>
                    <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${listingPct > 85 ? "bg-red-500" : listingPct > 60 ? "bg-amber-500" : "bg-primary-500"}`}
                        style={{ width: `${listingPct}%` }}
                      />
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-neutral-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
