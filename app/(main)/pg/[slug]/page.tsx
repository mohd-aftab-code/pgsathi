import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { 
  MapPin, CheckCircle, ShieldCheck, Clock, BedDouble, 
  DoorOpen, Users, Coffee, Car, ShieldAlert, BadgeCheck,
  CalendarX, Ban, Maximize2, Zap
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import Link from "next/link";
import ContactOwnerButton from "@/components/listings/ContactOwnerButton";
import ImageGallery from "@/components/listings/ImageGallery";
import PageNavigation from "@/components/listings/PageNavigation";
import BookVisitModal from "@/components/listings/BookVisitModal";
import CostCalculator from "@/components/listings/CostCalculator";
import PGCard from "@/components/listings/PGCard";
import { auth } from "@/lib/auth";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const pg = await db.listing.findUnique({ 
    where: { slug: params.slug },
    include: { city: true, locality: true, photos: { take: 1, orderBy: { sortOrder: "asc" } } }
  });
  
  if (!pg) return { title: "PG Not Found" };
  
  const locality = pg.locality?.name || "";
  const city = pg.city?.name || "";
  const gender = pg.genderAllowed === "COED" ? "Boys & Girls" : pg.genderAllowed;
  
  return {
    title: `${pg.title} - Zero Brokerage ${gender} PG in ${locality}, ${city} | PGSathi`,
    description: `Looking for a PG in ${locality}, ${city}? Check out ${pg.title}. ₹${pg.priceMin}/month. Direct Owner. Zero Brokerage. Verified Listing.`,
    openGraph: {
      title: `${pg.title} | Zero Brokerage PG in ${city}`,
      description: `₹${pg.priceMin}/month. Direct Owner. Zero Brokerage. Verified Listing in ${locality}, ${city}.`,
      images: pg.photos?.[0] ? [{ url: pg.photos[0].url }] : [],
    }
  };
}

function getAmenityIcon(iconName: string, amenityName: string) {
  if (iconName && (LucideIcons as any)[iconName]) {
    return (LucideIcons as any)[iconName];
  }
  
  const lower = amenityName.toLowerCase();
  if (lower.includes('power') || lower.includes('backup')) return LucideIcons.BatteryCharging;
  if (lower.includes('mattress') || lower.includes('bed')) return LucideIcons.BedDouble;
  if (lower.includes('ac') || lower.includes('air')) return LucideIcons.Snowflake;
  if (lower.includes('table') || lower.includes('desk')) return LucideIcons.Monitor;
  if (lower.includes('warden')) return LucideIcons.UserCheck;
  if (lower.includes('gym') || lower.includes('fitness')) return LucideIcons.Dumbbell;
  if (lower.includes('securit') || lower.includes('cctv')) return LucideIcons.ShieldCheck;
  if (lower.includes('microwave') || lower.includes('oven')) return LucideIcons.Microwave;
  if (lower.includes('first aid') || lower.includes('medical')) return LucideIcons.BriefcaseMedical;
  if (lower.includes('water') || lower.includes('ro')) return LucideIcons.Droplet;
  if (lower.includes('wifi') || lower.includes('internet')) return LucideIcons.Wifi;
  if (lower.includes('lift') || lower.includes('elevator')) return LucideIcons.ArrowUpDown;
  if (lower.includes('fridge') || lower.includes('refriger')) return LucideIcons.Refrigerator;
  if (lower.includes('wash') || lower.includes('laundry')) return LucideIcons.WashingMachine;
  if (lower.includes('tv') || lower.includes('television')) return LucideIcons.Tv;
  if (lower.includes('clean') || lower.includes('sweep')) return LucideIcons.Sparkles;
  
  return LucideIcons.Zap;
}

