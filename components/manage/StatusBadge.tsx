/**
 * components/manage/StatusBadge.tsx
 * Coloured badge for tenant/complaint/payment statuses.
 */

interface Props {
  status: string;
  className?: string;
}

const COLORS: Record<string, string> = {
  // Tenant
  ACTIVE:      "bg-green-100 text-green-700",
  NOTICE:      "bg-amber-100 text-amber-700",
  VACATED:     "bg-neutral-100 text-neutral-500",
  // Complaint
  OPEN:        "bg-red-100 text-red-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  RESOLVED:    "bg-green-100 text-green-700",
  CLOSED:      "bg-neutral-100 text-neutral-500",
  // Payment
  PAID:        "bg-green-100 text-green-700",
  PARTIAL:     "bg-amber-100 text-amber-700",
  PENDING:     "bg-red-100 text-red-700",
  // Priority
  LOW:         "bg-neutral-100 text-neutral-600",
  MEDIUM:      "bg-amber-100 text-amber-700",
  HIGH:        "bg-orange-100 text-orange-700",
  URGENT:      "bg-red-100 text-red-700",
  // Expense / document
  VERIFIED:    "bg-green-100 text-green-700",
  REJECTED:    "bg-red-100 text-red-700",
  DRAFT:       "bg-neutral-100 text-neutral-500",
};

export function StatusBadge({ status, className = "" }: Props) {
  const color = COLORS[status] ?? "bg-neutral-100 text-neutral-500";
  const label = status.replace(/_/g, " ");
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${color} ${className}`}>
      {label}
    </span>
  );
}
