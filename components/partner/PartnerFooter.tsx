import Link from "next/link";
import { Handshake } from "lucide-react";

/**
 * Slim footer for the public partner pages.
 *
 * The site-wide Footer used to sit here, and it carries the tenant and owner
 * funnels — "List PG for Free", the owner dashboard links, the general /login.
 * Someone who came to join as a partner should not be offered a tenant or owner
 * signup on the same page, so this footer carries only partner actions plus the
 * legal/support links every page needs.
 */
export default function PartnerFooter() {
  return (
    <footer className="bg-neutral-900 text-neutral-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          <div className="max-w-sm">
            <Link href="/partner" className="inline-flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary-500 grid place-items-center shrink-0">
                <Handshake className="text-white" size={18} />
              </div>
              <div>
                <div className="font-extrabold text-white text-sm leading-tight">PGSathi</div>
                <div className="text-[10px] font-bold text-primary-400 uppercase tracking-wider">Partner</div>
              </div>
            </Link>
            <p className="text-sm leading-relaxed">
              Onboard PG owners in your city and earn lifetime commissions on every paid
              plan they buy. Registration is free.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-8">
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Partner</h4>
              <ul className="flex flex-col gap-2.5 text-sm">
                {[
                  { label: "Join as Partner", href: "/partner/signup" },
                  { label: "Partner Login", href: "/partner/login" },
                  { label: "Partner Dashboard", href: "/partner/dashboard" },
                  { label: "Track Earnings", href: "/partner/earnings" },
                ].map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} className="hover:text-primary-400 transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Company</h4>
              <ul className="flex flex-col gap-2.5 text-sm">
                {[
                  { label: "Help & Support", href: "/help" },
                  { label: "Contact Us", href: "/contact" },
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms of Service", href: "/terms" },
                ].map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} className="hover:text-primary-400 transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-10 pt-6 text-xs">
          &copy; {new Date().getFullYear()} PGSathi. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
