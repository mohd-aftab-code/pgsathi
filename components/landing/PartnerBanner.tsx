import Link from "next/link";
import { Handshake, ArrowRight } from "lucide-react";

export default function PartnerBanner() {
  return (
    <section className="bg-white py-16">
      <div className="container-max section-padding">
        <div className="bg-gradient-to-r from-primary-600 to-violet-600 rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-xl">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-black/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
          
          <div className="relative z-10 text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 text-white text-sm font-bold rounded-full mb-4 border border-white/30 backdrop-blur-sm">
              <Handshake size={16} /> Partner Program
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight leading-[1.1]">
              Know a PG Owner? <br className="hidden md:block" />
              Refer them and Earn Money!
            </h2>
            <p className="text-white/90 text-lg">
              Join the PGSathi Partner Program. Help PG owners digitize their business and earn high commissions for every successful onboarding. Zero investment required.
            </p>
          </div>
          
          <div className="relative z-10 shrink-0">
            <Link 
              href="/partner"
              className="bg-white text-primary-700 hover:bg-neutral-50 px-8 py-4 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 text-lg"
            >
              Become a Partner <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
