import { auth } from "@/lib/auth";
import { db as prisma } from "@/lib/db";
import Link from "next/link";
import { Building2 } from "lucide-react";

export const metadata = {
  title: "Manage Inventory - PGSathi",
};

export default async function InventoryPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const listings = await prisma.listing.findMany({
    where: { ownerId: parseInt(session.user.id) },
    include: {
      city: true,
      rooms: {
        include: { beds: true }
      }
    }
  });

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Bed Inventory</h1>
          <p className="text-sm text-neutral-500 mt-1">Track which beds are vacant or occupied in your PGs.</p>
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-12 bg-neutral-50 rounded-xl">
          <Building2 className="mx-auto h-12 w-12 text-neutral-300 mb-3" />
          <h3 className="text-lg font-medium text-neutral-900">No Listings Yet</h3>
          <p className="text-neutral-500 mb-4">You need to add a PG listing first to manage its inventory.</p>
          <Link href="/dashboard/owner/listings/new" className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-700 transition">
            Add New Listing
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {listings.map(listing => (
            <div key={listing.id} className="border border-neutral-100 p-5 rounded-xl hover:border-primary-200 transition-all shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">{listing.title}</h3>
                  <p className="text-sm text-neutral-500 mb-3">{listing.city.name}</p>
                  <div className="flex gap-4 text-sm bg-neutral-50 px-3 py-2 rounded-lg inline-flex border border-neutral-100">
                    <span className="flex items-center gap-1"><strong className="text-primary-700">{listing.rooms.length}</strong> Rooms</span>
                    <span className="w-px h-4 bg-neutral-200"></span>
                    <span className="flex items-center gap-1"><strong className="text-primary-700">{listing.rooms.reduce((acc, r) => acc + r.beds.length, 0)}</strong> Total Beds</span>
                  </div>
                </div>
                <Link href={`/dashboard/owner/inventory/${listing.id}`} className="bg-neutral-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-neutral-800 transition">
                  Manage Beds
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
