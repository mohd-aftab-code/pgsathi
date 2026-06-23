"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";
import { CITIES } from "@/constants/cities";

export default function SearchBar({ initialCity = "", initialGender = "", cities = CITIES as any[] }) {
  const router = useRouter();
  const [city, setCity] = useState(initialCity);
  const [gender, setGender] = useState(initialGender);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (gender) params.set("gender", gender);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2 w-full">
      <div className="flex-1 relative flex items-center bg-white rounded-xl border border-neutral-200">
        <MapPin className="absolute left-4 text-neutral-400" size={20} />
        <select 
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full h-12 pl-12 pr-4 bg-transparent border-none text-neutral-900 font-medium focus:ring-0 appearance-none cursor-pointer"
        >
          <option value="" disabled>Select City</option>
          <option value="all">All Cities</option>
          {cities.map(c => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>
      
      <div className="flex-1 relative flex items-center bg-white rounded-xl border border-neutral-200">
        <select 
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full h-12 px-4 bg-transparent border-none text-neutral-900 font-medium focus:ring-0 appearance-none cursor-pointer"
        >
          <option value="" disabled>Looking for</option>
          <option value="all">Anyone</option>
          <option value="BOYS">Boys PG</option>
          <option value="GIRLS">Girls PG</option>
          <option value="COED">Co-ed PG</option>
        </select>
      </div>

      <button type="submit" className="bg-secondary-600 hover:bg-secondary-700 text-white px-8 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer">
        <Search size={20} /> Search
      </button>
    </form>
  );
}
