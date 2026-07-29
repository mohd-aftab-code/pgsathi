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
    <section className="py-20 md:py-28 bg-primary-950 text-white relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/20 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3"></div>

      <div className="container-max section-padding relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 md:mb-24">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 text-primary-200 text-sm font-bold uppercase tracking-widest rounded-full mb-6 border border-white/10 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-primary-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
              Real Stories
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1]" style={{ textWrap: "balance" }}>
              Loved by Tenants <br className="hidden md:block" />
              <span className="text-primary-300">and PG Owners</span>
            </h2>
          </div>
          <p className="text-primary-100/70 text-lg md:text-xl max-w-sm leading-relaxed">
            Thousands have found a home or grown their PG business with PGSathi. Here's what they have to say.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t, idx) => (
            <div 
              key={t.id} 
              className={`bg-white/5 border border-white/10 rounded-3xl p-8 relative group hover:bg-white/10 hover:-translate-y-2 transition-all duration-300 backdrop-blur-sm ${idx === 1 ? 'md:-translate-y-6' : ''}`}
            >
              {/* Decorative Quote Icon */}
              <div className="absolute top-6 right-6 text-white/5 group-hover:text-primary-500/10 transition-colors duration-300">
                <Quote size={80} className="rotate-180" />
              </div>

              <div className="flex gap-1 text-amber-400 mb-8 relative z-10">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" />
                ))}
              </div>
              <p className="text-lg leading-relaxed mb-10 text-primary-50 relative z-10">"{t.text}"</p>

              <div className="flex items-center gap-4 pt-6 border-t border-white/10 relative z-10 mt-auto">
                <div className="relative">
                  <Image src={t.image} alt={t.name} width={48} height={48} className="w-12 h-12 rounded-full object-cover border-2 border-primary-500/30" />
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-primary-950"></div>
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">{t.name}</h4>
                  <p className="text-sm text-primary-300 font-medium">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
