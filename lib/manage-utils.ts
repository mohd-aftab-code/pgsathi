/**
 * lib/manage-utils.ts
 * Shared utility functions for the PG Manager dashboard.
 */

/** Format a number as Indian Rupees, e.g. ₹12,500 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Returns the current month as "YYYY-MM", e.g. "2026-07" */
export function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** Returns a human-readable month label, e.g. "July 2026" */
export function formatMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

/** Format a date as "12 Jul 2026" */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Get first+last initials from a name, e.g. "Rahul Sharma" → "RS" */
export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

/** Get a human-readable date label relative to today */
export function relativeDays(date: Date | string): string {
  const d = new Date(date);
  const today = new Date();
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff > 0) return `In ${diff} days`;
  return `${Math.abs(diff)} days ago`;
}

/** Returns the Date for day 1 of the current month */
export function monthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/** Returns the last Date of the current month */
export function monthEnd(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
}

/** Auto-generate a receipt number: REC-YYYYMM-XXXX */
export function generateReceiptNo(id: number): string {
  const ym = currentMonth().replace("-", "");
  return `REC-${ym}-${String(id).padStart(4, "0")}`;
}

/** Generate a bill number: BILL-YYYYMM-XXXX */
export function generateBillNo(id: number, month: string): string {
  const ym = month.replace("-", "");
  return `BILL-${ym}-${String(id).padStart(4, "0")}`;
}

/** Colour map for plan tiers */
export const PLAN_COLORS: Record<string, string> = {
  PRO:     "bg-purple-100 text-purple-700",
  GROWTH:  "bg-blue-100 text-blue-700",
  STARTER: "bg-neutral-100 text-neutral-600",
  NONE:    "bg-red-100 text-red-600",
};

/** Colour map for complaint/tenant/payment statuses */
export const STATUS_COLORS: Record<string, string> = {
  ACTIVE:      "bg-green-100 text-green-700",
  NOTICE:      "bg-amber-100 text-amber-700",
  VACATED:     "bg-neutral-100 text-neutral-500",
  OPEN:        "bg-red-100 text-red-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  RESOLVED:    "bg-green-100 text-green-700",
  CLOSED:      "bg-neutral-100 text-neutral-500",
  PAID:        "bg-green-100 text-green-700",
  PARTIAL:     "bg-amber-100 text-amber-700",
  PENDING:     "bg-red-100 text-red-700",
  LOW:         "bg-neutral-100 text-neutral-600",
  MEDIUM:      "bg-amber-100 text-amber-700",
  HIGH:        "bg-orange-100 text-orange-700",
  URGENT:      "bg-red-100 text-red-700",
};
