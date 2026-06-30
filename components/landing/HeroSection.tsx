import Link from "next/link";
import { ShieldCheck, MapPin, Home as HomeIcon } from "lucide-react";
import SearchBar from "@/components/landing/SearchBar";
import { db } from "@/lib/db";

export default async function HeroSection() {
  const cities = await db.city.findMany({
    where: { isActive: true },
    orderBy: { priority: "desc" },
  });
  return (
    <section className="relative overflow-hidden bg-primary-950 text-white pt-16 pb-24 md:pt-28 md:pb-32">
      {/* Premium Deep Background with Mesh Glow */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-500/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      </div>

      {/* Original Background Pattern but with a premium fade */}
      <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-primary-950/90 pointer-events-none"></div>

      <div className="container-max section-padding relative z-10 text-left md:text-center px-4 md:px-8">
        
        {/* Premium Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-xs md:text-sm font-medium mb-8 animate-fade-in shadow-[0_4px_24px_-8px_rgba(255,255,255,0.1)] transition-all hover:bg-white/10 cursor-default">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <span className="text-neutral-200 tracking-wide">Trusted by <strong className="text-white">50,000+</strong> Students & Professionals in NCR</span>
        </div>

        {/* Heading with better typography & gradient */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight animate-slide-up text-white leading-[1.1]" style={{ textWrap: "balance" }}>
          Find Your <br className="hidden sm:block md:hidden" />
          <span className="relative inline-block">
            <span className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-500 blur-lg opacity-30"></span>
            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500">
              Zero Brokerage PG
            </span>
          </span> 
          <br className="hidden md:block" /> in Delhi NCR
        </h1>
        
        <h2 className="text-lg md:text-2xl font-light text-neutral-300 mb-12 mr-auto md:mx-auto max-w-3xl animate-slide-up leading-relaxed" style={{ animationDelay: "100ms", textWrap: "balance" }}>
          India's most trusted platform for verified Boys & Girls PGs. 
          <span className="block mt-1 font-medium text-white/80">Direct owner contact. No hidden fees.</span>
        </h2>

        {/* Search Bar Container with Glassmorphism */}
        <div className="max-w-4xl mr-auto md:mx-auto animate-slide-up relative" style={{ animationDelay: "200ms" }}>
          {/* Subtle glow behind the search bar */}
          <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 via-purple-500/20 to-orange-500/20 blur-2xl opacity-50 rounded-[3rem] -z-10"></div>
          
          <div className="p-2 md:p-3 bg-white/5 backdrop-blur-2xl border border-white/15 rounded-3xl md:rounded-[2.5rem] shadow-2xl">
            <SearchBar cities={cities} />
          </div>
        </div>

        {/* Feature Highlights - Premium styling */}
        <div className="mt-20 flex flex-col sm:flex-row flex-wrap justify-start md:justify-center gap-6 md:gap-10 animate-fade-in" style={{ animationDelay: "400ms" }}>
          {[
            { icon: ShieldCheck, title: "100% Verified", desc: "Physical verification" },
            { icon: HomeIcon, title: "No Brokerage", desc: "Direct owner contact" },
            { icon: MapPin, title: "Prime Locations", desc: "Near hubs & colleges" },
          ].map((item, idx) => (
            <div key={idx} className="group flex items-center gap-4 text-left p-4 rounded-2xl transition-all duration-300 hover:bg-white/5 border border-transparent hover:border-white/10 hover:shadow-2xl">
              <div className="bg-gradient-to-br from-orange-400/20 to-orange-600/10 p-3.5 rounded-xl border border-orange-500/20 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                <item.icon size={26} className="text-orange-400" strokeWidth={1.5} />
              </div>
              <div>
                <div className="font-semibold text-white text-lg tracking-tight group-hover:text-orange-300 transition-colors">{item.title}</div>
                <div className="text-sm text-neutral-400 font-medium">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
