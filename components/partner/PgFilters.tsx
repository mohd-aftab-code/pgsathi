"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, Loader2 } from "lucide-react";

/**
 * Search + status filter for the partner PG list. Updates the URL (which the
 * server page reads) — the list itself is server-rendered and partnerId-scoped.
 * Optimistic local state so controls don't snap back during navigation.
 */
export function PgFilters({ q, status }: { q: string; status: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();
  const [search, setSearch] = useState(q);
  const [st, setSt] = useState(status);

  useEffect(() => setSearch(q), [q]);
  useEffect(() => setSt(status), [status]);

  function navigate(next: { q?: string; status?: string }) {
    const sp = new URLSearchParams();
    const nq = next.q ?? search;
    const ns = next.status ?? st;
    if (nq) sp.set("q", nq);
    if (ns) sp.set("status", ns);
    const qs = sp.toString();
    start(() => router.push(qs ? `${pathname}?${qs}` : pathname));
  }

  const sel =
    "h-10 px-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none cursor-pointer";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form
        onSubmit={(e) => { e.preventDefault(); navigate({ q: search }); }}
        className="relative flex-1 min-w-[180px]"
      >
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onBlur={() => { if (search !== q) navigate({ q: search }); }}
          placeholder="Search by name, address or PIN…"
          className="w-full h-10 pl-9 pr-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none"
        />
      </form>

      <select value={st} onChange={(e) => { setSt(e.target.value); navigate({ status: e.target.value }); }} className={sel}>
        <option value="">All Status</option>
        <option value="PENDING">Pending</option>
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
        <option value="REJECTED">Rejected</option>
      </select>

      {pending && <Loader2 size={16} className="animate-spin text-primary-500" />}
    </div>
  );
}
