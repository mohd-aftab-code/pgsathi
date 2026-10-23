"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, Search, PlusCircle, LogIn, LayoutDashboard, Handshake, Phone, Building } from "lucide-react";

import logoImg from "@/app/assets/logo/logo in vertical.png";

export default function Navbar({ user }: { user?: any }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300">
      <div className="container-max section-padding">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center no-underline shrink-0" aria-label="PGSathi Home">
            <Image 
              src={logoImg} 
              alt="PGSathi Logo" 
              width={180}
              height={64}
              priority
              className="h-12 md:h-16 w-auto object-contain mix-blend-multiply" 
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            <Link 
              href="/search" 
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-700 font-semibold text-sm transition-all hover:bg-primary-50 hover:text-primary-700"
            >
              <Search size={16} className="text-primary-600" /> 
              <span>Find PGs</span>
            </Link>

            <Link 
              href="/for-owners" 
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-700 font-semibold text-sm transition-all hover:bg-primary-50 hover:text-primary-700"
            >
              <Building size={16} className="text-primary-600" /> 
              <span>For Owners</span>
            </Link>

            <Link 
              href="/partner" 
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-700 font-semibold text-sm transition-all hover:bg-primary-50 hover:text-primary-700 group"
            >
              <Handshake size={16} className="text-primary-600" /> 
              <span>Partner</span>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200 group-hover:bg-emerald-100 transition-colors">
                10%
              </span>
            </Link>

            <Link 
              href="/pg-management-software" 
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 font-medium text-sm transition-all hover:bg-primary-50 hover:text-primary-700"
            >
              <span>PG Software</span>
            </Link>

            <Link 
              href="/contact" 
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-slate-600 font-medium text-sm transition-all hover:bg-primary-50 hover:text-primary-700"
            >
              <Phone size={15} /> 
              <span>Contact</span>
            </Link>

            <div className="h-6 w-px bg-slate-200 mx-1 hidden lg:block" />

            <Link 
              href="/dashboard/owner/listings/new" 
              className="border-2 border-primary-500 text-primary-700 hover:bg-primary-50 font-bold px-3.5 py-2 rounded-xl text-sm transition-all flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle size={15} /> 
              <span>List PG Free</span>
            </Link>
            
            {user ? (
              <Link href="/dashboard" className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl">
                <LayoutDashboard size={15} /> 
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link href="/login" className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl">
                <LogIn size={15} /> 
                <span>Login</span>
              </Link>
            )}
          </nav>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex items-center justify-center p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl px-4 py-5 flex flex-col gap-3 animate-fade-in max-h-[calc(100vh-5rem)] overflow-y-auto">
          {/* Section 1: Tenants */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-3 mb-1.5">
              For Students &amp; Tenants
            </span>
            <Link 
              href="/search" 
              onClick={() => setMenuOpen(false)} 
              className="flex items-center justify-between px-4 py-3 rounded-xl text-slate-800 font-bold bg-slate-50 hover:bg-primary-50 active:bg-primary-100 transition-colors"
            >
              <span className="flex items-center gap-3">
                <Search size={18} className="text-primary-600" /> Find PGs (Zero Brokerage)
              </span>
              <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                Free
              </span>
            </Link>
          </div>

          {/* Section 2: PG Owners */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-3 mb-1.5">
              For PG &amp; Hostel Owners
            </span>
            <div className="space-y-1.5">
              <Link 
                href="/for-owners" 
                onClick={() => setMenuOpen(false)} 
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
              >
                <Building size={18} className="text-primary-600" /> Owner Benefits &amp; Leads
              </Link>
              <Link 
                href="/pg-management-software" 
                onClick={() => setMenuOpen(false)} 
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
              >
                <LayoutDashboard size={18} className="text-primary-600" /> PG Management CRM
              </Link>
            </div>
          </div>

          {/* Section 3: Partners */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-3 mb-1.5">
              For Affiliates &amp; Students
            </span>
            <Link 
              href="/partner" 
              onClick={() => setMenuOpen(false)} 
              className="flex items-center justify-between px-4 py-3 rounded-xl text-slate-800 font-bold bg-slate-50 hover:bg-primary-50 transition-colors"
            >
              <span className="flex items-center gap-3">
                <Handshake size={18} className="text-primary-600" /> Partner Programme
              </span>
              <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
                Earn 10%
              </span>
            </Link>
          </div>

          <div className="h-px bg-slate-100 my-1"></div>

          <Link 
            href="/contact" 
            onClick={() => setMenuOpen(false)} 
            className="flex items-center gap-3 px-4 py-2 text-slate-600 font-medium hover:text-primary-700 transition-colors text-sm"
          >
            <Phone size={16} className="text-slate-400" /> Need Help? Contact Support
          </Link>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col gap-2.5">
            <Link 
              href="/dashboard/owner/listings/new" 
              onClick={() => setMenuOpen(false)} 
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border-2 border-primary-500 text-primary-700 font-bold bg-primary-50/50 active:bg-primary-100 transition-colors"
            >
              <PlusCircle size={18} /> List Your PG for Free
            </Link>
            
            {user ? (
              <Link 
                href="/dashboard" 
                onClick={() => setMenuOpen(false)} 
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold shadow-lg shadow-primary-600/20 active:scale-[0.98] transition-transform"
              >
                <LayoutDashboard size={18} /> Go to Dashboard
              </Link>
            ) : (
              <Link 
                href="/login" 
                onClick={() => setMenuOpen(false)} 
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold shadow-lg shadow-primary-600/20 active:scale-[0.98] transition-transform"
              >
                <LogIn size={18} /> Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
