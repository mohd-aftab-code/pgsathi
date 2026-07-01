"use client";

import Link from "next/link";
import Image from "next/image";
import { Home, Phone, Mail, Camera, Share2, MessageCircle } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: "#0f172a", color: "#94a3b8" }}>
      {/* Main Footer */}
      <div className="container-max section-padding" style={{ paddingTop: "64px", paddingBottom: "48px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "48px" }}>

          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
              <Image 
                src="/images/logo.jpeg" 
                alt="PGSathi Logo" 
                width={180}
                height={80}
                style={{ height: "80px", width: "auto", objectFit: "contain", borderRadius: "12px", background: "white", padding: "6px" }} 
              />
            </div>
            <p style={{ fontSize: "0.875rem", lineHeight: 1.7, maxWidth: "260px" }}>
              India ka sabse trusted platform PG dhundne ke liye. Verified listings in Metro, Tier 2, and Tier 3 cities, all with no broker fees.
            </p>
            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              {[
                { 
                  label: "Instagram", 
                  href: "https://instagram.com/pgsathi.in", 
                  color: "#E1306C",
                  icon: <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg> 
                },
                { 
                  label: "LinkedIn", 
                  href: "https://www.linkedin.com/company/pg-sathi/posts/?feedView=all", 
                  color: "#0077b5",
                  icon: <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg> 
                },
                { 
                  label: "Twitter", 
                  href: "https://twitter.com/pgsathi", 
                  color: "#1DA1F2",
                  icon: <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg> 
                },
                { 
                  label: "Reddit", 
                  href: "https://reddit.com/r/pgsathi", 
                  color: "#FF4500",
                  icon: <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16.5 12a2.5 2.5 0 0 0-4.5-1.5 6.6 6.6 0 0 0-4 0A2.5 2.5 0 0 0 7.5 12c0 1.2.9 2.2 2.1 2.4.6.9 1.5 1.6 2.4 1.6s1.8-.7 2.4-1.6c1.2-.2 2.1-1.2 2.1-2.4z"></path></svg> 
                },
              ].map(({ icon, href, label, color }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", transition: "all 0.2s", textDecoration: "none" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = color; (e.currentTarget as HTMLElement).style.color = "white"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#1e293b"; (e.currentTarget as HTMLElement).style.color = "#94a3b8"; }}>
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* For Tenants */}
          <div>
            <h4 style={{ color: "white", fontWeight: 600, marginBottom: "16px", fontSize: "0.9375rem" }}>Tenants के लिए</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "PG ढूंढें", href: "/search" },
                { label: "Bangalore में PG", href: "/search?city=bangalore" },
                { label: "Mumbai में PG", href: "/search?city=mumbai" },
                { label: "Kota में PG", href: "/search?city=kota" },
                { label: "Indore में PG", href: "/search?city=indore" },
                { label: "Lucknow में PG", href: "/search?city=lucknow" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} style={{ color: "#94a3b8", fontSize: "0.875rem", textDecoration: "none", transition: "color 0.15s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#c4b5fd"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#94a3b8"}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Owners */}
          <div>
            <h4 style={{ color: "white", fontWeight: 600, marginBottom: "16px", fontSize: "0.9375rem" }}>Owners के लिए</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "PG List करें — Free", href: "/dashboard/owner/listings/new" },
                { label: "Pricing Plans", href: "/pricing" },
                { label: "Owner Dashboard", href: "/dashboard/owner" },
                { label: "Leads Management", href: "/dashboard/owner/leads" },
                { label: "Analytics", href: "/dashboard/owner/analytics" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} style={{ color: "#94a3b8", fontSize: "0.875rem", textDecoration: "none", transition: "color 0.15s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#c4b5fd"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#94a3b8"}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company + Contact */}
          <div>
            <h4 style={{ color: "white", fontWeight: 600, marginBottom: "16px", fontSize: "0.9375rem" }}>Company</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
              {[
                { label: "About Us", href: "/about" },
                { label: "Contact", href: "/contact" },
                { label: "Blog", href: "/blog" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} style={{ color: "#94a3b8", fontSize: "0.875rem", textDecoration: "none", transition: "color 0.15s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#c4b5fd"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#94a3b8"}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <a href="mailto:pgsathi@gmail.com" style={{ display: "flex", alignItems: "center", gap: "8px", color: "#94a3b8", fontSize: "0.875rem", textDecoration: "none" }}>
                <Mail size={14} /> pgsathi@gmail.com
              </a>
              <a href="tel:+919696110243" style={{ display: "flex", alignItems: "center", gap: "8px", color: "#94a3b8", fontSize: "0.875rem", textDecoration: "none" }}>
                <Phone size={14} /> +91 9696110243
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: "1px solid #1e293b" }}>
        <div className="container-max section-padding" style={{ paddingTop: "20px", paddingBottom: "20px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <p style={{ fontSize: "0.8125rem", margin: 0 }}>
            © {year} PGSathi. All rights reserved.
          </p>
          <p style={{ fontSize: "0.8125rem", margin: 0 }}>
            Made with ❤️ in India 🇮🇳
          </p>
        </div>
      </div>
    </footer>
  );
}
