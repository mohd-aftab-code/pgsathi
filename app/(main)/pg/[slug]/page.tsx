import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { MapPin, Phone, CheckCircle, ShieldCheck, Clock } from "lucide-react";
import Link from "next/link";
import { getThumbnailUrl } from "@/lib/cloudinary";
import ContactOwnerButton from "@/components/listings/ContactOwnerButton";
import { auth } from "@/lib/auth";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const pg = await db.listing.findUnique({ where: { slug: params.slug } });
  if (!pg) return { title: "PG Not Found" };
  return {
    title: `${pg.title} - PGSathi`,
    description: pg.description.slice(0, 150) + "...",
  };
}

export default async function PGDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const session = await auth();
  const userId = session?.user?.id ? parseInt(session.user.id) : null;

  // First try to find active listing (for all users)
  let pg = await db.listing.findFirst({
    where: { slug: params.slug, isActive: true, status: "ACTIVE" },
    include: {
      city: true,
      locality: true,
      owner: { select: { name: true, phone: true, id: true } },
      photos: { orderBy: { sortOrder: "asc" } },
      amenities: { include: { amenity: true } },
    },
  });

  // If not found, check if logged-in user is the owner (allow owner to preview)
  if (!pg && userId) {
    pg = await db.listing.findFirst({
      where: { slug: params.slug, ownerId: userId },
      include: {
        city: true,
        locality: true,
        owner: { select: { name: true, phone: true, id: true } },
        photos: { orderBy: { sortOrder: "asc" } },
        amenities: { include: { amenity: true } },
      },
    });
  }

  if (!pg) notFound();

  const mainPhotoUrl = pg.photos[0]?.url 
    ? getThumbnailUrl(pg.photos[0].url, 1200, 800)
    : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80";

  return (
    <div className="bg-neutral-50 min-h-screen py-8">
      <div className="container-max section-padding">
        
        {/* Preview Banner for PENDING listings */}
        {pg.status !== "ACTIVE" && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <Clock size={20} className="text-amber-600 shrink-0" />
            <div>
              <p className="font-bold text-amber-800">This listing is under review (Preview Mode)</p>
              <p className="text-amber-700 text-sm">Only you can see this. It will be visible to everyone once our team approves it.</p>
            </div>
          </div>
        )}

        {/* Photo Gallery (Simplified for now) */}
        <div className="rounded-3xl overflow-hidden mb-8 h-[400px] md:h-[500px] relative">
          <img src={mainPhotoUrl} alt={pg.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {pg.genderAllowed} PG
                </span>
                {pg.isVerified && (
                  <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <ShieldCheck size={14} /> Verified
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-2">{pg.title}</h1>
              <p className="flex items-center gap-2 opacity-90 text-sm md:text-base">
                <MapPin size={18} className="text-orange-400" />
                {pg.address}, {pg.locality?.name}, {pg.city?.name}
              </p>
            </div>
            <div className="hidden md:block text-right">
              <div className="text-sm opacity-90 mb-1">Starting from</div>
              <div className="text-4xl font-extrabold">₹{pg.priceMin}<span className="text-lg font-normal opacity-80">/mo</span></div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-8">
            <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200">
              <h2 className="text-xl font-bold mb-4">About this PG</h2>
              <p className="text-neutral-600 whitespace-pre-wrap leading-relaxed">{pg.description}</p>
            </section>

            <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200">
              <h2 className="text-xl font-bold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {pg.amenities.map(a => (
                  <div key={a.amenityId} className="flex items-center gap-2 text-neutral-700">
                    <CheckCircle size={18} className="text-green-500" />
                    <span>{a.amenity.name}</span>
                  </div>
                ))}
                {pg.amenities.length === 0 && (
                  <p className="text-neutral-500">Basic amenities included. Contact owner for details.</p>
                )}
              </div>
            </section>

            <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200">
              <h2 className="text-xl font-bold mb-4">House Rules & Facilities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between border-b border-neutral-100 pb-2">
                  <span className="text-neutral-500">Notice Period</span>
                  <span className="font-semibold">{pg.noticePeriod ? "Required" : "No"}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-100 pb-2">
                  <span className="text-neutral-500">Gate Closing Time</span>
                  <span className="font-semibold">{pg.gateClosingTime ? "Strict" : "Flexible"}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-100 pb-2">
                  <span className="text-neutral-500">Rent Lock-In</span>
                  <span className="font-semibold">{pg.rentLockIn ? "Applicable" : "No"}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-100 pb-2">
                  <span className="text-neutral-500">Guardians Stay</span>
                  <span className="font-semibold">{pg.noGuardiansStay ? "Not Allowed" : "Allowed"}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-100 pb-2">
                  <span className="text-neutral-500">Laundry Service</span>
                  <span className="font-semibold">{pg.laundryService ? "Available" : "No"}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-100 pb-2">
                  <span className="text-neutral-500">Room Cleaning</span>
                  <span className="font-semibold">{pg.roomCleaning ? "Included" : "Self"}</span>
                </div>
              </div>
            </section>
          </div>

          {/* Sticky Sidebar */}
          <aside className="w-full lg:w-80 shrink-0">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-neutral-200 sticky top-24">
              <div className="text-center mb-6 border-b border-neutral-100 pb-6">
                <div className="text-sm text-neutral-500 mb-1">Monthly Rent</div>
                <div className="text-3xl font-extrabold text-primary-700">₹{pg.priceMin} - ₹{pg.priceMax}</div>
                <div className="text-sm text-neutral-500 mt-2">Deposit: ₹{pg.securityDeposit || "1 Month"}</div>
              </div>

              <div className="space-y-4">
                <ContactOwnerButton 
                  listingId={pg.id} 
                  ownerPhone={pg.owner.phone || ""} 
                  listingTitle={pg.title} 
                />
              </div>

              <div className="mt-6 pt-6 border-t border-neutral-100 text-sm text-neutral-500 text-center flex flex-col gap-2">
                <p>Zero brokerage. Deal directly with owner.</p>
                <div className="flex items-center justify-center gap-1 text-green-600 font-medium">
                  <ShieldCheck size={16} /> Verified by PGSathi
                </div>
              </div>
            </div>
          </aside>
        </div>

      </div>
    </div>
  );
}


