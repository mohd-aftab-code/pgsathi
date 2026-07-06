/**
 * components/manage/StatCard.tsx
 * A reusable stat card for the Manager dashboard.
 */
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  tone?: "green" | "red" | "blue" | "amber" | "purple" | "neutral";
  href?: string;
}

const TONES = {
  green:   { bg: "bg-green-50",   icon: "bg-green-100 text-green-600",   text: "text-green-700" },
  red:     { bg: "bg-red-50",     icon: "bg-red-100 text-red-600",       text: "text-red-700" },
  blue:    { bg: "bg-blue-50",    icon: "bg-blue-100 text-blue-600",     text: "text-blue-700" },
  amber:   { bg: "bg-amber-50",   icon: "bg-amber-100 text-amber-600",   text: "text-amber-700" },
  purple:  { bg: "bg-purple-50",  icon: "bg-purple-100 text-purple-600", text: "text-purple-700" },
  neutral: { bg: "bg-neutral-50", icon: "bg-neutral-100 text-neutral-500", text: "text-neutral-700" },
};

export function StatCard({ icon: Icon, label, value, hint, tone = "neutral", href }: StatCardProps) {
  const colors = TONES[tone];

  const inner = (
    <div className={`rounded-2xl border border-neutral-200 ${colors.bg} p-5 flex items-start gap-4 transition hover:shadow-md`}>
      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${colors.icon}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
        <p className={`mt-0.5 text-2xl font-extrabold ${colors.text} truncate`}>{value}</p>
        {hint && <p className="mt-0.5 text-xs text-neutral-400 truncate">{hint}</p>}
      </div>
    </div>
  );

  if (href) {
    return <a href={href} className="block">{inner}</a>;
  }
  return inner;
}
