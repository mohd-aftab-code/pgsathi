import HeroSection from "@/components/landing/HeroSection";
import CityGrid from "@/components/landing/CityGrid";
import HowItWorks from "@/components/landing/HowItWorks";
import FeaturedListings from "@/components/landing/FeaturedListings";
import Testimonials from "@/components/landing/Testimonials";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <>
      <HeroSection />
      
      {/* Search Bar Overflow Offset */}
      <div className="bg-neutral-50 h-8 -mt-8 relative z-0"></div>
      
      <CityGrid />
      <HowItWorks />
      
      {/* Featured PGs Section */}
      <Suspense fallback={<div className="h-96 bg-neutral-100 flex items-center justify-center animate-pulse">Loading featured PGs...</div>}>
        <FeaturedListings />
      </Suspense>

      <Testimonials />

      {/* CTA Section for Owners */}
      <section className="py-28 bg-gradient-to-br from-primary-950 via-primary-900 to-primary-950 text-white relative overflow-hidden">
        {/* Premium Abstract shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] rounded-full bg-primary-600/20 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] rounded-full bg-orange-600/20 blur-[100px] pointer-events-none"></div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>

        <div className="container-max section-padding relative z-10">
          <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-2xl border border-white/10 p-10 md:p-16 rounded-[2.5rem] shadow-2xl flex flex-col items-center text-center">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-6 text-white tracking-tight">
              PG Owner हैं? <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500">PGSathi पर List करें!</span>
            </h2>
            <p className="text-lg md:text-xl text-primary-200 mb-10 max-w-2xl leading-relaxed">
              Join 10,000+ PG owners who are getting verified leads directly on WhatsApp. 
              Manage your PG, track views, and grow your business with zero commission.
            </p>
            
            <ul className="grid grid-cols-2 md:grid-cols-2 gap-x-4 md:gap-x-12 gap-y-4 md:gap-y-6 mb-12 text-left">
              {[
                "100% Free Basic Listing",
                "Direct WhatsApp Leads",
                "No Brokerage / Commission",
                "Easy Dashboard Management"
              ].map((benefit, idx) => (
                <li key={idx} className="flex items-center gap-3 md:gap-4 font-medium text-primary-50 bg-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5 shadow-sm text-xs md:text-base">
                  <CheckCircle2 className="text-orange-400 shrink-0" size={20} />
                  {benefit}
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-5 w-full md:w-auto">
              <Link href="/dashboard/owner/listings/new" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-xl shadow-orange-500/25 px-10 py-5 rounded-2xl font-bold transition-all hover:scale-105 flex items-center justify-center gap-3 text-lg">
                List Your PG Now <ArrowRight size={22} />
              </Link>
              <Link href="/pricing" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-10 py-5 rounded-2xl font-bold transition-all flex items-center justify-center text-lg backdrop-blur-md">
                View Pricing Plans
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
