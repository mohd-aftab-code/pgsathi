import Link from "next/link";
import { ShieldCheck, UserCheck, PhoneCall, AlertTriangle, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Trust & Safety | PGSathi",
  description: "Learn how PGSathi keeps you safe. 100% verified PGs, strict owner KYC, and genuine tenant reviews.",
};

export default function TrustAndSafetyPage() {
  return (
    <div className="bg-neutral-50 min-h-screen">
      
      {/* ── Hero Section ── */}
      <section className="bg-white border-b border-neutral-200 py-16 md:py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="container-max section-padding relative z-10 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-8 border border-blue-100">
              <ShieldCheck size={40} className="text-blue-600" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-neutral-900 mb-6 tracking-tight">
              Your Safety is our <span className="text-blue-600">Top Priority</span>
            </h1>
            <p className="text-lg md:text-xl text-neutral-600 leading-relaxed">
              At PGSathi, we take extreme measures to ensure that every property listed is genuine, and every owner is verified. No scams, no fake photos.
            </p>
          </div>
        </div>
      </section>

      <div className="container-max section-padding py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <div className="bg-white p-8 md:p-12 rounded-3xl border border-neutral-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <UserCheck size={32} className="text-green-600 mb-6 relative z-10" />
            <h3 className="text-2xl font-bold text-neutral-900 mb-4 relative z-10">Owner Verification (KYC)</h3>
            <p className="text-neutral-600 leading-relaxed relative z-10">
              Every PG owner on our platform goes through a strict verification process. We verify their identity and property ownership before their listing goes live on PGSathi.
            </p>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-3xl border border-neutral-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <CheckCircle2 size={32} className="text-purple-600 mb-6 relative z-10" />
            <h3 className="text-2xl font-bold text-neutral-900 mb-4 relative z-10">Physical & Visual Audits</h3>
            <p className="text-neutral-600 leading-relaxed relative z-10">
              Our team manually reviews property photos, location data, and amenities to ensure they match reality. If a PG looks suspicious, it never makes it to our search results.
            </p>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-3xl border border-neutral-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <PhoneCall size={32} className="text-rose-600 mb-6 relative z-10" />
            <h3 className="text-2xl font-bold text-neutral-900 mb-4 relative z-10">Zero Brokerage Guarantee</h3>
            <p className="text-neutral-600 leading-relaxed relative z-10">
              We connect you directly to the owner. If any owner asks for a "brokerage fee" or "visiting charge" claiming to be from PGSathi, you can report them instantly.
            </p>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-3xl border border-neutral-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <AlertTriangle size={32} className="text-amber-600 mb-6 relative z-10" />
            <h3 className="text-2xl font-bold text-neutral-900 mb-4 relative z-10">Strict Spam Control</h3>
            <p className="text-neutral-600 leading-relaxed relative z-10">
              We use intelligent algorithms to detect spam accounts, fake reviews, and fraudulent activity. Suspicious accounts are permanently banned from the platform.
            </p>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-3xl p-8 md:p-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Spotted something suspicious?</h2>
          <p className="text-neutral-400 mb-8 max-w-2xl mx-auto">
            Our community's safety depends on you. If you find a fake listing or an owner demanding brokerage, please report it to us immediately.
          </p>
          <Link href="/contact" className="inline-block bg-white text-neutral-900 px-8 py-4 rounded-xl font-bold hover:bg-neutral-100 transition-colors">
            Report an Issue
          </Link>
        </div>
      </div>
    </div>
  );
}