export default async function PGDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const session = await auth();
  const userId = session?.user?.id ? parseInt(session.user.id) : null;

  // First try to find active listing
  let pg = await db.listing.findFirst({
    where: { slug: params.slug, isActive: true, status: "ACTIVE" },
    include: {
      city: true,
      locality: true,
      owner: { select: { name: true, phone: true, id: true, avatar: true } },
      photos: { orderBy: { sortOrder: "asc" } },
      amenities: { include: { amenity: true } },
      rooms: { include: { beds: true } },
    },
  });

  // Check preview mode
  if (!pg && userId) {
    pg = await db.listing.findFirst({
      where: { slug: params.slug, ownerId: userId },
      include: {
        city: true,
        locality: true,
        owner: { select: { name: true, phone: true, id: true, avatar: true } },
        photos: { orderBy: { sortOrder: "asc" } },
        amenities: { include: { amenity: true } },
        rooms: { include: { beds: true } },
      },
    });
  }

  if (!pg) notFound();

  // Fetch Similar PGs
  let similarPgs: any[] = [];
  if (pg.localityId) {
    similarPgs = await db.listing.findMany({
      where: {
        id: { not: pg.id },
        localityId: pg.localityId,
        status: "ACTIVE",
        isActive: true,
      },
      include: {
        city: true,
        locality: true,
        photos: { take: 1, orderBy: { sortOrder: "asc" } }
      },
      take: 3
    });
  }

  if (similarPgs.length < 3) {
    const existingIds = similarPgs.map(p => p.id);
    const cityPgs = await db.listing.findMany({
      where: {
        id: { notIn: [pg.id, ...existingIds] },
        cityId: pg.cityId,
        status: "ACTIVE",
        isActive: true,
      },
      include: {
        city: true,
        locality: true,
        photos: { take: 1, orderBy: { sortOrder: "asc" } }
      },
      take: 3 - similarPgs.length
    });
    similarPgs = [...similarPgs, ...cityPgs];
  }

  const totalRoomsCount = pg.totalRooms ?? pg.rooms?.length ?? 0;
  const availableBedsCount = pg.availableBeds ?? 
    (pg.rooms ? pg.rooms.reduce((acc, room) => acc + room.beds.filter(b => !b.isOccupied).length, 0) : 0);

  // Structured Data (JSON-LD) for Rich Snippets
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": pg.title,
    "image": pg.photos.map(p => p.url),
    "description": pg.description,
    "brand": {
      "@type": "Brand",
      "name": "PGSathi"
    },
    "offers": {
      "@type": "Offer",
      "url": `${process.env.NEXT_PUBLIC_APP_URL || "https://pgsathi.in"}/pg/${pg.slug}`,
      "priceCurrency": "INR",
      "price": pg.priceMin,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Person",
        "name": pg.owner.name
      }
    }
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${process.env.NEXT_PUBLIC_APP_URL || "https://pgsathi.in"}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": pg.city?.name || "City",
        "item": `${process.env.NEXT_PUBLIC_APP_URL || "https://pgsathi.in"}/search?city=${pg.city?.slug || ""}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": pg.locality?.name || "Locality",
        "item": `${process.env.NEXT_PUBLIC_APP_URL || "https://pgsathi.in"}/search?locality=${pg.locality?.name || ""}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": pg.title,
        "item": `${process.env.NEXT_PUBLIC_APP_URL || "https://pgsathi.in"}/pg/${pg.slug}`
      }
    ]
  };

  const jsonLd = [productLd, breadcrumbLd];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="bg-[#f8f9fa] min-h-screen py-8">
        <div className="container-max section-padding">
          
          {/* Preview Banner */}
          {pg.status !== "ACTIVE" && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-3 shadow-sm">
              <Clock size={20} className="text-amber-600 shrink-0" />
              <div>
                <p className="font-bold text-amber-800">Preview Mode</p>
                <p className="text-amber-700 text-sm">This listing is currently {pg.status.toLowerCase()}. Only you can see this page until it is approved.</p>
              </div>
            </div>
          )}

          {/* Title Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-orange-100 text-orange-700 text-xs font-black px-3 py-1 rounded-md uppercase tracking-wider">
                {pg.genderAllowed} PG
              </span>
              <span className="bg-neutral-200 text-neutral-700 text-xs font-black px-3 py-1 rounded-md uppercase tracking-wider">
                {pg.pgType.replace("_", " ")}
              </span>
              {pg.isVerified && (
                <span className="bg-green-100 text-green-700 text-xs font-black px-3 py-1 rounded-md flex items-center gap-1 uppercase tracking-wider">
                  <BadgeCheck size={14} /> Verified
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-neutral-900 mb-3 tracking-tight">{pg.title}</h1>
            <p className="flex items-center gap-2 text-neutral-600 font-medium text-base">
              <MapPin size={18} className="text-orange-500" />
              {[pg.address, pg.locality?.name, pg.city?.name].filter(Boolean).join(", ")}
            </p>
          </div>

          {/* Image Gallery */}
          <ImageGallery photos={pg.photos} title={pg.title} />

          <PageNavigation />

          <div className="flex flex-col lg:flex-row gap-10 mt-2">
            {/* Main Content */}
            <div className="flex-1 space-y-10">
              
              {/* Quick Stats Bar */}
              <div id="overview" className="flex flex-wrap gap-4 py-6 border-y border-neutral-200 scroll-mt-32">
                <div className="flex items-center gap-3 pr-8 border-r border-neutral-200">
                  <DoorOpen size={28} className="text-neutral-400" />
                  <div>
                    <div className="text-sm text-neutral-500 font-medium">Total Rooms</div>
                    <div className="font-bold text-neutral-900">{totalRoomsCount || "Not specified"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 pr-8 border-r border-neutral-200">
                  <BedDouble size={28} className="text-neutral-400" />
                  <div>
                    <div className="text-sm text-neutral-500 font-medium">Available Beds</div>
                    <div className="font-bold text-green-600">{availableBedsCount || "Contact Owner"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users size={28} className="text-neutral-400" />
                  <div>
                    <div className="text-sm text-neutral-500 font-medium">Tenant Type</div>
                    <div className="font-bold text-neutral-900 capitalize">{pg.genderAllowed.toLowerCase()} Allowed</div>
                  </div>
                </div>
              </div>

              {/* First-Month Cost Calculator */}
              <div id="charges" className="scroll-mt-32">
                <CostCalculator 
                  rent={pg.priceMin}
                  deposit={pg.securityDeposit}
                  electricity={pg.electricityCharge}
                  maintenance={pg.maintenanceCharge}
                  food={pg.foodCharge}
                  setupFee={pg.setupFee}
                />
              </div>

              {/* Description */}
              <section id="about" className="scroll-mt-32">
                <h2 className="text-2xl font-bold mb-4 text-neutral-900">About this PG</h2>
                <div className="text-neutral-600 whitespace-pre-wrap leading-relaxed text-lg bg-white p-8 rounded-3xl shadow-sm border border-neutral-200/60">
                  {pg.description}
                </div>
              </section>

              {/* Amenities Grid */}
              <section id="amenities" className="scroll-mt-32">
                <h2 className="text-2xl font-bold mb-6 text-neutral-900">Premium Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {pg.amenities.map(a => (
                    <div key={a.amenityId} className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm flex flex-col items-center justify-center text-center gap-3 hover:border-orange-200 hover:shadow-md transition-all">
                      <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-500">
                        {(() => {
                           const IconComp = getAmenityIcon(a.amenity.icon, a.amenity.name);
                           return <IconComp size={24} />;
                        })()}
                      </div>
                      <span className="font-semibold text-neutral-800 text-sm">{a.amenity.name}</span>
                    </div>
                  ))}
                  {pg.amenities.length === 0 && (
                    <p className="text-neutral-500 col-span-full">Standard amenities included. Contact owner for full list.</p>
                  )}
                </div>
              </section>

              {/* Rooms & Beds Availability */}
              {pg.rooms && pg.rooms.length > 0 && (
                <section id="rooms" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold mb-6 text-neutral-900">Rooms & Beds</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pg.rooms.map(room => {
                      const availableBedsInRoom = room.beds.filter(b => !b.isOccupied).length;
                      const isSoldOut = availableBedsInRoom === 0 && room.beds.length > 0;
                      return (
                        <div key={room.id} className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className="font-bold text-lg text-neutral-900 leading-tight">{room.name}</h3>
                                {room.floor && (
                                  <span className="bg-neutral-100 text-neutral-600 text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border border-neutral-200 whitespace-nowrap">
                                    {room.floor}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                {room.type.replace('_', ' ')}
                              </span>
                            </div>
                            {isSoldOut ? (
                              <span className="bg-neutral-100 text-neutral-500 text-xs font-bold px-3 py-1 rounded-full">Sold Out</span>
                            ) : (
                              <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                                {availableBedsInRoom} Available
                              </span>
                            )}
                          </div>
                          
                          {room.beds.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {room.beds.map(bed => (
                                <div 
                                  key={bed.id} 
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                                    bed.isOccupied 
                                      ? "bg-neutral-50 border-neutral-200 text-neutral-400" 
                                      : "bg-white border-green-200 text-green-700 hover:bg-green-50"
                                  }`}
                                >
                                  <BedDouble size={14} />
                                  {bed.name}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-neutral-400">No beds configured yet</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* House Rules & Facilities - Premium Do's and Don'ts Style */}
              <section id="rules" className="scroll-mt-32">
                <h2 className="text-2xl font-bold mb-6 text-neutral-900">House Rules & Facilities</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Food */}
                  <div className="bg-white p-5 rounded-2xl border border-neutral-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Coffee className="text-neutral-400" />
                      <span className="font-semibold text-neutral-700">Food / Meals</span>
                    </div>
                    {pg.foodIncluded ? (
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">Included</span>
                    ) : (
                      <span className="bg-neutral-100 text-neutral-500 text-xs font-bold px-3 py-1 rounded-full">Not Included</span>
                    )}
                  </div>

                  {/* Parking */}
                  <div className="bg-white p-5 rounded-2xl border border-neutral-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Car className="text-neutral-400" />
                      <span className="font-semibold text-neutral-700">Parking</span>
                    </div>
                    {pg.parking ? (
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">Available</span>
                    ) : (
                      <span className="bg-neutral-100 text-neutral-500 text-xs font-bold px-3 py-1 rounded-full">No Parking</span>
                    )}
                  </div>

                  {/* Gate Closing */}
                  <div className="bg-white p-5 rounded-2xl border border-neutral-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="text-neutral-400" />
                      <span className="font-semibold text-neutral-700">Gate Closing</span>
                    </div>
                    {pg.gateClosingTime ? (
                      <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">Strict Rules</span>
                    ) : (
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">Flexible</span>
                    )}
                  </div>

                  {/* Notice Period */}
                  <div className="bg-white p-5 rounded-2xl border border-neutral-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CalendarX className="text-neutral-400" />
                      <span className="font-semibold text-neutral-700">Notice Period</span>
                    </div>
                    {pg.noticePeriod ? (
                      <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">Required</span>
                    ) : (
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">No Notice</span>
                    )}
                  </div>

                  {/* Lock In */}
                  <div className="bg-white p-5 rounded-2xl border border-neutral-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="text-neutral-400" />
                      <span className="font-semibold text-neutral-700">Rent Lock-In</span>
                    </div>
                    {pg.rentLockIn ? (
                      <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">Applicable</span>
                    ) : (
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">Flexible</span>
                    )}
                  </div>

                  {/* Guardians */}
                  <div className="bg-white p-5 rounded-2xl border border-neutral-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="text-neutral-400" />
                      <span className="font-semibold text-neutral-700">Guardians Stay</span>
                    </div>
                    {pg.noGuardiansStay ? (
                      <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><Ban size={12}/> Not Allowed</span>
                    ) : (
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">Allowed</span>
                    )}
                  </div>
                </div>
              </section>
            </div>

            {/* Sticky Sidebar (Glassmorphic Pricing Card) */}
            <aside className="w-full lg:w-96 shrink-0 relative">
              <div className="sticky top-28 bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl border border-white">
                
                <div className="mb-6 pb-6 border-b border-neutral-200/60">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-neutral-900">₹{pg.priceMin}</span>
                    <span className="text-neutral-500 font-medium mb-1">/ month</span>
                  </div>
                  <div className="mt-2 text-sm text-neutral-500 font-medium flex items-center gap-2">
                    <ShieldCheck size={16} className="text-green-500" /> 
                    Security Deposit: {pg.securityDeposit ? `₹${pg.securityDeposit}` : "1 Month Rent"}
                  </div>
                </div>

                {/* Owner Info Box inside Sidebar */}
                <div className="bg-neutral-50 rounded-2xl p-4 mb-6 border border-neutral-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center font-bold text-neutral-600 overflow-hidden">
                    {pg.owner.avatar ? (
                      <img src={pg.owner.avatar} alt="Owner" className="w-full h-full object-cover" />
                    ) : (
                      pg.owner.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-0.5">Listed By Owner</div>
                    <div className="font-bold text-neutral-900">{pg.owner.name}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <BookVisitModal 
                    listingId={pg.id} 
                    ownerName={pg.owner.name} 
                  />
                  <ContactOwnerButton 
                    listingId={pg.id} 
                    ownerPhone={pg.owner.phone || ""} 
                    listingTitle={pg.title} 
                  />
                </div>

                <div className="mt-6 pt-6 border-t border-neutral-200/60 text-sm text-neutral-500 text-center flex flex-col gap-3">
                  <div className="flex items-center justify-center gap-2 font-bold text-neutral-700">
                    <Maximize2 size={16} /> Zero Brokerage
                  </div>
                  <p className="text-xs text-neutral-400">By contacting, you agree to PGSathi's Terms of Service.</p>
                </div>
              </div>
            </aside>
          </div>

          {/* Similar PGs Section */}
          {similarPgs.length > 0 && (
            <div id="similar" className="mt-16 pt-10 border-t border-neutral-200 scroll-mt-32">
              <h2 className="text-2xl font-bold mb-6 text-neutral-900">
                Similar PGs in {pg.locality?.name || pg.city?.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarPgs.map((similarPg) => (
                  <PGCard key={similarPg.id} pg={similarPg} />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
