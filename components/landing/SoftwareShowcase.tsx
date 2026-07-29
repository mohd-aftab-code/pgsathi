import Link from "next/link";
import { Building, Smartphone, CheckCircle2, ArrowRight } from "lucide-react";

export default function SoftwareShowcase() {
  return (
    <section className="py-20 md:py-28 bg-white border-t border-neutral-100 overflow-hidden">
      <div className="container-max section-padding">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-50 text-violet-700 text-sm font-bold uppercase tracking-widest rounded-full mb-6 border border-violet-100">
              <Building size={16} />
              PGSathi Business
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-neutral-900 mb-6 tracking-tight leading-[1.1]">
              Powerful Cloud CRM <br />
              for <span className="text-primary-600">PG Owners.</span>
            </h2>
            <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
              Managing a PG shouldn't mean drowning in Excel sheets and WhatsApp messages. We built the ultimate software to digitize your operations and increase your profit margins.
            </p>
            
            <ul className="space-y-4 mb-10">
              {[
                "Digital Tenant KYC & Onboarding",
                "Automated Rent Reminders & Billing",
                "Expense & Profitability Tracking",
                "Direct Verified Leads from our Platform",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={14} />
                  </div>
                  <span className="text-neutral-700 font-medium">{item}</span>
                </li>
              ))}
            </ul>
            
            <Link 
              href="/pg-management-software" 
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-bold transition-all w-full sm:w-auto inline-flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25"
            >
              Explore PG Software <ArrowRight size={18} />
            </Link>
          </div>
          
          {/* Dashboard Graphic */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-100/50 to-violet-100/50 rounded-3xl blur-3xl transform scale-110"></div>
            <div className="relative bg-white border border-neutral-200 p-2 rounded-2xl shadow-2xl">
              <div className="bg-neutral-50 rounded-xl border border-neutral-100 overflow-hidden">
                {/* Mock Header */}
                <div className="border-b border-neutral-200 bg-white p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-neutral-800">
                    <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center">PG</div>
                    Sunshine Hostels
                  </div>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-neutral-200"></div>
                    <div className="w-3 h-3 rounded-full bg-neutral-200"></div>
                    <div className="w-3 h-3 rounded-full bg-neutral-200"></div>
                  </div>
                </div>
                {/* Mock Body */}
                <div className="p-6 grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
                      <div className="text-sm text-neutral-500 mb-1">Total Revenue</div>
                      <div className="text-2xl font-black text-emerald-600">₹2.4L</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
                      <div className="text-sm text-neutral-500 mb-1">Occupancy</div>
                      <div className="text-2xl font-black text-blue-600">85%</div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm h-32 flex items-center justify-center">
                    {/* Mock Graph */}
                    <div className="flex items-end gap-2 h-20 w-full px-4">
                      {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                        <div key={i} className="bg-primary-100 transition-colors w-full rounded-t-sm" style={{ height: `${h}%` }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Element */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-neutral-100 flex items-center gap-4 hidden sm:flex">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Smartphone size={24} />
                </div>
                <div>
                  <div className="text-sm font-bold text-neutral-900">Rent Received</div>
                  <div className="text-xs text-neutral-500">Just now via UPI</div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
