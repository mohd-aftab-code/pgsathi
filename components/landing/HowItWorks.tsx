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
    <section className="py-20 bg-white border-t border-neutral-100">
      <div className="container-max section-padding text-center">
        <h2 className="section-title mb-4">How PGSathi Works</h2>
        <p className="section-subtitle mx-auto mb-16 max-w-2xl">
          Finding your perfect PG is now easier than ever. Follow these simple steps to move into your new home.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-neutral-100 -z-10"></div>

          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center group relative bg-white p-2">
              <div className="w-24 h-24 rounded-full bg-primary-50 flex items-center justify-center mb-6 group-hover:bg-primary-600 transition-colors duration-300 shadow-sm border-8 border-white">
                <step.icon size={36} className="text-primary-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <div className="bg-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm text-neutral-500 border border-neutral-200 absolute top-0 right-1/4 translate-x-4 shadow-sm group-hover:bg-secondary-500 group-hover:text-white group-hover:border-secondary-500 transition-colors">
                {idx + 1}
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-neutral-500 text-sm leading-relaxed max-w-[240px]">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
