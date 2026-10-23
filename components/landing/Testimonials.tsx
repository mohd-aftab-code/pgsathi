import Image from "next/image";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Rahul Sharma",
    role: "Engineering Student",
    image: "https://i.pravatar.cc/150?img=11",
    text: "Found an amazing PG near my college within 2 hours of searching. The best part? No brokerage fees! Saved me almost ₹8,000.",
    rating: 5,
  },
  {
    id: 2,
    name: "Priya Patel",
    role: "IT Professional",
    image: "https://i.pravatar.cc/150?img=5",
    text: "The verified badges gave me peace of mind. The PG I selected looked exactly like the photos. Highly recommend PGSathi.",
    rating: 5,
  },
  {
    id: 3,
    name: "Vikram Singh",
    role: "PG Owner",
    image: "https://i.pravatar.cc/150?img=68",
    text: "Since I listed my property on PGSathi's Pro plan, my occupancy is at 100%. The direct WhatsApp leads are game changing.",
    rating: 5,
  }
];

export default function Testimonials() {
  return (
    <section className="py-12 md:py-24 bg-primary-950 text-white relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/20 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3"></div>

      <div className="container-max section-padding relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-14">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-primary-200 text-xs sm:text-sm font-bold uppercase tracking-widest rounded-full mb-3 sm:mb-5 border border-white/10 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-primary-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
              Real Stories
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] text-balance" >
              Loved by Tenants <br className="hidden md:block" />
              <span className="text-primary-300">and PG Owners</span>
            </h2>
          </div>
          <p className="text-primary-100/70 text-sm sm:text-base md:text-lg max-w-sm leading-relaxed">
            Thousands have found a home or grown their PG business with PGSathi. Here's what they have to say.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {testimonials.map((t, idx) => (
            <div 
              key={t.id} 
              className={`bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 relative group hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm ${idx === 1 ? 'md:-translate-y-4' : ''}`}
            >
              {/* Decorative Quote Icon */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/5 group-hover:text-primary-500/10 transition-colors duration-300 pointer-events-none">
                <Quote size={60} className="rotate-180 sm:w-20 sm:h-20" />
              </div>

              <div className="flex gap-1 text-amber-400 mb-4 sm:mb-6 relative z-10">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" className="sm:w-[18px] sm:h-[18px]" />
                ))}
              </div>
              <p className="text-sm sm:text-base leading-relaxed mb-6 sm:mb-8 text-primary-50 relative z-10">"{t.text}"</p>

              <div className="flex items-center gap-3.5 pt-4 sm:pt-6 border-t border-white/10 relative z-10 mt-auto">
                <div className="relative">
                  <Image src={t.image} alt={t.name} width={44} height={44} className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-primary-500/30" />
                  <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-primary-950"></div>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base">{t.name}</h3>
                  <p className="text-xs sm:text-sm text-primary-300 font-medium">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
