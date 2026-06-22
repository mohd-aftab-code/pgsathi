import { db } from "@/lib/db";
import PGCard from "@/components/listings/PGCard";
import SearchBar from "@/components/landing/SearchBar";
import { Filter } from "lucide-react";

export const metadata = {
  title: "Search PGs - PGSathi",
  description: "Find the best PGs and Hostels matching your requirements.",
};

export default async function SearchPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const citySlug = searchParams.city as string | undefined;
  const gender = searchParams.gender as string | undefined;

  // Build query
  const where: any = { isActive: true, status: "ACTIVE" };
  
  if (citySlug && citySlug !== "all") {
    where.city = { slug: citySlug };
  }
  
  if (gender && gender !== "all") {
    where.genderAllowed = gender;
  }

  // Fetch listings
  const listings = await db.listing.findMany({
    where,
    include: {
      city: true,
      locality: true,
      photos: { take: 1 },
    },
    orderBy: [
      { isFeatured: "desc" },
      { createdAt: "desc" },
    ],
  });

  return (
    <div className="bg-neutral-50 min-h-screen py-8">
      <div className="container-max section-padding">
        
        {/* Search Header */}
        <div className="bg-primary-900 rounded-3xl p-6 md:p-8 mb-8 text-white shadow-xl">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Find Your Perfect PG</h1>
          <SearchBar initialCity={citySlug === "all" ? "" : citySlug} initialGender={gender === "all" ? "" : gender} />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filters Sidebar (Mock for now) */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200 sticky top-24">
              <div className="flex items-center gap-2 font-bold text-lg mb-4 pb-4 border-b border-neutral-100">
                <Filter size={20} /> Filters
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold text-sm text-neutral-500 mb-3 uppercase tracking-wider">Budget</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary-600 transition-colors">
                    <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" />
                    Under ₹5,000
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary-600 transition-colors">
                    <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" />
                    ₹5,000 - ₹10,000
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary-600 transition-colors">
                    <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" />
                    Above ₹10,000
                  </label>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-neutral-500 mb-3 uppercase tracking-wider">Amenities</h3>
                <div className="space-y-2">
                  {["WiFi", "AC", "Food Included", "Washing Machine"].map(amenity => (
                    <label key={amenity} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary-600 transition-colors">
                      <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" />
                      {amenity}
                    </label>
                  ))}
                </div>
              </div>
              
              <button className="w-full mt-6 bg-primary-100 text-primary-700 font-semibold py-2 rounded-xl hover:bg-primary-200 transition-colors">
                Apply Filters
              </button>
            </div>
          </aside>

          {/* Results Grid */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {listings.length} PGs Found
              </h2>
              <select className="bg-white border border-neutral-200 text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none">
                <option>Sort by: Recommended</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>

            {listings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {listings.map(pg => (
                  <PGCard key={pg.id} pg={pg} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200 shadow-sm">
                <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔍</span>
                </div>
                <h3 className="text-xl font-bold mb-2">No PGs found</h3>
                <p className="text-neutral-500 mb-6">We couldn't find any listings matching your criteria. Try adjusting your filters.</p>
                <button className="bg-primary-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-primary-700 transition-colors">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
