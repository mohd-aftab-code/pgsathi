import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Heart } from "lucide-react";
import Link from "next/link";
import PGCard from "@/components/listings/PGCard";

export const metadata = { title: "Saved PGs - Tenant Dashboard" };

export default async function SavedPGsPage() {
  const session = await auth();
  const userId = session?.user?.id ? parseInt(session.user.id) : 0;

  const savedListings = await db.savedListing.findMany({
    where: { userId },
    include: {
      listing: {
        include: {
          city: true,
          locality: true,
          photos: {
            orderBy: { sortOrder: 'asc' },
            take: 1
          },
          amenities: {
            include: { amenity: true },
            take: 3
          }
        }
      }
    },
    orderBy: { savedAt: 'desc' }
  });

  return (
    <div>
      <div className="mb-6 lg:mb-8 border-b border-neutral-200 pb-5">
        <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
          <Heart className="text-pink-600" /> Saved PGs
        </h1>
        <p className="text-sm text-neutral-500 mt-1">Properties you have shortlisted for later.</p>
      </div>

      {savedListings.length === 0 ? (
        <div className="bg-white rounded-2xl md:rounded-3xl p-8 md:p-12 shadow-sm border border-neutral-200 text-center">
          <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart size={32} className="text-pink-300" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Your Wishlist is Empty</h2>
          <p className="text-neutral-500 max-w-md mx-auto mb-6">
            You haven't saved any properties yet. Start exploring and click the heart icon on any PG to save it here.
          </p>
          <Link 
            href="/search" 
            className="inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg"
          >
            Explore PGs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {savedListings.map((saved) => (
            <PGCard key={saved.listingId} listing={saved.listing as any} />
          ))}
        </div>
      )}
    </div>
  );
}
