import Link from "next/link";
import { Handshake, ArrowRight } from "lucide-react";

export default function PartnerBanner() {
  return (
    <section className="bg-white py-10 sm:py-16">
      <div className="container-max section-padding">
        <div className="bg-gradient-to-r from-primary-600 to-violet-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 sm:gap-8 shadow-xl">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-black/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>
          
          <div className="relative z-10 text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 text-white text-xs sm:text-sm font-bold rounded-full mb-3 sm:mb-4 border border-white/30 backdrop-blur-sm">
              <Handshake size={14} className="sm:w-4 sm:h-4" /> Partner Program
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white mb-3 sm:mb-4 tracking-tight leading-[1.15]">
              Know a PG Owner? <br className="hidden md:block" />
              Refer them and Earn Money!
            </h2>
            <p className="text-white/90 text-sm sm:text-base md:text-lg leading-relaxed">
              Join the PGSathi Partner Program. Help PG owners digitize their business and earn recurring commissions for every successful onboarding. Zero investment required.
            </p>
          </div>
          
          <div className="relative z-10 w-full sm:w-auto shrink-0">
            <Link 
              href="/partner"
              className="bg-white text-primary-700 hover:bg-neutral-50 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 text-base sm:text-lg w-full sm:w-auto active:scale-[0.98]"
            >
              Become a Partner <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
