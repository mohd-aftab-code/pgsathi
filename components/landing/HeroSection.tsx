import Link from "next/link";
import { ShieldCheck, MapPin, Home as HomeIcon } from "lucide-react";
import SearchBar from "@/components/landing/SearchBar";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-primary-950 text-white pt-20 pb-28">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-primary-950/90 pointer-events-none"></div>

      <div className="container-max section-padding relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium mb-8 animate-fade-in">
          <span className="flex h-2 w-2 rounded-full bg-green-400"></span>
          Trusted by 50,000+ Students & Professionals
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight animate-slide-up text-white drop-shadow-md" style={{ textWrap: "balance" }}>
          Apna PG, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 drop-shadow-sm">Apna Sathi</span>
        </h1>
        
        <p className="text-lg md:text-xl text-primary-100 mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "100ms" }}>
          India's most trusted platform for verified PGs. Zero brokerage, transparent pricing, and direct owner contact.
        </p>

        {/* Real Search Bar Component */}
        <div className="max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: "200ms" }}>
          <SearchBar />
        </div>

        {/* Feature Highlights */}
        <div className="mt-16 flex flex-wrap justify-center gap-6 md:gap-12 animate-fade-in" style={{ animationDelay: "400ms" }}>
          {[
            { icon: ShieldCheck, title: "100% Verified", desc: "Physical verification" },
            { icon: HomeIcon, title: "No Brokerage", desc: "Direct owner contact" },
            { icon: MapPin, title: "Prime Locations", desc: "Near hubs & colleges" },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 text-left">
              <div className="bg-primary-800 p-3 rounded-xl">
                <item.icon size={24} className="text-orange-400" />
              </div>
              <div>
                <div className="font-bold text-white">{item.title}</div>
                <div className="text-sm text-primary-200">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
