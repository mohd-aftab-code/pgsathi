import Link from "next/link";
import { Metadata } from "next";
import { CheckCircle, TrendingUp, Users, Smartphone, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "List Your PG Online - Get Direct Tenants with Zero Brokerage | PGSathi",
  description: "List your PG or hostel on PGSathi for free. Get verified tenant leads directly on WhatsApp. Grow your PG business with India's best PG management and marketing platform.",
  alternates: {
    canonical: "https://pgsathi.in/for-owners",
  }
};

export default function ForOwnersPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556761175-5973dc0f32b7?q=80&w=2000&auto=format&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        <div className="container-max section-padding relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            Fill Your PG Faster. <br/>
            <span className="text-orange-500">Zero Commission. 100% Direct Leads.</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-100 max-w-2xl mx-auto mb-10">
            Join India's fastest growing network of PG owners. List your property, get direct tenant inquiries on WhatsApp, and manage everything effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/dashboard/owner/listings/new" 
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              List Your PG for Free <ArrowRight size={20} />
            </Link>
            <Link 
              href="/pricing" 
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-lg transition-all w-full sm:w-auto text-center"
            >
              View Pricing Plans
            </Link>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-neutral-50">
        <div className="container-max section-padding">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-4">Why PG Owners Love PGSathi</h2>
            <p className="text-neutral-500 text-lg">We built this platform to solve your biggest problems.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                <Users size={28} />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Direct Tenant Leads</h3>
              <p className="text-neutral-600 leading-relaxed">No middlemen. Tenants can contact you directly via WhatsApp or Phone calls right from your listing page.</p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp size={28} />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Zero Brokerage</h3>
              <p className="text-neutral-600 leading-relaxed">Stop paying 15-30 days of rent as commission. Keep 100% of your earnings. We only charge a nominal listing fee.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mb-6">
                <Smartphone size={28} />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">PG Management App</h3>
              <p className="text-neutral-600 leading-relaxed">While PGSathi.in brings you tenants, use our upcoming mobile app to manage rent collection, complaints, and inventory.</p>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="py-20">
        <div className="container-max section-padding">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-8">How to get tenants fast?</h2>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 bg-primary-900 text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">Create Your Listing</h3>
                    <p className="text-neutral-600">Sign up and add your PG details, photos, rent, and rules in just 5 minutes.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 bg-primary-900 text-white rounded-full flex items-center justify-center font-bold text-lg">2</div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">Get Verified</h3>
                    <p className="text-neutral-600">Our team does a quick verification to ensure quality. Verified PGs get 3x more views.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 bg-primary-900 text-white rounded-full flex items-center justify-center font-bold text-lg">3</div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">Receive Direct Inquiries</h3>
                    <p className="text-neutral-600">Tenants looking for PGs in your area will contact you directly on your phone.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full bg-neutral-100 rounded-[2rem] p-8 md:p-12 border border-neutral-200">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-neutral-200 p-6">
                 <div className="flex items-center gap-4 mb-6 pb-6 border-b border-neutral-100">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                      <CheckCircle size={32} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">New Lead on WhatsApp!</h4>
                      <p className="text-sm text-neutral-500">Just now</p>
                    </div>
                 </div>
                 <div className="space-y-3">
                   <div className="h-4 bg-neutral-100 rounded w-3/4"></div>
                   <div className="h-4 bg-neutral-100 rounded w-1/2"></div>
                   <div className="h-4 bg-neutral-100 rounded w-full"></div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
