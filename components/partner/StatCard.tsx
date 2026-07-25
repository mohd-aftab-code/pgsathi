import Link from "next/link";
import type { LucideIcon } from "lucide-react";

/** Tone → the card's icon colours. Kept as whole class strings so Tailwind's
 *  scanner can see them (constructed class names get purged). */
const TONES = {
  violet: "bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400",
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
  green: "bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
  red: "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400",
  slate: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
} as const;

export type StatTone = keyof typeof TONES;

export function StatCard({
  label,
  value,
  sub,
  Icon,
  tone = "slate",
  accent = false,
  href,
}: {
  label: string;
  value: string;
  sub?: string;
  Icon: LucideIcon;
  tone?: StatTone;
  accent?: boolean;
  /** When given, the whole card becomes a link to this page. */
  href?: string;
}) {
  const cardClass = `group block rounded-2xl border p-4 sm:p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
    href ? "cursor-pointer" : ""
  } ${
    accent
      ? "bg-gradient-to-br from-primary-600 to-primary-500 border-transparent text-white shadow-primary-500/20"
      : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-primary-200 dark:hover:border-primary-800"
  }`;

  const inner = (
    <>
      <div className="flex items-start justify-between gap-2 mb-3">
        <span
          className={`text-xs sm:text-sm font-medium leading-tight ${
            accent ? "text-primary-100" : "text-neutral-500 dark:text-neutral-400"
          }`}
        >
          {label}
        </span>
        <div
          className={`p-2 rounded-lg shrink-0 transition-transform duration-300 group-hover:scale-110 ${
            accent ? "bg-white/15 text-white" : TONES[tone]
          }`}
        >
          <Icon size={16} />
        </div>
      </div>
      <div className={`text-xl sm:text-2xl font-bold truncate ${accent ? "text-white" : "text-neutral-900 dark:text-white"}`}>
        {value}
      </div>
      {sub && (
        <div className={`text-[11px] mt-1.5 line-clamp-1 ${accent ? "text-primary-100" : "text-neutral-400 dark:text-neutral-500"}`}>
          {sub}
        </div>
      )}
    </>
  );

  // A linked card navigates on click; a plain card is display-only.
  return href ? (
    <Link href={href} className={cardClass}>{inner}</Link>
  ) : (
    <div className={cardClass}>{inner}</div>
  );
}
