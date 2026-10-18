import { ChevronDown, MessageCircleQuestion } from "lucide-react";
import Link from "next/link";

const FAQS = [
  {
    q: "Is finding a PG on PGSathi really zero brokerage?",
    a: "Yes. We never charge any fees from tenants — from searching to getting the owner's number, everything is completely free. PG owners subscribe for listings and leads, which keeps the platform running. You do not pay brokerage at any stage.",
  },
  {
    q: "How are the listings verified?",
    a: "Our team reviews every new PG before the listing goes live — we check the address, photos, and owner details. Verified listings have a \"VERIFIED\" badge, so you can proceed with confidence.",
  },
  {
    q: "How do I contact the PG owner?",
    a: "You will find a \"Contact Owner\" or WhatsApp button on every listing — you connect directly to the owner's phone number, with no middlemen. You can also call or book a visit.",
  },
  {
    q: "Can I pay rent online through PGSathi?",
    a: "Currently, PGSathi is a discovery platform — we help you find the right PG and connect directly with the owner. You settle rent payments directly with the owner (cash, UPI, or whatever method you both decide).",
  },
  {
    q: "What if the PG doesn't look like the photos?",
    a: "We verify listings, but always make a physical visit before making a final decision — every listing has an option to book a visit. If you find a mismatch, report it to us, and we will review the listing again.",
  },
  {
    q: "How safe are the PGs for girls?",
    a: "Girls' PGs can be filtered separately, and most have a warden/security setup — details are available on every listing page. We recommend you visit yourself and ask the owner directly about safety measures before making a final decision.",
  },
  {
    q: "I am a PG owner — how do I list my property?",
    a: "Click on \"List Your PG\", enter your property details and photos — basic listing is free. For more leads and a complete PG-management dashboard, paid plans are available, which include a 15-day free trial.",
  },
];

export default function FAQ() {
  return (
    <section className="py-12 md:py-24 bg-white border-t border-neutral-100">
      <div className="container-max section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-8 lg:gap-16">
          {/* Left: intro */}
          <div>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4 sm:mb-5">
              <MessageCircleQuestion size={20} className="sm:w-[22px] sm:h-[22px]" />
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-neutral-900 mb-3 sm:mb-4 tracking-tight">
              Common Questions
            </h2>
            <p className="text-neutral-500 leading-relaxed mb-4 sm:mb-6 max-w-sm text-sm sm:text-base">
              Some things people ask before using PGSathi. Have any other questions?
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-primary-700 hover:text-primary-800 transition-colors"
            >
              Contact Us →
            </Link>
          </div>

          {/* Right: accordion — plain <details>, no JS needed */}
          <div className="divide-y divide-neutral-200 border-y border-neutral-200">
            {FAQS.map((item, idx) => (
              <details key={idx} className="group py-4 sm:py-5">
                <summary className="flex items-center justify-between gap-3 sm:gap-4 cursor-pointer list-none">
                  <span className="font-bold text-neutral-900 text-sm sm:text-base md:text-lg">{item.q}</span>
                  <ChevronDown
                    size={18}
                    className="shrink-0 text-neutral-400 transition-transform duration-300 group-open:rotate-180 group-open:text-primary-600"
                  />
                </summary>
                <p className="text-neutral-600 leading-relaxed mt-2.5 sm:mt-3 pr-2 sm:pr-8 text-xs sm:text-sm">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
