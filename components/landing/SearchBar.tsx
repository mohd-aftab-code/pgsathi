"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Building } from "lucide-react";
import { CITIES } from "@/constants/cities";

export default function SearchBar({ initialCity = "", initialGender = "", initialQuery = "", cities = CITIES as any[] }) {
  const router = useRouter();
  const [city, setCity] = useState(initialCity);
  const [gender, setGender] = useState(initialGender);
  const [query, setQuery] = useState(initialQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (city && city !== "all") params.set("city", city);
    if (gender && gender !== "all") params.set("gender", gender);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-2 w-full">
      
      {/* Free Text Search */}
      <div className="flex-[2] relative flex items-center bg-white rounded-xl border border-neutral-200 shadow-sm focus-within:ring-2 focus-within:ring-orange-500 transition-all">
        <Search className="absolute left-4 text-neutral-400" size={20} />
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by PG name or locality..."
          className="w-full h-12 pl-12 pr-4 bg-transparent border-none text-neutral-900 font-medium focus:ring-0 outline-none"
        />
      </div>

      <div className="flex-1 relative flex items-center bg-white rounded-xl border border-neutral-200 shadow-sm focus-within:ring-2 focus-within:ring-orange-500 transition-all">
        <MapPin className="absolute left-4 text-neutral-400" size={20} />
        <select 
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full h-12 pl-12 pr-4 bg-transparent border-none text-neutral-900 font-medium focus:ring-0 appearance-none cursor-pointer outline-none"
        >
          <option value="" disabled>Select City</option>
          <option value="all">All Cities</option>
          {cities.map(c => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>
      
      <div className="flex-1 relative flex items-center bg-white rounded-xl border border-neutral-200 shadow-sm focus-within:ring-2 focus-within:ring-orange-500 transition-all">
        <Building className="absolute left-4 text-neutral-400" size={20} />
        <select 
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full h-12 pl-12 pr-4 bg-transparent border-none text-neutral-900 font-medium focus:ring-0 appearance-none cursor-pointer outline-none"
        >
          <option value="" disabled>Looking for</option>
          <option value="all">Anyone</option>
          <option value="BOYS">Boys PG</option>
          <option value="GIRLS">Girls PG</option>
          <option value="COED">Co-ed PG</option>
        </select>
      </div>

      <button type="submit" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-xl font-bold transition-transform hover:scale-105 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shadow-md">
        <Search size={20} /> Search
      </button>
    </form>
  );
}
