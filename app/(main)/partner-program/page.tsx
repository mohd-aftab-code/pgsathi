import Link from "next/link";
import { CheckCircle2, DollarSign, Users, Briefcase, TrendingUp, Wallet, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Partner Program | Refer & Earn with PGSathi",
  description: "Join the PGSathi Partner Program. Refer PG owners, help them digitize their business, and earn high commissions for every successful onboarding.",
};

export default function PartnerProgramPage() {
  return (
    <div className="bg-neutral-50 min-h-screen">
      
      {/* ── Hero Section ── */}
      <section className="bg-white border-b border-neutral-200 py-16 md:py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/3"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/3"></div>
        
        <div className="container-max section-padding relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
              <span className="inline-block py-1.5 px-4 rounded-full bg-primary-50 text-primary-700 font-bold text-sm mb-6 border border-primary-100 uppercase tracking-widest">
                Refer & Earn Unlimited
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-neutral-900 mb-6 tracking-tight leading-[1.1]" style={{ textWrap: "balance" }}>
                Become a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-500">PGSathi Partner</span> & Start Earning Today
              </h1>
              <p className="text-lg md:text-xl text-neutral-600 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-10">
                Are you a broker, student, or freelancer? Help PG owners digitize their business with our Cloud CRM and earn high commissions for every successful onboarding.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/register" className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-xl font-bold transition-all w-full sm:w-auto text-center flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25">
                  Join Now For Free <ArrowRight size={18} />
                </Link>
                <Link href="#how-it-works" className="bg-white border-2 border-neutral-200 text-neutral-800 hover:border-primary-500 hover:text-primary-700 px-8 py-4 rounded-xl font-bold transition-all w-full sm:w-auto text-center">
                  Learn How It Works
                </Link>
              </div>
            </div>

            {/* Right Graphic */}
            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-100 to-primary-50 rounded-full blur-3xl opacity-50 transform scale-110"></div>
              <div className="relative bg-white border border-neutral-100 rounded-3xl shadow-2xl p-8 max-w-md mx-auto transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-neutral-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600">
                      <Wallet size={24} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Total Earnings</div>
                      <div className="text-3xl font-black text-neutral-900">₹45,500</div>
                    </div>
                  </div>
                  <TrendingUp className="text-primary-500" size={32} />
                </div>
                
                <div className="space-y-4">
                  <div className="text-sm font-bold text-neutral-900 mb-2">Recent Payouts</div>
                  {[
                    { name: "Rahul PG Referral", amount: "+₹5,000", date: "Today, 10:30 AM" },
                    { name: "Sunrise Hostel", amount: "+₹2,500", date: "Yesterday, 2:15 PM" },
                    { name: "Elite Stays Onboarding", amount: "+₹8,000", date: "Jun 20, 11:00 AM" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 hover:bg-primary-50/50 transition-colors border border-neutral-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-400">
                          <CheckCircle2 size={20} className="text-primary-500" />
                        </div>
                        <div>
                          <div className="font-bold text-neutral-900 text-sm">{item.name}</div>
                          <div className="text-xs text-neutral-500">{item.date}</div>
                        </div>
                      </div>
                      <div className="font-black text-primary-600">{item.amount}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-max section-padding py-16 md:py-24">
        
        {/* ── Why Join Section ── */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Why Partner With Us?</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">We provide the best incentives and tools to help you succeed as our partner.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-200 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-6">
                <DollarSign size={32} className="text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">High Commissions</h3>
              <p className="text-neutral-600">Earn flat payouts or percentage commissions for every premium plan sold to a PG Owner.</p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-200 text-center translate-y-0 md:-translate-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-6">
                <Wallet size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Timely Payouts</h3>
              <p className="text-neutral-600">Get your earnings transferred directly to your Bank Account or UPI with full transparency.</p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-200 text-center">
              <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-6">
                <TrendingUp size={32} className="text-violet-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Dedicated Dashboard</h3>
              <p className="text-neutral-600">Track your leads, onboarded owners, and pending earnings in real-time on your dashboard.</p>
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how-it-works" className="mb-24">
          <div className="bg-neutral-900 rounded-3xl md:rounded-[2.5rem] p-6 sm:p-8 md:p-16 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary-500/10 rounded-full blur-[80px] -translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="text-center relative z-10 mb-12">
              <span className="text-primary-400 font-bold tracking-wider uppercase text-sm mb-4 block">3 Simple Steps</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">How The Partner Program Works</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              <div className="relative">
                <div className="text-5xl font-black text-white/5 absolute -top-6 -left-2 z-0">01</div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6">
                    <Users className="text-white" size={24} />
                  </div>
                  <h4 className="text-white text-xl font-bold mb-3">Sign Up as Partner</h4>
                  <p className="text-neutral-400">Create your free partner account. Get your unique referral link and onboarding materials.</p>
                </div>
              </div>
              
              <div className="relative">
                <div className="text-5xl font-black text-white/5 absolute -top-6 -left-2 z-0">02</div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6">
                    <Briefcase className="text-white" size={24} />
                  </div>
                  <h4 className="text-white text-xl font-bold mb-3">Onboard PG Owners</h4>
                  <p className="text-neutral-400">Pitch PGSathi's zero-brokerage platform & Cloud CRM to owners. Register their properties using your link.</p>
                </div>
              </div>
              
              <div className="relative">
                <div className="text-5xl font-black text-white/5 absolute -top-6 -left-2 z-0">03</div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6">
                    <DollarSign className="text-white" size={24} />
                  </div>
                  <h4 className="text-white text-xl font-bold mb-3">Earn Commissions</h4>
                  <p className="text-neutral-400">Whenever your referred owner subscribes to a premium plan, you earn an instant commission.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Who can join ── */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 md:p-12 shadow-sm border border-neutral-200 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-6">Who can become a Partner?</h2>
              <ul className="space-y-4 mb-8">
                {[
                  "Real Estate Brokers wanting an additional revenue stream.",
                  "College Students with a large network.",
                  "Freelancers looking for sales opportunities.",
                  "Existing PG Owners referring other owners."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="text-primary-500 shrink-0 mt-0.5" size={20} />
                    <span className="text-neutral-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-neutral-50 rounded-2xl p-8 border border-neutral-100 text-center">
              <h3 className="font-bold text-xl text-neutral-900 mb-2">Zero Investment</h3>
              <p className="text-neutral-600 mb-6">You do not need to pay any joining fee. Registering as a PGSathi Partner is 100% free forever.</p>
              <Link href="/register" className="btn-primary bg-primary-500 hover:bg-primary-600 px-8 py-3.5 w-full block">
                Start Earning Now
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
