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
    <div className="flex flex-col items-center justify-center py-16 text-center px-4 border-2 border-dashed border-neutral-200 rounded-3xl bg-neutral-50/50 my-6">
      <div className="bg-white p-4 rounded-full shadow-sm mb-4">
        <Icon className="h-10 w-10 text-neutral-300" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-bold text-neutral-900 mb-1">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-neutral-500 mb-6">{description}</p>
      {actionLabel && actionHref && (
        <Link 
          href={actionHref} 
          className="bg-primary-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-600 transition flex items-center gap-2 shadow-sm hover:shadow-md"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
