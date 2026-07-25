import Link from "next/link";
import { Handshake, Building2, IndianRupee, BarChart3, ShieldCheck, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Partner Programme — Refer & Earn | PGSathi",
  description:
    "PGSathi Partner Programme — PG register karein aur har paid conversion par earning paayein. Freelancers, channel partners, sub brokers ke liye.",
};

const STEPS = [
  { Icon: Handshake, title: "Register karein", body: "Partner ke roop mein sign up karein. Admin approval ke baad portal khul jayega." },
  { Icon: Building2, title: "PG add karein", body: "PG owner ki details bharein — listing unke naam par banegi, credit aapko milega." },
  { Icon: IndianRupee, title: "Earning paayein", body: "PG paid plan par jaate hi earning ban jaati hai. Amount admin decide karta hai." },
];

const FEATURES = [
  { Icon: BarChart3, title: "Apna dashboard", body: "Registered PGs, active/paid count, earnings aur renewals — sab ek jagah." },
  { Icon: ShieldCheck, title: "Aapka data sirf aapka", body: "Har partner sirf apne registered PGs dekhta hai. Kisi aur ka data kabhi nahi." },
  { Icon: IndianRupee, title: "Transparent earnings", body: "Pending, approved aur paid — har earning ka status saaf dikhta hai." },
];

export default function PartnerLandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Header */}
      <header className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/partner" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-500 grid place-items-center">
              <Handshake className="text-white" size={18} />
            </div>
            <div>
              <div className="font-extrabold text-neutral-900 dark:text-white text-sm leading-tight">PGSathi</div>
              <div className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Partner</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/partner/login"
              className="px-4 py-2 rounded-xl text-sm font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              Login
            </Link>
            <Link
              href="/partner/signup"
              className="px-4 py-2 rounded-xl text-sm font-bold bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/25 transition"
            >
              Partner banein
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-14 text-center">
        <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-3 py-1.5 rounded-full mb-5">
          Refer &amp; Earn
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight mb-4">
          PG register karein.<br className="hidden sm:block" /> Earning paayein.
        </h1>
        <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto mb-8">
          Freelancers, channel partners, marketing &amp; sales executives aur sub brokers ke liye —
          apne PGs laayein, apna business track karein.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/partner/signup"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold shadow-lg shadow-primary-500/25 transition"
          >
            Abhi register karein <ArrowRight size={17} />
          </Link>
          <Link
            href="/partner/login"
            className="px-6 py-3.5 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
          >
            Login
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 border-t border-neutral-200 dark:border-neutral-800">
        <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white text-center mb-10">Kaise kaam karta hai</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
              <span className="absolute -top-3 left-6 w-7 h-7 rounded-full bg-primary-500 text-white text-xs font-bold grid place-items-center shadow">
                {i + 1}
              </span>
              <s.Icon className="text-primary-600 dark:text-primary-400 mb-3 mt-2" size={24} />
              <h3 className="font-bold text-neutral-900 dark:text-white mb-1.5">{s.title}</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 border-t border-neutral-200 dark:border-neutral-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="p-6">
              <f.Icon className="text-primary-600 dark:text-primary-400 mb-3" size={22} />
              <h3 className="font-bold text-neutral-900 dark:text-white mb-1.5">{f.title}</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="rounded-3xl bg-gradient-to-br from-primary-600 to-primary-500 px-8 py-12 text-center text-white shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Aaj hi shuru karein</h2>
          <p className="text-primary-100 mb-7 max-w-lg mx-auto">
            Registration free hai. Admin approval ke baad aapka partner dashboard chalu ho jayega.
          </p>
          <Link
            href="/partner/signup"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-primary-700 font-extrabold hover:bg-primary-50 transition shadow-lg"
          >
            Partner banein <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-8 text-center text-sm text-neutral-400 dark:text-neutral-500">
        <Link href="/" className="hover:underline">← PGSathi main site</Link>
      </footer>
    </div>
  );
}
