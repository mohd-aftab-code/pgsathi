import Link from "next/link";
import { CheckCircle2, ShieldCheck, Heart, MapPin, Users } from "lucide-react";

export const metadata = {
  title: "About Us - PGSathi",
  description: "Learn more about PGSathi, India's most trusted platform for finding verified PGs with zero brokerage.",
};

export default function AboutPage() {
  return (
    <div className="bg-neutral-50 min-h-screen py-16 md:py-24">
      <div className="container-max section-padding">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-900 mb-6 tracking-tight">
            Redefining PG Hunting in India
          </h1>
          <p className="text-xl text-neutral-600 leading-relaxed">
            At PGSathi, our mission is simple: to connect students and young professionals with the best verified PGs without the hassle of brokers or hidden fees.
          </p>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-neutral-200 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-neutral-600 leading-relaxed">
                <p>
                  Every year, millions of students and professionals move to major educational and IT hubs like Delhi NCR, Pune, and Bangalore. The excitement of a new city is often ruined by the frustrating process of finding a safe and affordable place to live.
                </p>
                <p>
                  We faced the same problems: fake photos, greedy brokers demanding one month's rent as commission, and PGs that didn't live up to their promises. That's why we built PGSathi.
                </p>
                <p>
                  PGSathi is built on transparency. We verify properties, deal directly with owners, and ensure that what you see is exactly what you get. No brokers. No hidden charges. Just your perfect second home.
                </p>
              </div>
            </div>
            <div className="bg-primary-50 rounded-2xl p-8 h-full flex flex-col justify-center">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                  <div className="text-3xl font-black text-primary-600 mb-1">10k+</div>
                  <div className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Active Tenants</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                  <div className="text-3xl font-black text-primary-600 mb-1">5k+</div>
                  <div className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Verified PGs</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                  <div className="text-3xl font-black text-primary-600 mb-1">NCR</div>
                  <div className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Primary Focus</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                  <div className="text-3xl font-black text-primary-600 mb-1">₹0</div>
                  <div className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Brokerage</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-neutral-900 mb-10">Why Choose PGSathi?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-neutral-200 text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">100% Verified Listings</h3>
              <p className="text-neutral-500">We personally verify PG owners and properties to eliminate scams and fake photos from our platform.</p>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-neutral-200 text-center">
              <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Heart size={32} />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Zero Brokerage</h3>
              <p className="text-neutral-500">We believe finding a home shouldn't cost you an extra month's rent. Connect directly with owners for free.</p>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-neutral-200 text-center">
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Community First</h3>
              <p className="text-neutral-500">From honest reviews to resolving disputes, we prioritize our community of students and young professionals.</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-neutral-900 rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">Ready to find your next home?</h2>
          <p className="text-neutral-400 mb-10 max-w-2xl mx-auto text-lg relative z-10">
            Start exploring thousands of verified properties in Delhi, Noida, Gurgaon, and across India.
          </p>
          <Link href="/search" className="bg-primary-600 hover:bg-primary-700 text-white px-10 py-4 rounded-xl font-bold transition-colors inline-flex items-center gap-2 relative z-10">
            <MapPin size={20} /> Explore PGs Now
          </Link>
        </div>

      </div>
    </div>
  );
}
