import Link from "next/link";
import { Rocket, Heart, Coffee, Laptop, Mail } from "lucide-react";

export const metadata = {
  title: "Careers | PGSathi",
  description: "Join the PGSathi team. We are building the future of PG management and discovery in India.",
};

export default function CareersPage() {
  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* ── Hero Section ── */}
      <section className="bg-white border-b border-neutral-200 py-16 md:py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="container-max section-padding relative z-10 text-center">
          <div className="max-w-3xl mx-auto">
            <span className="inline-block py-1.5 px-4 rounded-full bg-rose-50 text-rose-700 font-bold text-sm mb-6 border border-rose-100 uppercase tracking-widest">
              We are hiring
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-neutral-900 mb-6 tracking-tight">
              Build the future of <span className="text-rose-600">Co-living</span> in India
            </h1>
            <p className="text-lg md:text-xl text-neutral-600 leading-relaxed mb-10">
              We are a fast-growing startup on a mission to organize the unstructured PG industry. If you love solving hard problems, we want you on our team.
            </p>
            <a href="#open-roles" className="btn-primary bg-rose-500 hover:bg-rose-600 px-8 py-4 rounded-xl text-lg font-bold inline-block">
              View Open Roles
            </a>
          </div>
        </div>
      </section>

      {/* ── Culture Section ── */}
      <div className="container-max section-padding py-16 md:py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">Why work with us?</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">We believe in giving our team the freedom to create, innovate, and take ownership.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          <div className="bg-white p-8 rounded-2xl border border-neutral-200 text-center shadow-sm">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6">
              <Rocket size={24} className="text-blue-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">High Impact</h3>
            <p className="text-neutral-500 text-sm">Your work will directly impact millions of students and PG owners across India.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-neutral-200 text-center shadow-sm">
            <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-6">
              <Heart size={24} className="text-rose-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Empathy First</h3>
            <p className="text-neutral-500 text-sm">We build products with deep empathy for the struggles of tenants and owners.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-neutral-200 text-center shadow-sm">
            <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-6">
              <Coffee size={24} className="text-amber-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Startup Culture</h3>
            <p className="text-neutral-500 text-sm">Fast-paced, zero bureaucracy, and a culture that rewards taking initiative.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-neutral-200 text-center shadow-sm">
            <div className="w-14 h-14 rounded-full bg-violet-50 flex items-center justify-center mx-auto mb-6">
              <Laptop size={24} className="text-violet-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Flexible Work</h3>
            <p className="text-neutral-500 text-sm">We care about what you deliver, not when you clock in. Remote-friendly policies.</p>
          </div>
        </div>

        {/* ── Open Roles ── */}
        <div id="open-roles" className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">Open Positions</h2>
          
          <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm">
            {/* Role 1 */}
            <div className="p-8 border-b border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Full Stack Developer (Next.js)</h3>
                <div className="flex gap-4 text-sm text-neutral-500 font-medium">
                  <span>Engineering</span>
                  <span>•</span>
                  <span>Remote / Hybrid</span>
                </div>
              </div>
              <a href="mailto:careers@pgsathi.in?subject=Application for Full Stack Developer" className="px-6 py-2.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold transition-colors w-full md:w-auto text-center">
                Apply Now
              </a>
            </div>

            {/* Role 2 */}
            <div className="p-8 border-b border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">City Sales Head</h3>
                <div className="flex gap-4 text-sm text-neutral-500 font-medium">
                  <span>Sales & Operations</span>
                  <span>•</span>
                  <span>Delhi NCR</span>
                </div>
              </div>
              <a href="mailto:careers@pgsathi.in?subject=Application for City Sales Head" className="px-6 py-2.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold transition-colors w-full md:w-auto text-center">
                Apply Now
              </a>
            </div>

            {/* Role 3 */}
            <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Customer Success Manager</h3>
                <div className="flex gap-4 text-sm text-neutral-500 font-medium">
                  <span>Support</span>
                  <span>•</span>
                  <span>Remote</span>
                </div>
              </div>
              <a href="mailto:careers@pgsathi.in?subject=Application for Customer Success Manager" className="px-6 py-2.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold transition-colors w-full md:w-auto text-center">
                Apply Now
              </a>
            </div>
          </div>

          <div className="mt-12 bg-neutral-900 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Don't see a perfect fit?</h3>
            <p className="text-neutral-400 mb-6">We are always looking for talented individuals. Send us an open application.</p>
            <a href="mailto:careers@pgsathi.in" className="inline-flex items-center gap-2 text-white font-bold hover:text-rose-400 transition-colors">
              <Mail size={18} /> careers@pgsathi.in
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
