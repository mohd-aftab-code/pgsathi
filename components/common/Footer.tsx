"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail } from "lucide-react";
import logoImg from "@/app/assets/logo/logo.png";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400">
      {/* Main Footer */}
      <div className="container-max section-padding py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Brand */}
          <div className="flex flex-col gap-5">
            <Link href="/" className="inline-block w-fit">
              <Image 
                src={logoImg} 
                alt="PGSathi Logo" 
                width={160}
                height={60}
                className="h-10 w-auto object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity" 
              />
            </Link>
            <p className="text-sm leading-relaxed max-w-sm text-slate-400">
              India ka sabse trusted platform PG dhundne ke liye. Verified listings in Metro, Tier 2, and Tier 3 cities, all with no broker fees.
            </p>
            <div className="flex gap-3 mt-2">
              <a href="https://instagram.com/pgsathi.in" target="_blank" rel="noopener noreferrer" 
                className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-[#E1306C] hover:text-white transition-all">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://www.linkedin.com/company/pg-sathi/" target="_blank" rel="noopener noreferrer" 
                className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-[#0077b5] hover:text-white transition-all">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
              <a href="https://twitter.com/pgsathi" target="_blank" rel="noopener noreferrer" 
                className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-[#1DA1F2] hover:text-white transition-all">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
              </a>
              <a href="https://reddit.com/r/pgsathi" target="_blank" rel="noopener noreferrer" 
                className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-[#FF4500] hover:text-white transition-all">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16.5 12a2.5 2.5 0 0 0-4.5-1.5 6.6 6.6 0 0 0-4 0A2.5 2.5 0 0 0 7.5 12c0 1.2.9 2.2 2.1 2.4.6.9 1.5 1.6 2.4 1.6s1.8-.7 2.4-1.6c1.2-.2 2.1-1.2 2.1-2.4z"></path></svg>
              </a>
            </div>
          </div>

          {/* For Tenants */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-base">Tenants के लिए</h4>
            <ul className="flex flex-col gap-3">
              {[
                { label: "PG ढूंढें", href: "/search" },
                { label: "Delhi में PG", href: "/pg-in-delhi" },
                { label: "Noida में PG", href: "/pg-in-noida" },
                { label: "Gurgaon में PG", href: "/pg-in-gurgaon" },
                { label: "Bangalore में PG", href: "/pg-in-bangalore" },
                { label: "Mumbai में PG", href: "/pg-in-mumbai" },
                { label: "Kota में PG", href: "/pg-in-kota" },
                { label: "Jaipur में PG", href: "/pg-in-jaipur" },
                { label: "Pune में PG", href: "/pg-in-pune" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-slate-400 hover:text-violet-300 text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Owners */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-base">Owners के लिए</h4>
            <ul className="flex flex-col gap-3">
              {[
                { label: "PG List करें — Free", href: "/dashboard/owner/listings/new" },
                { label: "Owner Dashboard", href: "/dashboard/owner" },
                { label: "Leads Management", href: "/dashboard/owner/leads" },
                { label: "Analytics", href: "/dashboard/owner/analytics" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-slate-400 hover:text-violet-300 text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company + Contact */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-base">Company</h4>
            <ul className="flex flex-col gap-3 mb-8">
              {[
                { label: "About Us", href: "/about" },
                { label: "Contact", href: "/contact" },
                { label: "Blog", href: "/blog" },
                { label: "FAQ", href: "/faq" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Refund Policy", href: "/refund" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-slate-400 hover:text-violet-300 text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3">
              <a href="mailto:pgsathi.support@gmail.com" className="flex items-center gap-2 text-slate-400 hover:text-violet-300 text-sm transition-colors">
                <Mail size={16} /> pgsathi.support@gmail.com
              </a>
              <a href="tel:+919696110243" className="flex items-center gap-2 text-slate-400 hover:text-violet-300 text-sm transition-colors">
                <Phone size={16} /> +91 9696110243
              </a>
              <a href="tel:+919411828907" className="flex items-center gap-2 text-slate-400 hover:text-violet-300 text-sm transition-colors">
                <Phone size={16} /> +91 9411828907
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="container-max section-padding py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-xs sm:text-sm text-slate-500 m-0">
            © {year} PGSathi. All rights reserved.
          </p>
          <p className="text-xs sm:text-sm text-slate-500 m-0">
            Made with ❤️ in India 🇮🇳
          </p>
        </div>
      </div>
    </footer>
  );
}
