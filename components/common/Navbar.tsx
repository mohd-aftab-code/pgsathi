"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Home, Search, PlusCircle, User, LogIn } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <div className="container-max section-padding">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "80px" }}>

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <img 
              src="/images/logo.jpeg" 
              alt="PGSathi Logo" 
              style={{ height: "72px", width: "auto", objectFit: "contain", mixBlendMode: "multiply" }} 
            />
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: "8px" }} className="desktop-nav">
            <Link href="/search" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", color: "#475569", fontWeight: 500, fontSize: "0.9rem", textDecoration: "none", transition: "all 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f5f3ff"; (e.currentTarget as HTMLElement).style.color = "#6d28d9"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#475569"; }}>
              <Search size={16} /> PG ढूंढें
            </Link>
            <Link href="/pricing" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", color: "#475569", fontWeight: 500, fontSize: "0.9rem", textDecoration: "none", transition: "all 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f5f3ff"; (e.currentTarget as HTMLElement).style.color = "#6d28d9"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#475569"; }}>
              Pricing
            </Link>
            <Link href="/dashboard/owner/listings/new" className="btn-outline" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", fontSize: "0.875rem" }}>
              <PlusCircle size={15} /> PG List करें
            </Link>
            <Link href="/login" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", fontSize: "0.875rem" }}>
              <LogIn size={15} /> Login
            </Link>
          </nav>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "8px", borderRadius: "8px", color: "#334155" }}
            className="mobile-menu-btn"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          background: "white",
          borderTop: "1px solid #e2e8f0",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}>
          <Link href="/search" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderRadius: "10px", color: "#334155", fontWeight: 500, textDecoration: "none", background: "#f8fafc" }}>
            <Search size={18} color="#6d28d9" /> PG ढूंढें
          </Link>
          <Link href="/pricing" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderRadius: "10px", color: "#334155", fontWeight: 500, textDecoration: "none", background: "#f8fafc" }}>
            Pricing Plans
          </Link>
          <Link href="/dashboard/owner/listings/new" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderRadius: "10px", background: "#f5f3ff", color: "#6d28d9", fontWeight: 600, textDecoration: "none" }}>
            <PlusCircle size={18} /> PG List करें — Free
          </Link>
          <Link href="/login" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "12px", borderRadius: "10px", background: "linear-gradient(135deg, #6d28d9, #7c3aed)", color: "white", fontWeight: 600, textDecoration: "none" }}>
            <LogIn size={18} /> Login / Register
          </Link>
        </div>
      )}

      <style>{`
        .desktop-nav { display: none; }
        .mobile-menu-btn { display: flex; }
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </header>
  );
}
