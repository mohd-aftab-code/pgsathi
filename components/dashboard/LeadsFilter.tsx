"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter } from "lucide-react";
import { useState } from "react";

export function LeadsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get("q") || "";
  const currentStatus = searchParams.get("status") || "ALL";

  const [searchQuery, setSearchQuery] = useState(currentQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    } else {
      params.delete("q");
    }
    router.push(`?${params.toString()}`);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value !== "ALL") {
      params.set("status", e.target.value);
    } else {
      params.delete("status");
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-neutral-100">
      <form onSubmit={handleSearch} className="relative flex-1 w-full">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, phone or email..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm transition-all"
        />
      </form>
      <div className="relative shrink-0 w-full sm:w-auto">
        <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
        <select 
          value={currentStatus}
          onChange={handleStatusChange}
          className="w-full sm:w-auto pl-9 pr-8 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm font-semibold text-neutral-700 appearance-none cursor-pointer"
        >
          <option value="ALL">All Leads</option>
          <option value="UNREAD">Unread Only</option>
          <option value="READ">Read Only</option>
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
      </div>
    </div>
  );
}
