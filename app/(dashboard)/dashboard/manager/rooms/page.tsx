/**
 * app/(main)/dashboard/manager/rooms/page.tsx
 * Visual Room/Bed Matrix — Premium Color-coded Grid
 */
import { BedDouble, AlertCircle, Users, CheckCircle } from "lucide-react";
import { db } from "@/lib/db";
import { requireManagerAccess } from "@/lib/manager-auth";
import { EmptyState } from "@/components/manage/EmptyState";
import { AddRoomModal } from "@/components/manage/AddRoomModal";
import Link from "next/link";

export const metadata = { title: "Rooms & Beds — PG Manager" };

export default async function RoomsPage({ searchParams }: { searchParams: Promise<{ listingId?: string }> }) {
  const sp = await searchParams;
  const { userId } = await requireManagerAccess();
  const listingId = sp.listingId ? parseInt(sp.listingId) : undefined;

  const where: any = { ownerId: userId };
  if (listingId) where.id = listingId;

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

  const allOwnerListings = await db.listing.findMany({ where: { ownerId: userId }, select: { id: true, title: true } });

  const totalBeds  = listings.reduce((s, l) => s + l.rooms.reduce((bs, r) => bs + r.beds.length, 0), 0);
  const occupied   = listings.reduce((s, l) => s + l.rooms.reduce((bs, r) => bs + r.beds.filter(b => b.isOccupied).length, 0), 0);
  const vacant     = totalBeds - occupied;
  const occupancyPct = totalBeds > 0 ? Math.round((occupied / totalBeds) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 flex items-center gap-2">
            <BedDouble className="h-6 w-6 text-violet-600" />
            Room &amp; Bed Matrix
          </h1>
          <p className="text-sm text-neutral-500 mt-1">Visual map of all beds across your properties</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <form className="flex gap-2">
            <select name="listingId" defaultValue={listingId ?? ""} className="input-base w-44 text-sm">
              <option value="">All Properties</option>
              {allOwnerListings.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
            </select>
            <button type="submit" className="btn-ghost text-sm px-4 py-2 border border-neutral-200">Filter</button>
          </form>
          <AddRoomModal listings={allOwnerListings} defaultListingId={listingId} />
        </div>
      </div>

      {/* Occupancy Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
            <BedDouble size={20} className="text-neutral-500" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-neutral-900">{totalBeds}</div>
            <div className="text-xs text-neutral-500 font-medium">Total Beds</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-red-100 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
            <Users size={20} className="text-red-500" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-red-600">{occupied}</div>
            <div className="text-xs text-neutral-500 font-medium">Occupied</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-green-100 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
            <CheckCircle size={20} className="text-green-500" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-green-600">{vacant}</div>
            <div className="text-xs text-neutral-500 font-medium">Vacant</div>
          </div>
        </div>
        {/* Circular Occupancy Gauge */}
        <div className="bg-white rounded-2xl border border-violet-100 p-4 shadow-sm flex items-center gap-3">
          <div className="relative w-12 h-12 shrink-0">
            <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e7eb" strokeWidth="4" />
              <circle
                cx="18" cy="18" r="14" fill="none"
                stroke={occupancyPct > 85 ? "#ef4444" : occupancyPct > 60 ? "#f59e0b" : "#8b5cf6"}
                strokeWidth="4"
                strokeDasharray={`${(occupancyPct / 100) * 87.96} 87.96`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[9px] font-extrabold text-neutral-700">{occupancyPct}%</span>
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-violet-600">{occupancyPct}%</div>
            <div className="text-xs text-neutral-500 font-medium">Occupancy</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs font-semibold text-neutral-500">
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-400 inline-block"></span> Vacant</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-400 inline-block"></span> Occupied</div>
      </div>

      {listings.length === 0 ? (
        <div className="card">
          <EmptyState icon={BedDouble} title="Koi property nahi" description="Pehle apni PG property add karein." />
        </div>
      ) : (
        <div className="space-y-8">
          {listings.map(listing => {
            const listingOccupied = listing.rooms.reduce((s, r) => s + r.beds.filter(b => b.isOccupied).length, 0);
            const listingTotal    = listing.rooms.reduce((s, r) => s + r.beds.length, 0);
            const listingPct      = listingTotal > 0 ? Math.round((listingOccupied / listingTotal) * 100) : 0;

            return (
              <div key={listing.id} className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                {/* PG Header */}
                <div className="px-6 py-4 border-b border-neutral-100 bg-gradient-to-r from-violet-50/50 to-white flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h2 className="text-base font-bold text-neutral-900">{listing.title}</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">{listing.rooms.length} rooms · {listingTotal} beds · {listingOccupied} occupied</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${listingPct > 85 ? "bg-red-500" : listingPct > 60 ? "bg-amber-500" : "bg-violet-500"}`}
                        style={{ width: `${listingPct}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-neutral-500">{listingPct}%</span>
                  </div>
                </div>

                <div className="p-5">
                  {listing.rooms.length === 0 ? (
                    <div className="text-sm text-neutral-400 flex items-center gap-2 py-4">
                      <AlertCircle className="h-4 w-4" /> Is property mein koi room add nahi kiya gaya hai.
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {listing.rooms.map(room => {
                        const roomVacant = room.beds.filter(b => !b.isOccupied).length;
                        return (
                          <div key={room.id} className="rounded-xl border border-neutral-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                            {/* Room header bar */}
                            <div className={`px-3 py-2 flex justify-between items-center text-xs font-bold border-b ${
                              roomVacant === 0 ? "bg-red-50 border-red-100 text-red-700" :
                              roomVacant === room.beds.length ? "bg-green-50 border-green-100 text-green-700" :
                              "bg-amber-50 border-amber-100 text-amber-700"
                            }`}>
                              <span>🛏 Room {room.name}</span>
                              <span>{roomVacant > 0 ? `${roomVacant} Vacant` : "Full 🔴"}</span>
                            </div>

                            {/* Bed grid */}
                            <div className="p-3 grid grid-cols-2 gap-2 bg-neutral-50/50">
                              {room.beds.map(bed => {
                                const tenant = room.pgTenants.find(t => t.bedId === bed.id);
                                return (
                                  <div
                                    key={bed.id}
                                    className={`rounded-lg border text-center p-2.5 text-xs font-semibold transition-transform hover:scale-105 cursor-default ${
                                      bed.isOccupied
                                        ? "bg-red-50 border-red-200 text-red-800"
                                        : "bg-green-50 border-green-200 text-green-800"
                                    }`}
                                  >
                                    <div className="font-extrabold text-[9px] uppercase tracking-widest mb-1 opacity-50">Bed {bed.name}</div>
                                    {bed.isOccupied ? (
                                      <Link
                                        href={`/dashboard/manager/tenants/${tenant?.id}`}
                                        className="hover:underline block truncate font-bold"
                                        title={tenant?.name}
                                      >
                                        {tenant?.name?.split(" ")[0] || "Occupied"}
                                      </Link>
                                    ) : (
                                      <span className="flex items-center justify-center gap-1 text-green-700">
                                        <CheckCircle size={11} /> Free
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
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
