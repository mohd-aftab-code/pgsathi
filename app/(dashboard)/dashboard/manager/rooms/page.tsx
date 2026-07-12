/**
 * app/(main)/dashboard/manager/rooms/page.tsx
 * View room occupancy and bed status across PG properties.
 */
import { BedDouble, AlertCircle } from "lucide-react";
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

  // We fetch listings with their rooms, beds, and active tenants
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

  const totalRooms = listings.reduce((s, l) => s + l.rooms.length, 0);
  const totalBeds  = listings.reduce((s, l) => s + l.rooms.reduce((bs, r) => bs + r.beds.length, 0), 0);
  const occupied   = listings.reduce((s, l) => s + l.rooms.reduce((bs, r) => bs + r.beds.filter(b => b.isOccupied).length, 0), 0);
  const vacant     = totalBeds - occupied;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 flex items-center gap-2">
            <BedDouble className="h-6 w-6 text-primary-600" />
            Rooms & Beds
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {totalRooms} Rooms · {vacant} Vacant Beds · {occupied} Occupied
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <form className="flex gap-2">
            <select name="listingId" defaultValue={listingId ?? ""} className="input-base w-48">
              <option value="">All Properties</option>
              {allOwnerListings.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
            </select>
            <button type="submit" className="btn-ghost text-sm px-4 py-2 border border-neutral-200">Filter</button>
          </form>
          <AddRoomModal listings={allOwnerListings} defaultListingId={listingId} />
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="card">
          <EmptyState icon={BedDouble} title="Koi property nahi" description="Pehle apni PG property add karein." />
        </div>
      ) : (
        <div className="space-y-8">
          {listings.map(listing => (
            <div key={listing.id} className="card p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-100">{listing.title}</h2>
              {listing.rooms.length === 0 ? (
                <div className="text-sm text-neutral-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> Is property mein koi room add nahi kiya gaya hai.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {listing.rooms.map(room => {
                    const roomVacant = room.beds.filter(b => !b.isOccupied).length;
                    return (
                      <div key={room.id} className="rounded-xl border border-neutral-200 bg-neutral-50 overflow-hidden">
                        <div className="px-3 py-2 bg-neutral-100 border-b border-neutral-200 flex justify-between items-center">
                          <strong className="text-sm text-neutral-800">Room {room.name}</strong>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${roomVacant > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {roomVacant > 0 ? `${roomVacant} Vacant` : "Full"}
                          </span>
                        </div>
                        <div className="p-3 grid grid-cols-2 gap-2">
                          {room.beds.map(bed => {
                            const tenant = room.pgTenants.find(t => t.bedId === bed.id);
                            return (
                              <div
                                key={bed.id}
                                className={`text-center p-2 rounded-lg border text-xs ${
                                  bed.isOccupied
                                    ? "bg-white border-primary-200 text-primary-700"
                                    : "bg-green-50 border-green-200 text-green-700 font-medium"
                                }`}
                              >
                                <div className="font-bold mb-1">Bed {bed.name}</div>
                                {bed.isOccupied ? (
                                  <Link href={`/dashboard/manager/tenants/${tenant?.id}`} className="hover:underline line-clamp-1" title={tenant?.name}>
                                    {tenant?.name || "Occupied"}
                                  </Link>
                                ) : (
                                  "Available"
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
          ))}
        </div>
      )}
    </div>
  );
}
