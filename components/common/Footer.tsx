"use client";

import Link from "next/link";
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
              <img 
                src="/images/logo.jpeg" 
                alt="PGSathi Logo" 
                style={{ height: "80px", width: "auto", objectFit: "contain", borderRadius: "12px", background: "white", padding: "6px" }} 
              />
            </div>
            <p style={{ fontSize: "0.875rem", lineHeight: 1.7, maxWidth: "260px" }}>
              India ka sabse trusted platform PG dhundne ke liye. Verified listings, no broker fees.
            </p>
            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              {[
                { icon: Camera, href: "https://instagram.com/pgsathi", label: "Instagram" },
                { icon: Share2, href: "https://facebook.com/pgsathi", label: "Facebook" },
                { icon: MessageCircle, href: "https://twitter.com/pgsathi", label: "Twitter" },
              ].map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", transition: "all 0.2s", textDecoration: "none" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#6d28d9"; (e.currentTarget as HTMLElement).style.color = "white"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#1e293b"; (e.currentTarget as HTMLElement).style.color = "#94a3b8"; }}>
                  <Icon size={16} />
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
                { label: "Kota में PG", href: "/city/kota" },
                { label: "Jaipur में PG", href: "/city/jaipur" },
                { label: "Pune में PG", href: "/city/pune" },
                { label: "Boys PG", href: "/search?gender=BOYS" },
                { label: "Girls PG", href: "/search?gender=GIRLS" },
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
              <a href="mailto:hello@pgsathi.in" style={{ display: "flex", alignItems: "center", gap: "8px", color: "#94a3b8", fontSize: "0.875rem", textDecoration: "none" }}>
                <Mail size={14} /> hello@pgsathi.in
              </a>
              <a href="tel:+911234567890" style={{ display: "flex", alignItems: "center", gap: "8px", color: "#94a3b8", fontSize: "0.875rem", textDecoration: "none" }}>
                <Phone size={14} /> +91 12345 67890
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
