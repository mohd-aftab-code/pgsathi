import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import ImageGallery from "@/components/listings/ImageGallery";
import ContactOwnerButton from "@/components/listings/ContactOwnerButton";
import ViewTracker from "@/components/listings/ViewTracker";
import { MapPin, CheckCircle, Star, Wifi, Car, Utensils, Shirt, Brush, Clock, Shield, Users, Home, ArrowLeft, Share2 } from "lucide-react";
import { unstable_cache } from "next/cache";

const getListingBySlug = unstable_cache(
  async (slug: string) => {
    return db.listing.findUnique({
      where: { slug, status: "ACTIVE", isActive: true },
      include: {
        city: true,
        locality: true,
        photos: { orderBy: { sortOrder: "asc" } },
        amenities: { include: { amenity: true } },
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { name: true, avatar: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        owner: { select: { name: true, phone: true, avatar: true } },
      },
    });
  },
  ["pg-detail"],
  { revalidate: 300 } // 5 minutes — listing details rarely change minute-to-minute
);

import { constructMetadata } from "@/lib/seo";

export async function generateMetadata(props: {
  params: Promise<{ city: string; locality: string; slug: string }>;
}) {
  const params = await props.params;
  const pg = await getListingBySlug(params.slug);

  if (!pg) return { title: "PG Not Found" };

  const cityName = pg.city?.name || "";
  const localityName = pg.locality?.name || "";
  const title = pg.metaTitle || `${pg.title} - PG in ${localityName}, ${cityName}`;
  const description = pg.metaDesc || `${pg.genderAllowed} PG in ${localityName}, ${cityName}. Starting from ₹${pg.priceMin}/month. Zero brokerage, verified property. Contact owner directly on PGSathi.`;
  const image = pg.photos?.[0]?.url || "https://pgsathi.in/og-image.jpg";
  const canonicalPath = `/pg/${pg.city?.slug}/${pg.locality?.slug || "all"}/${pg.slug}`;

  return constructMetadata({
    title,
    description,
    image,
    canonicalPath,
    keywords: [pg.title, `PG in ${localityName}`, `PG in ${cityName}`, `${pg.genderAllowed} PG`, 'Zero Brokerage PG'],
  });
}

export default async function PGDetailPage(props: {
  params: Promise<{ city: string; locality: string; slug: string }>;
}) {
  const params = await props.params;

  const pg = await getListingBySlug(params.slug);

  if (!pg) notFound();

  const cityName = pg.city?.name || "";
  const localityName = pg.locality?.name || "";
  const approvedReviews = pg.reviews || [];
  const avgRating = approvedReviews.length > 0
    ? (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length).toFixed(1)
    : null;

  // JSON-LD Schema Markup for Google
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": pg.title,
    "description": pg.description,
    "url": `https://pgsathi.in/pg/${pg.city?.slug}/${pg.locality?.slug || "all"}/${pg.slug}`,
    "image": pg.photos.map(p => p.url),
    "address": {
      "@type": "PostalAddress",
      "streetAddress": pg.address,
      "addressLocality": localityName,
      "addressRegion": cityName,
      "postalCode": pg.pincode,
      "addressCountry": "IN"
    },
    "priceRange": `₹${pg.priceMin} - ₹${pg.priceMax}`,
    ...(avgRating && approvedReviews.length > 0 ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": avgRating,
        "reviewCount": approvedReviews.length,
        "bestRating": "5",
        "worstRating": "1"
      }
    } : {}),
    "amenityFeature": [
      ...(pg.foodIncluded ? [{ "@type": "LocationFeatureSpecification", "name": "Food Included", "value": true }] : []),
      ...(pg.laundryService ? [{ "@type": "LocationFeatureSpecification", "name": "Laundry Service", "value": true }] : []),
      ...(pg.roomCleaning ? [{ "@type": "LocationFeatureSpecification", "name": "Room Cleaning", "value": true }] : []),
      ...(pg.parking ? [{ "@type": "LocationFeatureSpecification", "name": "Parking", "value": true }] : []),
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://pgsathi.in"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": `PGs in ${cityName}`,
        "item": `https://pgsathi.in/pg-in-${pg.city?.slug}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": pg.title,
        "item": `https://pgsathi.in/pg/${pg.city?.slug}/${pg.locality?.slug || "all"}/${pg.slug}`
      }
    ]
  };

  const genderLabel = pg.genderAllowed === "BOYS" ? "Boys" : pg.genderAllowed === "GIRLS" ? "Girls" : "Co-ed";
  const amenityIcons: Record<string, any> = {
    wifi: <Wifi size={16} />, parking: <Car size={16} />, food: <Utensils size={16} />,
    laundry: <Shirt size={16} />, cleaning: <Brush size={16} />,
  };

  return (
    <>
      {/* Schema Markup */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <ViewTracker listingId={pg.id} />

      <div className="bg-neutral-50 min-h-screen">
        <div className="container-max section-padding py-6 md:py-8">

          {/* Breadcrumb */}
          <Breadcrumbs 
            items={[
              { label: `PGs in ${cityName}`, href: `/pg-in-${pg.city?.slug}` },
              { label: pg.title }
            ]} 
          />

          {/* Image Gallery */}
          <ImageGallery photos={pg.photos} title={pg.title} />

          <div className="flex flex-col lg:flex-row gap-8">

            {/* LEFT — Main Content */}
            <div className="flex-1 min-w-0">

              {/* Title & Badges */}
              <div className="bg-white rounded-2xl p-6 mb-6 border border-neutral-200 shadow-sm">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${pg.genderAllowed === "BOYS" ? "bg-blue-100 text-blue-700" : pg.genderAllowed === "GIRLS" ? "bg-pink-100 text-pink-700" : "bg-purple-100 text-purple-700"}`}>
                    {genderLabel} PG
                  </span>
                  {pg.isVerified && (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                      <CheckCircle size={12} /> Verified
                    </span>
                  )}
                  {pg.isFeatured && (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-100 text-orange-700">
                      ⭐ Featured
                    </span>
                  )}
                  {avgRating && (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1">
                      <Star size={12} fill="currentColor" /> {avgRating} ({approvedReviews.length} reviews)
                    </span>
                  )}
                </div>

                <h1 className="text-2xl md:text-3xl font-black text-neutral-900 mb-3">{pg.title}</h1>

                <div className="flex items-center gap-2 text-neutral-500 mb-4">
                  <MapPin size={16} className="text-orange-500 shrink-0" />
                  <span>{pg.address}, {localityName}, {cityName} - {pg.pincode}</span>
                </div>

                {/* Price */}
                <div className="flex flex-wrap items-end gap-4 pt-4 border-t border-neutral-100">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Starting from</p>
                    <p className="text-3xl font-black text-primary-700">₹{pg.priceMin.toLocaleString()}<span className="text-base font-normal text-neutral-500">/mo</span></p>
                  </div>
                  {pg.priceMax > pg.priceMin && (
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Up to</p>
                      <p className="text-xl font-bold text-neutral-700">₹{pg.priceMax.toLocaleString()}<span className="text-sm font-normal text-neutral-500">/mo</span></p>
                    </div>
                  )}
                  {pg.securityDeposit && (
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Security Deposit</p>
                      <p className="text-lg font-bold text-neutral-700">₹{pg.securityDeposit.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl p-6 mb-6 border border-neutral-200 shadow-sm">
                <h2 className="text-xl font-bold text-neutral-900 mb-4">About this PG</h2>
                <p className="text-neutral-600 leading-relaxed whitespace-pre-line">{pg.description}</p>
              </div>

              {/* Rules & Policies */}
              <div className="bg-white rounded-2xl p-6 mb-6 border border-neutral-200 shadow-sm">
                <h2 className="text-xl font-bold text-neutral-900 mb-4">Rules & Policies</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: "Food Included", value: pg.foodIncluded, icon: <Utensils size={16} /> },
                    { label: "Laundry Service", value: pg.laundryService, icon: <Shirt size={16} /> },
                    { label: "Room Cleaning", value: pg.roomCleaning, icon: <Brush size={16} /> },
                    { label: "Parking Available", value: pg.parking, icon: <Car size={16} /> },
                    { label: "No Notice Period", value: !pg.noticePeriod, icon: <Clock size={16} /> },
                    { label: "No Gate Closing Time", value: !pg.gateClosingTime, icon: <Shield size={16} /> },
                    { label: "Guardians Stay Allowed", value: !pg.noGuardiansStay, icon: <Users size={16} /> },
                    { label: "No Rent Lock-in", value: !pg.rentLockIn, icon: <Home size={16} /> },
                  ].map(({ label, value, icon }) => (
                    <div key={label} className={`flex items-center gap-3 p-3 rounded-xl border ${value ? "border-green-200 bg-green-50" : "border-neutral-200 bg-neutral-50"}`}>
                      <span className={value ? "text-green-600" : "text-neutral-400"}>{icon}</span>
                      <span className={`text-sm font-medium ${value ? "text-green-800" : "text-neutral-400 line-through"}`}>{label}</span>
                      {value ? <CheckCircle size={14} className="ml-auto text-green-500" /> : null}
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Amenities */}
              {pg.amenities.length > 0 && (
                <div className="bg-white rounded-2xl p-6 mb-6 border border-neutral-200 shadow-sm">
                  <h2 className="text-xl font-bold text-neutral-900 mb-4">Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {pg.amenities.map(({ amenity }) => (
                      <span key={amenity.id} className="flex items-center gap-1.5 text-sm font-medium bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg border border-primary-100">
                        {amenityIcons[amenity.slug] || <CheckCircle size={14} />}
                        {amenity.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Charges */}
              {(pg.electricityCharge || pg.maintenanceCharge || pg.foodCharge || pg.setupFee) ? (
                <div className="bg-white rounded-2xl p-6 mb-6 border border-neutral-200 shadow-sm">
                  <h2 className="text-xl font-bold text-neutral-900 mb-4">Additional Charges</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {pg.electricityCharge && (
                      <div className="text-center p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                        <p className="text-xs text-neutral-500 mb-1">Electricity</p>
                        <p className="font-bold text-neutral-800">₹{pg.electricityCharge}/unit</p>
                      </div>
                    )}
                    {pg.maintenanceCharge && (
                      <div className="text-center p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                        <p className="text-xs text-neutral-500 mb-1">Maintenance</p>
                        <p className="font-bold text-neutral-800">₹{pg.maintenanceCharge}/mo</p>
                      </div>
                    )}
                    {pg.foodCharge && (
                      <div className="text-center p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                        <p className="text-xs text-neutral-500 mb-1">Food Charge</p>
                        <p className="font-bold text-neutral-800">₹{pg.foodCharge}/mo</p>
                      </div>
                    )}
                    {pg.setupFee && (
                      <div className="text-center p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                        <p className="text-xs text-neutral-500 mb-1">Setup Fee</p>
                        <p className="font-bold text-neutral-800">₹{pg.setupFee} (one-time)</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Reviews */}
              <div className="bg-white rounded-2xl p-6 mb-6 border border-neutral-200 shadow-sm">
                <h2 className="text-xl font-bold text-neutral-900 mb-2">
                  Reviews {avgRating && <span className="text-yellow-500">⭐ {avgRating}</span>}
                </h2>
                <p className="text-sm text-neutral-500 mb-4">{approvedReviews.length} verified reviews</p>
                {approvedReviews.length === 0 ? (
                  <div className="text-center py-8 text-neutral-400">
                    <Star size={32} className="mx-auto mb-2 opacity-40" />
                    <p>No reviews yet. Be the first to review!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {approvedReviews.map((review) => (
                      <div key={review.id} className="border-b border-neutral-100 pb-4 last:border-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                            {review.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-neutral-900">{review.user.name}</p>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} size={12} className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-neutral-300"} />
                              ))}
                            </div>
                          </div>
                          <span className="ml-auto text-xs text-neutral-400">
                            {new Date(review.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                          </span>
                        </div>
                        {review.comment && <p className="text-sm text-neutral-600 ml-12">{review.comment}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

              {/* RIGHT — Sticky Contact Box */}
            <div className="w-full lg:w-80 shrink-0 mt-6 lg:mt-0">
              <div className="sticky top-24 space-y-4">

                {/* Contact Card (Desktop only, hidden on mobile to rely on sticky footer) */}
                <div className="hidden lg:block bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
                  <div className="text-center mb-5">
                    <p className="text-3xl font-black text-primary-700">₹{pg.priceMin.toLocaleString()}</p>
                    <p className="text-sm text-neutral-500">per month onwards</p>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl mb-4">
                    <CheckCircle size={16} className="text-green-600 shrink-0" />
                    <p className="text-xs font-medium text-green-700">Zero Brokerage — Contact owner directly</p>
                  </div>

                  <ContactOwnerButton
                    listingId={pg.id}
                    ownerPhone={pg.owner?.phone || ""}
                    listingTitle={pg.title}
                    hasActiveSubscription={true}
                  />
                </div>

                {/* Quick Info */}
                <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm">
                  <h3 className="font-bold text-neutral-900 mb-3">Quick Info</h3>
                  <div className="space-y-3 text-sm">
                    {pg.totalBeds && (
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Total Beds</span>
                        <span className="font-semibold text-neutral-800">{pg.totalBeds}</span>
                      </div>
                    )}
                    {pg.availableBeds !== null && pg.availableBeds !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Available Beds</span>
                        <span className={`font-semibold ${(pg.availableBeds || 0) > 0 ? "text-green-600" : "text-red-500"}`}>
                          {pg.availableBeds}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Gender</span>
                      <span className="font-semibold text-neutral-800">{genderLabel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">PG Type</span>
                      <span className="font-semibold text-neutral-800">{pg.roomTypes?.map((r: string) => r.replace(/_/g, " ")).join(", ")}</span>
                    </div>
                    {pg.totalViews > 0 && (
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Total Views</span>
                        <span className="font-semibold text-neutral-800">{pg.totalViews}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Back to search */}
                <Link
                  href={`/pg-in-${pg.city?.slug}`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-neutral-300 text-neutral-600 hover:bg-neutral-50 transition-colors text-sm font-medium"
                >
                  <ArrowLeft size={16} /> More PGs in {cityName}
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Sticky Footer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4 shadow-[0_-8px_20px_rgba(0,0,0,0.08)] z-50 flex items-center justify-between pb-safe">
        <div className="flex flex-col">
          <span className="text-xs text-neutral-500 font-medium">Rent starts from</span>
          <span className="text-xl font-black text-primary-700 leading-none">₹{pg.priceMin.toLocaleString()}</span>
        </div>
        <div className="w-[65%]">
          <ContactOwnerButton
            listingId={pg.id}
            ownerPhone={pg.owner?.phone || ""}
            listingTitle={pg.title}
            hasActiveSubscription={true}
            layout="row"
          />
        </div>
      </div>
    </>
  );
}
