"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * A property (PG) filter dropdown that applies instantly on change — no submit
 * button. Uses optimistic local state so the dropdown shows the chosen PG
 * immediately (no "snap-back" to the old value while the server re-renders),
 * then navigates + refreshes so the page's data is scoped to that property.
 */
export function PropertyFilterSelect({
  listings,
  value,
  className,
}: {
  listings: { id: number; title: string }[];
  value?: number;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState(value ? String(value) : "");

  // Keep the dropdown in sync when the server re-renders (back/forward, etc.)
  useEffect(() => {
    setSelected(value ? String(value) : "");
  }, [value]);

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value;
    setSelected(v); // optimistic — the select never snaps back to the old PG
    const sp = new URLSearchParams(params?.toString() ?? "");
    if (v) sp.set("listingId", v);
    else sp.delete("listingId");
    const qs = sp.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
      router.refresh();
    });
  }

  return (
    <div className="relative inline-flex items-center">
      <select
        value={selected}
        onChange={onChange}
        aria-label="Filter by property"
        className={className ?? "input-base w-48 text-sm cursor-pointer bg-white"}
      >
        <option value="">All Properties</option>
        {listings.map((l) => (
          <option key={l.id} value={l.id}>
            {l.title}
          </option>
        ))}
      </select>
      {pending && (
        <Loader2 size={14} className="animate-spin text-violet-500 absolute right-7 pointer-events-none" />
      )}
    </div>
  );
}
