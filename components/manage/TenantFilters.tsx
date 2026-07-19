"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, Loader2 } from "lucide-react";

/**
 * Search + status + property filters for the tenant directory.
 * Every control applies immediately (the old markup relied on a hidden submit
 * button, so changing a dropdown did nothing). Selections are optimistic so the
 * control never snaps back while the server re-renders.
 */
export function TenantFilters({
  q,
  status,
  listingId,
  listings,
}: {
  q: string;
  status: string;
  listingId?: number;
  listings: { id: number; title: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const [search, setSearch] = useState(q);
  const [st, setSt] = useState(status);
  const [pg, setPg] = useState(listingId ? String(listingId) : "");

  useEffect(() => setSearch(q), [q]);
  useEffect(() => setSt(status), [status]);
  useEffect(() => setPg(listingId ? String(listingId) : ""), [listingId]);

  function navigate(next: { q?: string; status?: string; listingId?: string }) {
    const sp = new URLSearchParams();
    const nq = next.q ?? search;
    const ns = next.status ?? st;
    const np = next.listingId ?? pg;
    if (nq) sp.set("q", nq);
    if (ns) sp.set("status", ns);
    if (np) sp.set("listingId", np);
    // filters always reset to page 1
    const qs = sp.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
      router.refresh();
    });
  }

  const selectCls =
    "py-1.5 px-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 bg-white shadow-sm cursor-pointer";

  return (
    <div className="flex-1 md:flex-none flex items-center gap-2">
      <form
        onSubmit={(e) => { e.preventDefault(); navigate({ q: search }); }}
        className="relative"
      >
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onBlur={() => { if (search !== q) navigate({ q: search }); }}
          placeholder="Search name or phone…"
          aria-label="Search tenants"
          className="pl-8 pr-3 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 w-full md:w-48 bg-white shadow-sm"
        />
      </form>

      <select
        value={st}
        aria-label="Filter by status"
        onChange={(e) => { setSt(e.target.value); navigate({ status: e.target.value }); }}
        className={selectCls}
      >
        <option value="">All Status</option>
        <option value="ACTIVE">Active</option>
        <option value="NOTICE">Notice</option>
        <option value="VACATED">Vacated</option>
      </select>

      <select
        value={pg}
        aria-label="Filter by property"
        onChange={(e) => { setPg(e.target.value); navigate({ listingId: e.target.value }); }}
        className={`${selectCls} max-w-[150px] truncate hidden sm:block`}
      >
        <option value="">All Properties</option>
        {listings.map((l) => (
          <option key={l.id} value={l.id}>{l.title}</option>
        ))}
      </select>

      {pending && <Loader2 size={14} className="animate-spin text-violet-500 shrink-0" />}
    </div>
  );
}
