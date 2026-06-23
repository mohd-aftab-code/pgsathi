"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, Search, PlusCircle, LogIn } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300">
      <div className="container-max section-padding">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center no-underline shrink-0">
            <Image 
              src="/images/logo.jpeg" 
              alt="PGSathi Logo" 
              width={180}
              height={64}
              priority
              className="h-12 md:h-16 w-auto object-contain mix-blend-multiply" 
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            <Link href="/search" className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-slate-600 font-medium text-sm transition-colors hover:bg-primary-50 hover:text-primary-700">
              <Search size={16} /> Search PGs
            </Link>
            <Link href="/pricing" className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-slate-600 font-medium text-sm transition-colors hover:bg-primary-50 hover:text-primary-700">
              Pricing
            </Link>
            <Link href="/dashboard/owner/listings/new" className="btn-outline flex items-center gap-1.5 px-4 py-2 text-sm ml-2">
              <PlusCircle size={15} /> List PG
            </Link>
            <Link href="/login" className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm">
              <LogIn size={15} /> Login
            </Link>
          </nav>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex items-center justify-center p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-lg px-4 py-4 flex flex-col gap-3 animate-fade-in">
          <Link href="/search" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 font-medium bg-slate-50 active:bg-slate-100 transition-colors">
            <Search size={18} className="text-primary-600" /> Search PGs
          </Link>
          <Link href="/pricing" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 font-medium bg-slate-50 active:bg-slate-100 transition-colors">
            Pricing Plans
          </Link>
          <div className="h-px bg-slate-100 my-1"></div>
          <Link href="/dashboard/owner/listings/new" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-50 text-primary-700 font-bold active:bg-primary-100 transition-colors">
            <PlusCircle size={18} /> List PG For Free
          </Link>
          <Link href="/login" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold active:scale-[0.98] transition-transform">
            <LogIn size={18} /> Login / Register
          </Link>
        </div>
      )}
    </header>
  );
}
