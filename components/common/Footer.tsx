"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";
import logoImg from "@/app/assets/logo/logo in vertical.png";
import { CITIES } from "@/constants/cities";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0f172a] text-slate-400 border-t border-slate-800">
      {/* Main Footer */}
      <div className="container-max section-padding py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8">
          
          {/* Brand & Socials */}
          <div className="lg:col-span-2 flex flex-col gap-6 pr-0 lg:pr-8">
            <Link href="/" className="inline-block w-fit">
              <Image 
                src={logoImg} 
                alt="PGSathi Logo" 
                width={180}
                height={64}
                className="h-14 w-auto object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity" 
              />
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              India's most trusted platform for managing and discovering Paying Guest accommodations. Verified listings in top cities, powerful management tools for owners, and high earnings for partners.
            </p>
            
            <div className="flex flex-col gap-3 mt-2">
              <Link href="/contact" className="flex items-center gap-3 text-slate-300 hover:text-white text-sm transition-colors">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center"><Mail size={14} /></div>
                Contact Support
              </Link>
              <a href="tel:+919696110243" className="flex items-center gap-3 text-slate-300 hover:text-white text-sm transition-colors">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center"><Phone size={14} /></div>
                +91 9696110243
              </a>
            </div>

            <div className="flex gap-3 mt-4">
              <a href="https://instagram.com/pgsathi.in" target="_blank" rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 hover:bg-[#E1306C] hover:text-white transition-all shadow-sm">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://www.linkedin.com/company/pg-sathi/" target="_blank" rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 hover:bg-[#0077b5] hover:text-white transition-all shadow-sm">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
              <a href="https://twitter.com/pgsathi" target="_blank" rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 hover:bg-[#1DA1F2] hover:text-white transition-all shadow-sm">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
              </a>
            </div>
          </div>

          {/* For PG Owners */}
          <div>
            <h4 className="text-white font-semibold mb-6 text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-500"></span>
              For PG Owners
            </h4>
            <ul className="flex flex-col gap-3">
              {[
                { label: "List PG for Free", href: "/dashboard/owner/listings/new" },
                { label: "Owner Dashboard", href: "/dashboard/owner" },
                { label: "Tenant Management", href: "/dashboard/owner/tenants" },
                { label: "Rent & Billing", href: "/dashboard/owner/rent" },
                { label: "Lead Management", href: "/dashboard/owner/leads" },
                { label: "Expense Tracking", href: "/dashboard/owner/expenses" },
                { label: "Business Analytics", href: "/dashboard/owner/analytics" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-slate-400 hover:text-violet-400 text-sm transition-colors block">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Partners */}
          <div>
            <h4 className="text-white font-semibold mb-6 text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-500"></span>
              For Partners
            </h4>
            <ul className="flex flex-col gap-3">
              {[
                // The partner portal lives under /partner/*, not /dashboard/partner/*.
                // These pointed at routes that never existed and 404'd, and
                // "Partner Login" went to the general three-role login.
                { label: "Join Partner Program", href: "/partner", highlight: true },
                { label: "Partner Login", href: "/partner/login" },
                { label: "Partner Dashboard", href: "/partner/dashboard" },
                { label: "Track Earnings", href: "/partner/earnings" },
                { label: "Onboarded PGs", href: "/partner/pgs" },
                { label: "Payout Reports", href: "/partner/reports" },
              ].map(({ label, href, highlight }) => (
                <li key={href}>
                  <Link href={href} className={`${highlight ? 'text-emerald-400 font-medium hover:text-emerald-300' : 'text-slate-400 hover:text-emerald-400'} text-sm transition-colors block`}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-6 text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-500"></span>
              Company
            </h4>
            <ul className="flex flex-col gap-3">
              {[
                { label: "About Us", href: "/about" },
                { label: "Careers", href: "/careers" },
                { label: "Trust & Safety", href: "/trust-and-safety" },
                { label: "Help Center", href: "/help" },
                { label: "Contact Support", href: "/contact" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms & Conditions", href: "/terms" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-slate-400 hover:text-blue-400 text-sm transition-colors block">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Tenants */}
          <div>
            <h4 className="text-white font-semibold mb-6 text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-500"></span>
              For Tenants
            </h4>
            <ul className="flex flex-col gap-3">
              {[
                { label: "Search PGs", href: "/search" },
                { label: "How it Works", href: "/how-it-works" },
                { label: "PGs in Delhi", href: "/pg-in-delhi" },
                { label: "PGs in Noida", href: "/pg-in-noida" },
                { label: "PGs in Gurgaon", href: "/pg-in-gurgaon" },
                { label: "PGs in Bangalore", href: "/pg-in-bangalore" },
                { label: "PGs in Mumbai", href: "/pg-in-mumbai" },
                { label: "Saved Accommodations", href: "/dashboard/tenant/saved" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-slate-400 hover:text-rose-400 text-sm transition-colors block">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* SEO Popular Searches Block */}
      <div className="border-t border-slate-800 bg-[#0f172a]">
        <div className="container-max section-padding py-10 text-slate-400">
          <h3 className="text-slate-300 font-bold mb-4 flex items-center gap-2">
            <MapPin size={16} className="text-violet-500" />
            Top PG Locations in India
          </h3>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs sm:text-sm">
            {CITIES.filter(c => c.priority <= 15).map(city => (
              <div key={city.slug} className="flex gap-4">
                <Link href={`/pg-in-${city.slug}`} className="hover:text-violet-400 transition-colors">
                  PG in {city.name}
                </Link>
                <Link href={`/boys-pg-in-${city.slug}`} className="hover:text-blue-400 transition-colors hidden sm:inline">
                  Boys PG in {city.name}
                </Link>
                <Link href={`/girls-pg-in-${city.slug}`} className="hover:text-pink-400 transition-colors hidden sm:inline">
                  Girls PG in {city.name}
                </Link>
              </div>
            ))}
          </div>
          
          <h3 className="text-slate-300 font-bold mb-4 mt-8 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Trending Searches
          </h3>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs sm:text-sm">
            <Link href="/pg-management-software" className="hover:text-emerald-400 transition-colors font-medium">PG Management Software</Link>
            <Link href="/pg-management-software" className="hover:text-emerald-400 transition-colors">Cloud CRM for PG</Link>
            <Link href="/for-owners" className="hover:text-emerald-400 transition-colors">Free PG Listing</Link>
            <Link href="/search" className="hover:text-violet-400 transition-colors">Zero Brokerage PGs</Link>
            <Link href="/search?gender=BOYS" className="hover:text-violet-400 transition-colors">Best Boys Hostels</Link>
            <Link href="/search?gender=GIRLS" className="hover:text-violet-400 transition-colors">Safe Girls PGs</Link>
            <Link href="/search?gender=COED" className="hover:text-violet-400 transition-colors">Co-living Spaces in India</Link>
            <Link href="/partner" className="hover:text-emerald-400 transition-colors">Earn Money Referring PGs</Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#0b1120] border-t border-slate-800">
        <div className="container-max py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-xs sm:text-sm text-slate-500 m-0 font-medium">
            © {year} PGSathi. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 font-medium">
            Made with <span className="text-rose-500 animate-pulse">❤️</span> in India <span className="text-lg leading-none">🇮🇳</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
