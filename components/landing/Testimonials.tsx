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
    <section className="py-24 bg-gradient-to-b from-primary-950 via-primary-900 to-primary-950 text-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary-600 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-secondary-600 blur-[100px] opacity-50"></div>
      </div>

      <div className="container-max section-padding relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium mb-6 text-primary-100">
            <span className="flex h-2 w-2 rounded-full bg-orange-400"></span>
            Real Stories, Real Trust
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-white tracking-tight">Loved by Tenants and Owners</h2>
          <p className="text-primary-200 text-lg md:text-xl">
            Join thousands of users who have found their perfect home or grown their PG business with PGSathi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-3xl p-8 relative transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-2 group">
              <div className="absolute -top-5 -right-5 text-9xl text-white/5 font-serif group-hover:text-white/10 transition-colors">"</div>
              
              <div className="flex gap-1 text-orange-400 mb-8 relative z-10">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={20} fill="currentColor" />
                ))}
              </div>
              <p className="text-lg leading-relaxed mb-10 text-primary-50 relative z-10">"{t.text}"</p>
              
              <div className="flex items-center gap-4 mt-auto border-t border-white/10 pt-6 relative z-10">
                <img src={t.image} alt={t.name} className="w-14 h-14 rounded-full border-2 border-primary-400 object-cover" />
                <div>
                  <h4 className="font-bold text-white text-lg">{t.name}</h4>
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
