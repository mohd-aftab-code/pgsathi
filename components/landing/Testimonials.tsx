import Image from "next/image";
import { Star } from "lucide-react";

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
    <section className="py-20 md:py-24 bg-primary-950 text-white">
      <div className="container-max section-padding">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-14">
          <div>
            <div className="inline-flex items-center gap-2.5 text-xs font-bold text-primary-300 uppercase tracking-widest mb-4">
              <span className="w-6 h-px bg-primary-400" />
              Real Stories
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight" style={{ textWrap: "balance" }}>
              Loved by tenants and owners
            </h2>
          </div>
          <p className="text-primary-200/70 text-base max-w-sm">
            Thousands have found a home or grown their PG business with PGSathi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-primary-950 p-8">
              <div className="flex gap-0.5 text-orange-400 mb-6">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={15} fill="currentColor" />
                ))}
              </div>
              <p className="text-[1.05rem] leading-relaxed mb-8 text-primary-50">{t.text}</p>

              <div className="flex items-center gap-3 pt-6 border-t border-white/10">
                <Image src={t.image} alt={t.name} width={44} height={44} className="w-11 h-11 rounded-full object-cover" />
                <div>
                  <h4 className="font-bold text-white text-sm">{t.name}</h4>
                  <p className="text-xs text-primary-300 font-medium">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
