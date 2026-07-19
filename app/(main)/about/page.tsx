import Link from "next/link";
import { CheckCircle2, ShieldCheck, Heart, MapPin, Users, Building2, TrendingUp, Smartphone } from "lucide-react";
import Image from "next/image";
import heroImg from "@/app/assets/images/hero-home.png"; // We can reuse an existing image or just use CSS gradients

export const metadata = {
  title: "About Us | PGSathi - Zero Brokerage PG & Cloud CRM for Owners",
  description: "PGSathi is India's most trusted platform for finding verified PGs without brokers. For PG owners, we provide a powerful Cloud CRM to manage tenants, rent, and leads.",
  keywords: "PG, paying guest, zero brokerage PG, PG management software, CRM for PG owners, find PG, rent room",
  openGraph: {
    title: "About Us | PGSathi",
    description: "Find verified PGs with zero brokerage or manage your PG properties with our powerful Cloud CRM.",
    url: "https://pgsathi.in/about",
    siteName: "PGSathi",
    locale: "en_IN",
    type: "website",
  }
};

export default function AboutPage() {
  return (
    <div className="bg-neutral-50 min-h-screen">
      
      {/* ── Hero Section ── */}
      <section className="bg-white border-b border-neutral-200 py-16 md:py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
        
        <div className="container-max section-padding relative z-10 text-left">
          <div className="max-w-4xl">
            <span className="inline-block py-1.5 px-4 rounded-full bg-violet-50 text-violet-700 font-bold text-sm mb-6 border border-violet-100">
              Transforming the PG Industry
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-neutral-900 mb-6 tracking-tight leading-[1.1]">
              Bridging the gap between <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-violet-600">Tenants & Owners</span>
            </h1>
            <p className="text-lg md:text-xl text-neutral-600 leading-relaxed max-w-3xl mb-10">
              PGSathi is a dual-powered ecosystem. For students and professionals, it's a seamless PG-hunting platform with zero brokerage. For PG owners, it's a powerful Cloud CRM to automate rent, complaints, and lead management.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link href="/search" className="btn-primary px-8 py-3.5 text-base w-full sm:w-auto text-center">
                Find a PG
              </Link>
              <Link href="/dashboard/owner/listings/new" className="bg-white border-2 border-neutral-200 text-neutral-800 hover:border-primary-500 hover:text-primary-700 px-8 py-3.5 rounded-xl font-bold transition-all w-full sm:w-auto text-center">
                Join as PG Owner
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container-max section-padding py-16 md:py-24">
        
        {/* ── For Tenants Section ── */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
                  <ShieldCheck size={32} className="text-green-500 mb-4" />
                  <h3 className="font-bold text-neutral-900 mb-2">100% Verified</h3>
                  <p className="text-sm text-neutral-500">Every PG on our platform undergoes strict manual verification.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 translate-y-6">
                  <Heart size={32} className="text-red-500 mb-4" />
                  <h3 className="font-bold text-neutral-900 mb-2">Zero Brokerage</h3>
                  <p className="text-sm text-neutral-500">Connect directly with owners. No middlemen, no hidden fees.</p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6">For Tenants: Your Second Home, Simplified.</h2>
              <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
                Moving to a new city is hard enough. Finding a safe, comfortable, and affordable place to live shouldn't be.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Detailed property insights with real photos & amenities.",
                  "Location mapping to find PGs near your college or office.",
                  "Direct WhatsApp and Call integration with verified owners.",
                  "Read honest reviews from past and current tenants."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="text-primary-600 shrink-0 mt-0.5" size={20} />
                    <span className="text-neutral-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── For Owners Section ── */}
        <section className="mb-24">
          <div className="bg-neutral-900 rounded-[2.5rem] p-6 sm:p-8 md:p-16 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-500/20 rounded-full blur-[80px] -translate-y-1/3 translate-x-1/3"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
              <div>
                <span className="text-violet-400 font-bold tracking-wider uppercase text-sm mb-4 block">PGSathi Business</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">For Owners: The Ultimate PG Management Software.</h2>
                <p className="text-lg text-neutral-300 mb-8 leading-relaxed">
                  Stop managing your PG on WhatsApp groups and Excel sheets. PGSathi provides a complete Cloud CRM to automate your operations and scale your business.
                </p>
                <ul className="space-y-5">
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <Users className="text-white" size={20} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">Tenant & Bed Management</h4>
                      <p className="text-sm text-neutral-400">Visual bed matrix, tenant KYC, and digital onboarding.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <TrendingUp className="text-white" size={20} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">Automated Billing & Leads</h4>
                      <p className="text-sm text-neutral-400">Generate rent invoices, track pending dues, and manage platform leads in a Kanban board.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <Smartphone className="text-white" size={20} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">Manager Access</h4>
                      <p className="text-sm text-neutral-400">Add wardens/managers with role-based access to manage properties securely.</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="bg-neutral-800/50 border border-neutral-700 backdrop-blur-md rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-neutral-700 pb-4 mb-4">
                  <div className="text-white font-bold">Revenue Analytics</div>
                  <div className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-lg">+12% this month</div>
                </div>
                <div className="space-y-4">
                  <div className="h-2 w-full bg-neutral-700 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 w-[85%]"></div>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-400">
                    <span>Rent Collected</span>
                    <span className="text-white font-bold">₹2,45,000</span>
                  </div>
                  <div className="h-2 w-full bg-neutral-700 rounded-full overflow-hidden mt-4">
                    <div className="h-full bg-red-500 w-[15%]"></div>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-400">
                    <span>Pending Dues</span>
                    <span className="text-white font-bold">₹18,500</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats Section ── */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 md:p-16 shadow-sm border border-neutral-200 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-black text-primary-600 mb-2">10k+</div>
              <div className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Active Tenants</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black text-primary-600 mb-2">5k+</div>
              <div className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Verified PGs</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black text-primary-600 mb-2">30+</div>
              <div className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Cities</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black text-primary-600 mb-2">₹0</div>
              <div className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Brokerage</div>
            </div>
          </div>
        </section>

        {/* ── CTA Section ── */}
        <section className="text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-6">Ready to experience the future of PGs?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/search" className="btn-primary px-8 py-3.5 text-base w-full sm:w-auto flex items-center justify-center gap-2">
              <MapPin size={20} /> Explore PGs Now
            </Link>
            <Link href="/dashboard/owner/listings/new" className="bg-white border-2 border-neutral-200 text-neutral-800 hover:border-primary-500 hover:text-primary-700 px-8 py-3.5 rounded-xl font-bold transition-all w-full sm:w-auto flex items-center justify-center gap-2">
              <Building2 size={20} /> List Your PG
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
