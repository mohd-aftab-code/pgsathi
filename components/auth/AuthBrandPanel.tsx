import Link from "next/link";
import Image from "next/image";
import logoImg from "@/app/assets/logo/logo in vertical.png";

interface Stat {
  value: string;
  label: string;
}

export default function AuthBrandPanel({
  eyebrow,
  headline,
  accentWord,
  subtext,
  stats,
  footer,
}: {
  eyebrow: string;
  headline: string;
  accentWord: string;
  subtext: string;
  stats: Stat[];
  footer: string;
}) {
  return (
    <div className="hidden lg:flex flex-col justify-between w-[42%] xl:w-[40%] bg-primary-950 relative overflow-hidden p-10 xl:p-14">
      {/* Faint grid texture only — no blur blobs, no glass */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <Link href="/" className="relative z-10 flex items-center gap-3 group w-fit">
        <Image
          src={logoImg}
          alt="PGSathi Logo"
          width={180}
          height={64}
          priority
          className="h-16 w-auto object-contain brightness-0 invert group-hover:scale-105 transition-transform"
        />
      </Link>

      <div className="relative z-10">
        <div className="flex items-center gap-2.5 text-xs font-bold text-primary-300 uppercase tracking-widest mb-6">
          <span className="w-6 h-px bg-primary-400" />
          {eyebrow}
        </div>

        <h1 className="text-4xl xl:text-[2.75rem] font-extrabold text-white leading-[1.15] mb-5 tracking-tight" style={{ textWrap: "balance" }}>
          {headline} <span className="text-primary-300">{accentWord}</span>
        </h1>

        <p className="text-primary-200/70 text-base leading-relaxed mb-12 max-w-sm">
          {subtext}
        </p>

        <div className="divide-y divide-white/10 border-y border-white/10">
          {stats.map((s) => (
            <div key={s.label} className="flex items-baseline justify-between py-4">
              <span className="text-2xl font-extrabold text-white">{s.value}</span>
              <span className="text-sm text-primary-200/70 font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 text-xs text-primary-300/50 font-medium">
        {footer}
      </div>
    </div>
  );
}
