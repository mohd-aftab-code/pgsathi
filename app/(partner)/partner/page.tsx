import Link from "next/link";
import { Handshake, Building2, IndianRupee, BarChart3, ShieldCheck, ArrowRight, Wallet, CheckCircle } from "lucide-react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Partner Programme — Refer PGs & Earn Money Online | PGSathi",
  description: "Start your own business with the PGSathi Partner Programme. Onboard PG owners in your city and earn guaranteed lifetime commissions on every paid conversion.",
  alternates: {
    canonical: "https://pgsathi.in/partner",
  },
  openGraph: {
    title: "Partner Programme — Refer PGs & Earn Money Online | PGSathi",
    description: "Start your own business with the PGSathi Partner Programme. Onboard PG owners and earn guaranteed lifetime commissions.",
    url: "https://pgsathi.in/partner",
  },
};

const STEPS = [
  { Icon: Handshake, title: "Register for Free", body: "100% free signup. Your portal will be activated after admin approval." },
  { Icon: Building2, title: "Onboard PG Owners", body: "Onboard PGs in your area to the PGSathi platform. Their listing, your commission." },
  { Icon: IndianRupee, title: "Life-time Earnings", body: "Whenever your onboarded PG purchases a premium plan, you will receive your share instantly." },
];

const FEATURES = [
  { Icon: BarChart3, title: "Smart Dashboard", body: "Track all your onboarded PGs, active plans, and total earnings in one place." },
  { Icon: ShieldCheck, title: "Secure & Transparent", body: "Your data is completely secure. We ensure full transparency for every transaction and payout." },
  { Icon: Wallet, title: "Fast Payouts", body: "As soon as you meet the minimum threshold, your earnings are credited directly to your bank account." },
];

export default async function PartnerLandingPage() {
  const session = await auth();

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <Navbar user={session?.user} />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-8 pb-16 lg:pt-16 lg:pb-28 overflow-hidden bg-neutral-50">
          <div
            className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(#171717 1px, transparent 1px), linear-gradient(90deg, #171717 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
              {/* Left Content */}
              <div>
                <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold text-primary-700 uppercase tracking-widest mb-4 sm:mb-6 bg-primary-50 px-3 py-1.5 rounded-full border border-primary-100">
                  <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                  PGSathi Partner Programme
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-neutral-900 tracking-tight mb-6 leading-[1.15]">
                  Onboard PGs.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">Earn Unlimited.</span>
                </h1>
                
                <p className="text-lg sm:text-xl text-neutral-600 mb-10 leading-relaxed max-w-xl">
                  The best opportunity for real estate agents, freelancers, and students. 
                  Leverage your network and get guaranteed commissions on every successful PG onboarding.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Link
                    href="/partner/signup"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-lg shadow-xl shadow-primary-600/20 transition-all hover:-translate-y-1"
                  >
                    Start Earning Now <ArrowRight size={20} />
                  </Link>
                  <Link
                    href="/partner/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white hover:bg-neutral-50 text-neutral-900 font-bold text-lg border border-neutral-200 transition-all shadow-sm"
                  >
                    Partner Login
                  </Link>
                </div>
                
                <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-neutral-700 text-sm font-semibold">
                  <div className="flex items-center gap-2"><CheckCircle size={18} className="text-green-500 shrink-0" /> Zero Investment</div>
                  <div className="flex items-center gap-2"><CheckCircle size={18} className="text-green-500 shrink-0" /> Dedicated Dashboard</div>
                  <div className="flex items-center gap-2"><CheckCircle size={18} className="text-green-500 shrink-0" /> Fast Bank Payouts</div>
                </div>
              </div>

              {/* Right Side Image/Visual */}
              <div className="relative">
                <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-2xl shadow-primary-900/5 border border-neutral-100 relative">
                  <div className="absolute -top-4 -right-4 bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg transform rotate-6 z-10">
                    Live Updates
                  </div>
                  
                  <div className="bg-neutral-900 rounded-3xl p-6 sm:p-8 text-white shadow-inner mb-6 relative overflow-hidden">
                    {/* Add a subtle glow inside the black card */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/20 blur-2xl rounded-full pointer-events-none"></div>
                    <div className="text-neutral-400 text-sm font-semibold mb-2 relative">Total Earnings This Month</div>
                    <div className="text-4xl sm:text-5xl font-black text-white mb-6 sm:mb-8 tracking-tight relative">₹45,500</div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 relative">
                      <div className="flex-1 bg-neutral-800 rounded-2xl p-4 sm:p-5 border border-neutral-700">
                        <div className="text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-2">Onboarded PGs</div>
                        <div className="text-2xl sm:text-3xl font-bold">12</div>
                      </div>
                      <div className="flex-1 bg-neutral-800 rounded-2xl p-4 sm:p-5 border border-neutral-700">
                        <div className="text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-2">Active Plans</div>
                        <div className="text-2xl sm:text-3xl font-bold text-green-400">8</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="font-bold text-neutral-900 text-base sm:text-lg px-2">Recent Payouts</h4>
                    {[
                      { pg: "Sunshine Girls PG", plan: "Pro Plan • 1 Year", amount: "+₹1,200" },
                      { pg: "Royal Boys Hostel", plan: "Scale Plan • 6 Months", amount: "+₹2,500" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 sm:p-4 rounded-2xl border border-neutral-100 bg-neutral-50 hover:bg-white hover:shadow-md transition-all">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center text-primary-600 font-bold border border-neutral-200 shadow-sm">
                            <Building2 size={18} />
                          </div>
                          <div>
                            <div className="font-bold text-neutral-900 text-sm sm:text-base">{item.pg}</div>
                            <div className="text-xs sm:text-sm text-neutral-500">{item.plan}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600 text-base sm:text-lg">{item.amount}</div>
                          <div className="text-[10px] sm:text-xs font-medium text-neutral-400">Credited</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 lg:py-24 bg-white relative border-b border-neutral-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900 mb-4">How It Works</h2>
              <p className="text-neutral-500 text-lg max-w-2xl mx-auto">Start your business in three simple steps and begin earning from day one.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {STEPS.map((s, i) => (
                <div key={s.title} className="bg-neutral-50 rounded-3xl p-8 border border-neutral-100 hover:shadow-xl hover:shadow-neutral-200/50 transition-all duration-300 hover:-translate-y-2 relative z-10 group">
                  <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary-600 grid place-items-center mb-6 group-hover:scale-110 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                    <s.Icon size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-3">{i + 1}. {s.title}</h3>
                  <p className="text-neutral-600 text-base leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Features / Benefits */}
        <section className="py-20 lg:py-24 bg-neutral-50 border-b border-neutral-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900 mb-4">Partner Programme Benefits</h2>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">We've built a powerful dashboard for our partners where you can easily manage your entire business.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {FEATURES.map((f) => (
                <div key={f.title} className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm text-center hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-neutral-50 border border-neutral-100 shadow-inner flex items-center justify-center text-primary-600 mb-6">
                    <f.Icon size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">{f.title}</h3>
                  <p className="text-neutral-600 text-base leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 lg:py-28 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl md:text-5xl font-black text-neutral-900 mb-6 tracking-tight">Ready to start earning?</h2>
            <p className="text-lg md:text-xl text-neutral-600 mb-10 max-w-2xl mx-auto">Registration is completely free. Apply today and become a part of the PGSathi Partner network.</p>
            <Link
              href="/partner/signup"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xl shadow-xl shadow-primary-600/25 transition-all hover:-translate-y-1 hover:shadow-2xl w-full sm:w-auto"
            >
              Become a Partner (It's Free) <ArrowRight size={24} />
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
