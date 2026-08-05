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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Bed Inventory</h1>
          <p className="text-neutral-500 text-xs font-medium mt-0.5">
            Har property mein kitne bed khaali aur kitne bhare hain — ek nazar mein.
          </p>
          <p className="text-[10px] text-neutral-400 mt-1 font-bold">
            Ye report hai. Room aur bed add karne ke liye{" "}
            <Link href="/dashboard/manager/rooms" className="text-violet-600 hover:text-violet-700 uppercase tracking-wider">
              PG Manager → Rooms
            </Link>{" "}
            par jaayein.
          </p>
        </div>
        <Link
          href="/dashboard/owner/listings/new"
          className="bg-violet-600 hover:bg-violet-700 text-white h-8 px-4 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-1.5 shrink-0"
        >
          <PlusCircle size={14} /> Add New PG
        </Link>
      </div>

      {listings.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Properties", value: listings.length, icon: Building2, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100/60" },
            { label: "Total Rooms", value: totalRooms, icon: BedDouble, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100/60" },
            { label: "Occupied Beds", value: occupiedBeds, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100/60" },
            { label: "Occupancy", value: `${occupancyPct}%`, icon: CheckCircle2, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100/60" },
          ].map((stat, i) => (
            <div key={i} className="bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-neutral-200/60 relative overflow-hidden group">
              <div className="flex items-center justify-between mb-2 relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">{stat.label}</span>
                <div className={`w-8 h-8 ${stat.bg} ${stat.color} border ${stat.border} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon size={14} />
                </div>
              </div>
              <p className="text-2xl font-black text-neutral-900 relative z-10 leading-none">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {listings.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-neutral-200/60 p-12 text-center">
          <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-4 text-violet-500 border border-violet-100/60">
            <BedDouble size={24} />
          </div>
          <h3 className="text-lg font-black text-neutral-900 mb-2">No listings yet</h3>
          <p className="text-neutral-500 mb-6 max-w-sm mx-auto text-xs font-medium">You need to add a PG listing before you can manage its rooms and beds.</p>
          <Link
            href="/dashboard/owner/listings/new"
            className="bg-violet-600 hover:bg-violet-700 text-white h-9 px-6 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-colors shadow-sm inline-flex items-center gap-2"
          >
            <PlusCircle size={14} /> Create Your First Listing
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {listings.map(listing => {
            const listingBeds = listing.rooms.reduce((s, r) => s + r.beds.length, 0);
            const listingOccupied = listing.rooms.reduce((s, r) => s + r.beds.filter(b => b.isOccupied).length, 0);
            const listingPct = listingBeds > 0 ? Math.round((listingOccupied / listingBeds) * 100) : 0;

            return (
              <Link
                key={listing.id}
                href={`/dashboard/manager/rooms?listingId=${listing.id}`}
                className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 p-4 shadow-sm hover:shadow-md hover:border-violet-300 transition-all duration-300 group flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="w-full sm:w-16 h-32 sm:h-16 bg-neutral-100 rounded-xl overflow-hidden shrink-0 border border-neutral-200">
                  {listing.photos.length > 0 ? (
                    <img src={listing.photos[0].url} alt={listing.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                      <Building2 size={20} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-neutral-900 text-sm group-hover:text-violet-700 transition-colors truncate">{listing.title}</h3>
                  {listing.city?.name && (
                    <div className="text-[10px] font-bold text-neutral-500 mt-0.5 flex items-center gap-1 uppercase tracking-wider">
                      <MapPin size={10} /> {listing.city.name}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-600 bg-white border border-neutral-200/80 px-2 py-0.5 rounded-md">{listing.rooms.length} Rooms</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-600 bg-white border border-neutral-200/80 px-2 py-0.5 rounded-md">{listingBeds} Beds</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">{listingOccupied} Occupied</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:w-40 shrink-0">
                  <div className="flex-1">
                    <div className="flex justify-between text-[9px] font-bold text-neutral-500 mb-1.5 uppercase tracking-wider">
                      <span>Occupancy</span>
                      <span className={listingPct > 85 ? "text-emerald-600" : listingPct > 60 ? "text-amber-600" : "text-violet-600"}>{listingPct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${listingPct > 85 ? "bg-emerald-500" : listingPct > 60 ? "bg-amber-500" : "bg-violet-500"}`}
                        style={{ width: `${listingPct}%` }}
                      />
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-neutral-300 group-hover:text-violet-600 group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
