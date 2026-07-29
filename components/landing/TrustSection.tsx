import { ShieldCheck, IndianRupee, Clock, Home } from "lucide-react";

export default function TrustSection() {
  const features = [
    {
      icon: IndianRupee,
      title: "100% Zero Brokerage",
      desc: "No hidden charges, no broker fees. Connect directly with owners and save a month's rent.",
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      icon: ShieldCheck,
      title: "Verified Listings Only",
      desc: "Every PG is manually verified by our team — from address to photos, ensuring 100% genuine properties.",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: Home,
      title: "Premium Amenities",
      desc: "AC, WiFi, Food, Laundry — choose the best facilities that fit your budget and requirements.",
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      icon: Clock,
      title: "Instant Connection",
      desc: "Call or WhatsApp the PG owner directly without any delays. Fast and transparent booking process.",
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <section className="py-24 bg-neutral-50 border-t border-neutral-100">
      <div className="container-max section-padding">
        <div className="max-w-3xl mb-16 text-left">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-bold tracking-wide uppercase mb-4">
            Why Choose PGSathi?
          </span>
          <h2 className="section-title mb-4 text-left">
            Finding a PG is Now <span className="text-primary-600">Smart and Free</span>
          </h2>
          <p className="section-subtitle max-w-2xl text-left">
            Forget about brokers. PGSathi connects you directly with verified PG owners. Safe, secure, and hassle-free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6`}>
                <feature.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">{feature.title}</h3>
              <p className="text-neutral-500 leading-relaxed text-sm">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
