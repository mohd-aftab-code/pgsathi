/**
 * app/(main)/dashboard/manager/rooms/page.tsx
 * Visual Room/Bed Matrix — Premium Color-coded Grid
 */
import { BedDouble, AlertCircle, Users, CheckCircle } from "lucide-react";
import { db } from "@/lib/db";
import { requireManagerAccess, listingScope } from "@/lib/manager-auth";
import { EmptyState } from "@/components/manage/EmptyState";
import { AddRoomModal } from "@/components/manage/AddRoomModal";
import { DeleteRoomBtn } from "@/components/manage/DeleteRoomBtn";
import { PropertyFilterSelect } from "@/components/manage/PropertyFilterSelect";
import Link from "next/link";

export const metadata = { title: "Rooms & Beds — PG Manager" };

// A room with N beds is "N-sharing" — single (1), double (2), triple (3)…
function sharingLabel(n: number): string {
  if (n === 0) return "No beds yet";
  const names: Record<number, string> = { 1: "Single", 2: "Double", 3: "Triple", 4: "Four", 5: "Five", 6: "Six" };
  return `${names[n] ?? n} Sharing`;
}

function catStyle(n: number): string {
  const styles: Record<number, string> = {
    1: "bg-blue-50 text-blue-700 border-blue-200",
    2: "bg-violet-50 text-violet-700 border-violet-200",
    3: "bg-amber-50 text-amber-700 border-amber-200",
    4: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return styles[n] ?? "bg-neutral-100 text-neutral-600 border-neutral-200";
}

function RoomCard({ room }: { room: any }) {
  const roomVacant = room.beds.filter((b: any) => !b.isOccupied).length;
  const cleanRoomName = room.name.replace(/^Room\s+/i, "");

  return (
    <div className="rounded-2xl border border-neutral-200/60 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 bg-white/60 backdrop-blur-md">
      {/* Room header bar */}
      <div className={`px-4 py-3 flex justify-between items-center text-[10px] uppercase tracking-wider font-bold border-b ${
        roomVacant === 0 ? "bg-red-50/50 border-red-200/60 text-red-700" :
        roomVacant === room.beds.length ? "bg-emerald-50/50 border-emerald-200/60 text-emerald-700" :
        "bg-amber-50/50 border-amber-200/60 text-amber-700"
      }`}>
        <span className="flex items-center gap-1">
          🛏 Room {cleanRoomName}
          {roomVacant === room.beds.length && <DeleteRoomBtn roomId={room.id} />}
        </span>
        <span>{roomVacant > 0 ? `${roomVacant} Vacant` : "Full 🔴"}</span>
      </div>

      {/* Bed grid */}
      <div className="p-3 grid grid-cols-2 gap-2 bg-white/30">
        {room.beds.map((bed: any) => {
          const tenant = room.pgTenants.find((t: any) => t.bedId === bed.id);
          const cleanBedName = bed.name.replace(/^Bed\s+/i, "");

          return (
            <div key={bed.id}>
              {bed.isOccupied && tenant ? (
                <Link
                  href={`/dashboard/manager/tenants/${tenant.id}`}
                  className="group block rounded-lg border border-red-200 bg-red-50/90 hover:bg-red-100/90 p-2.5 text-center text-xs font-semibold transition-all hover:shadow-sm"
                  title={`View ${tenant.name}'s full profile`}
                >
                  <div className="font-extrabold text-[9px] uppercase tracking-widest mb-0.5 text-red-400">
                    Bed {cleanBedName}
                  </div>
                  <div className="font-extrabold text-red-900 truncate group-hover:underline">
                    {tenant.name}
                  </div>
                  <span className="text-[10px] font-semibold text-violet-700 mt-1 block opacity-90 group-hover:opacity-100">
                    View Profile →
                  </span>
                </Link>
              ) : bed.isOccupied ? (
                <div className="rounded-xl border border-red-200/60 bg-red-50/50 p-2.5 text-center text-[10px] font-bold text-red-800 uppercase tracking-wider">
                  <div className="font-black text-[9px] uppercase tracking-widest mb-1 text-red-400">
                    Bed {cleanBedName}
                  </div>
                  <span className="font-black">Occupied</span>
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/50 p-2.5 text-center text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  <div className="font-black text-[9px] uppercase tracking-widest mb-1 text-emerald-500">
                    Bed {cleanBedName}
                  </div>
                  <span className="flex items-center justify-center gap-1 text-emerald-700 font-black">
                    <CheckCircle size={11} /> Free
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default async function RoomsPage({ searchParams }: { searchParams: Promise<{ listingId?: string }> }) {
  const sp = await searchParams;
  const { userId, allowedListingIds } = await requireManagerAccess();
  const listingId = sp.listingId ? parseInt(sp.listingId) : undefined;

  // Scope first, then narrow. A ?listingId= for a PG this manager isn't assigned
  // to must return nothing rather than overriding the restriction.
  const where: any = { ownerId: userId, ...listingScope({ allowedListingIds }, "id") };
  if (listingId) {
    where.id = allowedListingIds === null || allowedListingIds.includes(listingId) ? listingId : -1;
  }

  const listings = await db.listing.findMany({
    where,
    select: {
      id: true,
      title: true,
      rooms: {
        orderBy: { name: "asc" },
        include: {
          beds: { orderBy: { name: "asc" } },
          pgTenants: {
            where: { status: "ACTIVE", deletedAt: null },
            select: { id: true, name: true, bedId: true },
          },
        },
      },
    },
  });

  const allOwnerListings = await db.listing.findMany({ where: { ownerId: userId, ...listingScope({ allowedListingIds }, "id") }, select: { id: true, title: true } });

  const totalBeds  = listings.reduce((s, l) => s + l.rooms.reduce((bs, r) => bs + r.beds.length, 0), 0);
  const occupied   = listings.reduce((s, l) => s + l.rooms.reduce((bs, r) => bs + r.beds.filter(b => b.isOccupied).length, 0), 0);
  const vacant     = totalBeds - occupied;
  const occupancyPct = totalBeds > 0 ? Math.round((occupied / totalBeds) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 flex items-center gap-2 uppercase tracking-tight">
            <BedDouble className="h-6 w-6 text-violet-600" />
            Room &amp; Bed Matrix
          </h1>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-1">Visual map of all beds across your properties</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <PropertyFilterSelect listings={allOwnerListings} value={listingId} />
          <AddRoomModal listings={allOwnerListings} defaultListingId={listingId} />
        </div>
      </div>

      {/* Occupancy Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-neutral-100/80 rounded-xl flex items-center justify-center border border-neutral-200/60">
            <BedDouble size={20} className="text-neutral-500" />
          </div>
          <div>
            <div className="text-xl font-black tracking-tight text-neutral-900">{totalBeds}</div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Total Beds</div>
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-red-200/60 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-red-50/80 rounded-xl flex items-center justify-center border border-red-200/60">
            <Users size={20} className="text-red-500" />
          </div>
          <div>
            <div className="text-xl font-black tracking-tight text-red-600">{occupied}</div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Occupied</div>
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-emerald-200/60 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50/80 rounded-xl flex items-center justify-center border border-emerald-200/60">
            <CheckCircle size={20} className="text-emerald-500" />
          </div>
          <div>
            <div className="text-xl font-black tracking-tight text-emerald-600">{vacant}</div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Vacant</div>
          </div>
        </div>
        {/* Circular Occupancy Gauge */}
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-violet-200/60 p-4 shadow-sm flex items-center gap-3">
          <div className="relative w-12 h-12 shrink-0">
            <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
              <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" className="text-neutral-200/60" strokeWidth="4" />
              <circle
                cx="18" cy="18" r="14" fill="none"
                stroke={occupancyPct > 85 ? "#ef4444" : occupancyPct > 60 ? "#f59e0b" : "#8b5cf6"}
                strokeWidth="4"
                strokeDasharray={`${(occupancyPct / 100) * 87.96} 87.96`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[9px] font-black text-neutral-700">{occupancyPct}%</span>
            </div>
          </div>
          <div>
            <div className="text-xl font-black tracking-tight text-violet-600">{occupancyPct}%</div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Occupancy</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider font-bold text-neutral-500">
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block shadow-sm"></span> Vacant</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-400 inline-block shadow-sm"></span> Occupied</div>
      </div>

      {listings.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden">
          <EmptyState icon={BedDouble} title="Koi property nahi" description="Pehle apni PG property add karein." />
        </div>
      ) : (
        <div className="space-y-8">
          {listings.map(listing => {
            const listingOccupied = listing.rooms.reduce((s, r) => s + r.beds.filter(b => b.isOccupied).length, 0);
            const listingTotal    = listing.rooms.reduce((s, r) => s + r.beds.length, 0);
            const listingPct      = listingTotal > 0 ? Math.round((listingOccupied / listingTotal) * 100) : 0;

            // Group this property's rooms by bed count — Single / Double / Triple sharing…
            const groupsMap = new Map<number, any[]>();
            for (const room of listing.rooms) {
              const n = room.beds.length;
              const arr = groupsMap.get(n) ?? [];
              arr.push(room);
              groupsMap.set(n, arr);
            }
            const categories = [...groupsMap.keys()].sort((a, b) => a - b).map((count) => {
              const rooms = groupsMap.get(count)!;
              return {
                count,
                rooms,
                beds: rooms.reduce((s, r) => s + r.beds.length, 0),
                occupied: rooms.reduce((s, r) => s + r.beds.filter((b: any) => b.isOccupied).length, 0),
              };
            });

            return (
              <div key={listing.id} className="bg-white/60 backdrop-blur-md rounded-3xl border border-neutral-200/60 shadow-sm overflow-hidden">
                {/* PG Header */}
                <div className="px-6 py-5 border-b border-neutral-200/60 bg-white/40 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h2 className="text-lg font-black tracking-tight text-neutral-900">{listing.title}</h2>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-1">{listing.rooms.length} rooms · {listingTotal} beds · {listingOccupied} occupied</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-32 bg-neutral-200/60 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-2.5 rounded-full transition-all ${listingPct > 85 ? "bg-red-500" : listingPct > 60 ? "bg-amber-500" : "bg-violet-500"}`}
                        style={{ width: `${listingPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">{listingPct}%</span>
                  </div>
                </div>

                <div className="p-5">
                  {listing.rooms.length === 0 ? (
                    <div className="text-sm text-neutral-400 flex items-center gap-2 py-4">
                      <AlertCircle className="h-4 w-4" /> Is property mein koi room add nahi kiya gaya hai.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {categories.map((cat) => (
                        <div key={cat.count}>
                          <div className="flex flex-wrap items-center gap-2.5 mb-3">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${catStyle(cat.count)}`}>
                              {sharingLabel(cat.count)}
                            </span>
                            <span className="text-xs text-neutral-500 font-medium">
                              {cat.rooms.length} room{cat.rooms.length === 1 ? "" : "s"} · {cat.beds} beds · {cat.occupied} occupied
                            </span>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {cat.rooms.map((room: any) => (
                              <RoomCard key={room.id} room={room} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
