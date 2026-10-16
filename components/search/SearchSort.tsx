"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowUpDown } from "lucide-react";

export default function SearchSort() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "recommended";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value === "recommended") {
      params.delete("sort");
    } else {
      params.set("sort", e.target.value);
    }
    // reset page on sort change
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative w-full sm:w-auto">
      <div className="flex items-center gap-2 bg-white border border-neutral-200 text-xs sm:text-sm font-semibold text-neutral-800 rounded-xl px-3 py-2.5 shadow-sm hover:border-neutral-300 transition-colors w-full sm:w-auto min-h-[42px]">
        <ArrowUpDown size={14} className="text-primary-600 shrink-0" />
        <select
          value={currentSort}
          onChange={handleChange}
          className="bg-transparent border-none outline-none cursor-pointer w-full text-neutral-800 font-semibold pr-4 focus:ring-0"
        >
          <option value="recommended">Sort: Recommended</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="newest">Newest First</option>
        </select>
      </div>
    </div>
  );
}
