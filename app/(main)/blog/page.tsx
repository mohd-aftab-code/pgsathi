import { Metadata } from "next";
import { BLOG_POSTS } from "@/lib/data/blogs";
import { BlogListingClient } from "@/components/blog/BlogListingClient";
import { constructMetadata } from "@/lib/seo";
import { Sparkles, Mail } from "lucide-react";

export const metadata: Metadata = constructMetadata({
  title: "Blog & Guides — PG Hunting, Safety & Owner Tips",
  description: "Read expert guides, safety checklists, city rent breakdowns, and PG owner strategies to find or manage Paying Guest accommodations across India.",
  canonicalPath: "/blog",
  keywords: [
    "PG blog",
    "PG hunting guide",
    "how to list PG online",
    "zero brokerage PG tips",
    "girls PG safety Delhi",
    "PG in Noida guide",
    "PG in Gurgaon guide",
    "PG management tips"
  ],
});

export default function BlogPage() {
  return (
    <div className="bg-neutral-50/70 min-h-screen py-10 sm:py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 border border-primary-200/60 text-primary-700 text-xs font-black uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles size={13} className="text-primary-500" />
            <span>PGSathi Knowledge Base &amp; Guides</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 tracking-tight leading-tight mb-4">
            Insights, Stories &amp; Expert Guides
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-neutral-600 leading-relaxed font-normal max-w-2xl mx-auto">
            Actionable guides to help students and working professionals find safe homes, and help PG owners maximize occupancy with zero brokerage.
          </p>
        </div>

        {/* Client Component with Search, Category Filter, Featured Post, and Grid */}
        <BlogListingClient posts={BLOG_POSTS} />

        {/* Newsletter Section */}
        <div className="mt-16 sm:mt-24 bg-gradient-to-br from-neutral-900 via-neutral-900 to-primary-950 rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-14 text-center text-white relative overflow-hidden shadow-xl border border-neutral-800">
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/3"></div>

          <div className="relative z-10 max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-white/10 grid place-items-center mx-auto mb-4 border border-white/10 shadow-sm">
              <Mail className="text-primary-300" size={24} />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black mb-3 tracking-tight">
              Stay Ahead of the Rental Market
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 mb-6 leading-relaxed">
              Get the latest PG guides, zero brokerage rental alerts, and owner business strategies delivered right to your inbox. No spam ever.
            </p>

            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-neutral-900 bg-white placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-primary-500 font-medium shadow-sm"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl sm:rounded-2xl bg-primary-500 hover:bg-primary-600 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-primary-500/25 transition-all whitespace-nowrap cursor-pointer"
              >
                Subscribe Free
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
