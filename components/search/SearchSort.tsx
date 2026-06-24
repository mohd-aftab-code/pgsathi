"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

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
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      value={currentSort}
      onChange={handleChange}
      className="bg-white border border-neutral-200 text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
    >
      <option value="recommended">Sort by: Recommended</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
      <option value="newest">Newest First</option>
    </select>
  );
}
