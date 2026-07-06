/**
 * components/manage/EmptyState.tsx
 * Generic empty state for all manager list pages.
 */
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, actionHref }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary-50 mb-4">
        <Icon className="h-8 w-8 text-primary-400" />
      </div>
      <h3 className="text-lg font-bold text-neutral-900">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-neutral-500">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="mt-6 btn-primary text-sm px-5 py-2.5">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
