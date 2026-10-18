import { Search, ShieldCheck, Map, PhoneCall } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "Search PGs",
      desc: "Find PGs by city, locality, budget, and amenities using our smart filters.",
    },
    {
      icon: ShieldCheck,
      title: "Check Details",
      desc: "View photos, amenities, pricing, and verified reviews from other tenants.",
    },
    {
      icon: PhoneCall,
      title: "Contact Owner",
      desc: "Directly call or WhatsApp the PG owner. Zero broker fees involved.",
    },
    {
      icon: Map,
      title: "Visit & Shift",
      desc: "Visit the property using Google Maps link and move in hassle-free.",
    },
  ];

  return (
    <section className="py-12 md:py-20 bg-white border-t border-neutral-100">
      <div className="container-max section-padding">
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-neutral-900 mb-2 sm:mb-4 tracking-tight">How PGSathi Works</h2>
        <p className="section-subtitle mb-8 sm:mb-14 max-w-2xl text-left text-sm sm:text-base">
          Finding your perfect PG is now easier than ever. Follow these simple steps to move into your new home.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10">
          {steps.map((step, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 border border-neutral-200/80 sm:border-neutral-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden"
            >
              {/* Subtle hover gradient */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Icon */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300 relative z-10">
                <step.icon size={24} className="sm:w-7 sm:h-7" />
              </div>
              
              {/* Background Step Number */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 text-4xl sm:text-5xl font-black text-neutral-100 sm:text-neutral-50 group-hover:text-primary-50 transition-colors duration-300 select-none z-0">
                0{idx + 1}
              </div>

              {/* Content */}
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-2 relative z-10">{step.title}</h3>
              <p className="text-neutral-500 leading-relaxed text-xs sm:text-sm relative z-10">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
