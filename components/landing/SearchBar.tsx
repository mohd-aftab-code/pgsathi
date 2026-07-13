"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Building } from "lucide-react";
import { CITIES } from "@/constants/cities";

export default function SearchBar({ initialCity = "", initialGender = "", initialQuery = "", cities = CITIES as any[] }) {
  const router = useRouter();
  const [cityInput, setCityInput] = useState(() => {
    if (initialCity && initialCity !== "all") {
      return cities.find((c: any) => c.slug === initialCity)?.name || initialCity;
    }
    return "";
  });
  const [gender, setGender] = useState(initialGender);
  const [query, setQuery] = useState(initialQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    
    // Find matching city slug based on typed input
    const matchedCity = cities.find((c: any) => c.name.toLowerCase() === cityInput.toLowerCase());
    const finalCitySlug = matchedCity ? matchedCity.slug : (cityInput ? cityInput.toLowerCase().replace(/\s+/g, '-') : "all");
    
    if (finalCitySlug && finalCitySlug !== "all") params.set("city", finalCitySlug);
    if (gender && gender !== "all") params.set("gender", gender);
    
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form 
      onSubmit={handleSearch} 
      className="flex flex-col lg:flex-row items-center w-full bg-transparent lg:bg-white lg:rounded-full rounded-2xl lg:border border-neutral-200 lg:shadow-sm lg:p-1.5 gap-3 lg:gap-0"
    >
      
      {/* Searchable City Input */}
      <div className="w-full lg:flex-1 relative flex items-center lg:border-r border-neutral-200 bg-white lg:bg-transparent rounded-xl lg:rounded-l-full lg:rounded-r-none border lg:border-none border-neutral-200 px-2 lg:px-4 h-14 transition-all focus-within:bg-neutral-50 hover:bg-neutral-50 cursor-pointer shadow-sm lg:shadow-none">
        <MapPin className="text-neutral-400 shrink-0 ml-2" size={20} />
        <input 
          type="text" 
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
          list="cities-datalist"
          placeholder="Select City"
          className="w-full h-full bg-transparent border-none text-neutral-900 font-medium focus:ring-0 outline-none px-3"
        />
        <datalist id="cities-datalist">
          {cities.map((c: any) => (
            <option key={c.slug} value={c.name} />
          ))}
        </datalist>
      </div>

      {/* Free Text Search (Area/Location) */}
      <div className="w-full lg:flex-[2] relative flex items-center lg:border-r border-neutral-200 bg-white lg:bg-transparent rounded-xl lg:rounded-none border lg:border-none border-neutral-200 px-2 lg:px-4 h-14 transition-all focus-within:bg-neutral-50 hover:bg-neutral-50 cursor-text shadow-sm lg:shadow-none">
        <Search className="text-neutral-400 shrink-0 ml-2" size={20} />
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter area, location, or landmark..."
          className="w-full h-full bg-transparent border-none text-neutral-900 font-medium focus:ring-0 outline-none px-3 truncate"
        />
      </div>
      
      {/* PG Type Dropdown */}
      <div className="w-full lg:flex-1 relative flex items-center bg-white lg:bg-transparent rounded-xl lg:rounded-none border lg:border-none border-neutral-200 px-2 lg:px-4 h-14 transition-all focus-within:bg-neutral-50 hover:bg-neutral-50 cursor-pointer shadow-sm lg:shadow-none">
        <Building className="text-neutral-400 shrink-0 ml-2" size={20} />
        <select 
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full h-full bg-transparent border-none text-neutral-900 font-medium focus:ring-0 appearance-none cursor-pointer outline-none px-3"
        >
          <option value="" disabled>PG Type</option>
          <option value="all">Any Type</option>
          <option value="BOYS">Boys PG</option>
          <option value="GIRLS">Girls PG</option>
          <option value="COED">Co-living</option>
        </select>
      </div>

      <button 
        type="submit"
        className="w-full lg:w-auto shrink-0 h-14 px-10 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl lg:rounded-full shadow-lg shadow-primary-500/30 transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer mt-1 lg:mt-0"
      >
        <Search size={18} className="group-hover:scale-110 transition-transform" />
        Search
      </button>
    </form>
  );
}
