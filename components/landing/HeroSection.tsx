import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, MapPin, MessageCircle, Star } from "lucide-react";
import SearchBar from "@/components/landing/SearchBar";
import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";

const getHeroData = unstable_cache(
  async () => {
    const [cities, showcase] = await Promise.all([
      db.city.findMany({
        where: { isActive: true },
        orderBy: { priority: "desc" },
      }),
      db.listing.findMany({
        where: { isActive: true, status: "ACTIVE", photos: { some: {} } },
        take: 2,
        include: {
          city: true,
          locality: true,
          photos: { take: 1, orderBy: { sortOrder: "asc" } },
        },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      }),
    ]);
    return { cities, showcase };
  },
  ["hero-data"],
  { revalidate: 300 }
);

export default async function HeroSection() {
  const { cities, showcase } = await getHeroData();

  return (
    <section className="relative bg-neutral-50 pt-8 pb-12 sm:pt-12 sm:pb-16 md:pt-16 md:pb-24 overflow-hidden">
      {/* Faint grid texture, kept subtle — this is the only decorative element */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#171717 1px, transparent 1px), linear-gradient(90deg, #171717 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="container-max section-padding relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-8 items-center">
          {/* ── Left: Copy + Search ─────────────────────────────── */}
          <div>
            <div className="inline-flex items-center gap-2 text-xs md:text-sm font-bold text-primary-700 uppercase tracking-widest mb-5">
              <span className="w-6 h-px bg-primary-600" />
              Zero Brokerage · Direct Owner Contact
            </div>

            <h1
              className="text-[2.25rem] sm:text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold text-neutral-900 leading-[1.1] mb-4 sm:mb-5"
              style={{ textWrap: "balance" }}
            >
              Find your next PG —{" "}
              <span className="text-primary-700">straight from the owner.</span>
            </h1>

            <p className="text-base md:text-lg text-neutral-600 mb-8 max-w-xl leading-relaxed">
              Verified Boys, Girls &amp; Co-living PGs across India. No brokers,
              no hidden fees — just a phone number that actually picks up.
            </p>

            <div className="bg-white p-2 md:p-2.5 rounded-2xl border border-neutral-200 shadow-lg shadow-neutral-900/5 mb-8">
              <SearchBar cities={cities} />
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
              <span className="font-bold text-neutral-900">500+ <span className="font-medium text-neutral-500">Verified PGs</span></span>
              <span className="w-1 h-1 rounded-full bg-neutral-300 hidden sm:block" />
              <span className="font-bold text-neutral-900">12+ <span className="font-medium text-neutral-500">Cities</span></span>
              <span className="w-1 h-1 rounded-full bg-neutral-300 hidden sm:block" />
              <span className="font-bold text-neutral-900">50,000+ <span className="font-medium text-neutral-500">Tenants Helped</span></span>
            </div>
          </div>

          {/* ── Right: Real listing showcase ────────────────────── */}
          <div className="hidden lg:block relative h-[440px]">
            {showcase[0] && (
              <ShowcaseCard
                listing={showcase[0]}
                className="absolute top-0 right-0 w-[280px] -rotate-2 z-10"
              />
            )}
            {showcase[1] && (
              <ShowcaseCard
                listing={showcase[1]}
                className="absolute bottom-0 left-0 w-[280px] rotate-2"
              />
            )}
            {!showcase[0] && !showcase[1] && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center bg-white rounded-3xl border border-neutral-200 p-10 shadow-lg shadow-neutral-900/5">
                  <ShieldCheck className="mx-auto text-primary-600 mb-3" size={40} />
                  <p className="font-bold text-neutral-900">100% Verified Listings</p>
                  <p className="text-sm text-neutral-500 mt-1">Every PG physically checked before it goes live.</p>
                </div>
              </div>
            )}

            {/* Floating review chip, anchored between the two cards */}
            {showcase[0] && showcase[1] && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white rounded-2xl border border-neutral-200 shadow-xl px-4 py-3 flex items-center gap-2.5">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => <Star key={i} size={13} fill="currentColor" />)}
                </div>
                <span className="text-xs font-bold text-neutral-700 whitespace-nowrap">Rated by real tenants</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ShowcaseCard({ listing, className }: { listing: any; className: string }) {
  const photo = listing.photos?.[0]?.url;
  return (
    <Link
      href={`/pg/${listing.city?.slug}/${listing.locality?.slug || "all"}/${listing.slug}`}
      className={`block bg-white rounded-2xl border border-neutral-200 shadow-xl shadow-neutral-900/10 overflow-hidden hover:-translate-y-1 hover:rotate-0 transition-all duration-300 ${className}`}
    >
      <div className="relative h-36 bg-neutral-100">
        {photo && (
          <Image
            src={photo}
            alt={listing.title}
            fill
            sizes="280px"
            priority
            className="object-cover"
          />
        )}
        <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur text-[10px] font-bold text-primary-700 px-2 py-1 rounded-lg flex items-center gap-1">
          <ShieldCheck size={11} /> VERIFIED
        </div>
      </div>
      <div className="p-3.5">
        <p className="font-bold text-neutral-900 text-sm line-clamp-1">{listing.title}</p>
        <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
          <MapPin size={11} className="shrink-0" />
          <span className="line-clamp-1">{listing.locality?.name || listing.city?.name}</span>
        </p>
        <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-neutral-100">
          <span className="font-extrabold text-neutral-900 text-sm">₹{listing.priceMin.toLocaleString("en-IN")}<span className="font-medium text-neutral-400 text-xs">/mo</span></span>
          <span className="flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2 py-1 rounded-md">
            <MessageCircle size={11} /> Contact
          </span>
        </div>
      </div>
    </Link>
  );
}
