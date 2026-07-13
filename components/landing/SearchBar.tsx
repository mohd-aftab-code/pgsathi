"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Building, ChevronDown } from "lucide-react";
import { CITIES } from "@/constants/cities";

export default function SearchBar({ initialCity = "", initialGender = "", initialQuery = "", cities = CITIES as any[] }) {
  const router = useRouter();
  
  // Custom Searchable Dropdown state for City
  const [cityInput, setCityInput] = useState(() => {
    if (initialCity && initialCity !== "all") {
      return cities.find((c: any) => c.slug === initialCity)?.name || initialCity;
    }
    return "";
  });
  const [isCityOpen, setIsCityOpen] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);

  const [gender, setGender] = useState(initialGender);
  const [query, setQuery] = useState(initialQuery);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setIsCityOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    
    const matchedCity = cities.find((c: any) => c.name.toLowerCase() === cityInput.toLowerCase());
    const finalCitySlug = matchedCity ? matchedCity.slug : (cityInput ? cityInput.toLowerCase().replace(/\s+/g, '-') : "all");
    
    if (finalCitySlug && finalCitySlug !== "all") params.set("city", finalCitySlug);
    if (gender && gender !== "all") params.set("gender", gender);
    
    router.push(`/search?${params.toString()}`);
  };

  const filteredCities = cities.filter(c => c.name.toLowerCase().includes(cityInput.toLowerCase()));

  return (
    <form 
      onSubmit={handleSearch} 
      // Using grid layout for desktop ensures proper width distribution without squashing inputs
      className="flex flex-col lg:grid lg:grid-cols-[minmax(140px,1.5fr)_minmax(180px,2fr)_minmax(140px,1.2fr)_auto] w-full bg-transparent lg:bg-white lg:rounded-full rounded-2xl lg:border border-neutral-200 lg:shadow-sm lg:p-1.5 gap-3 lg:gap-0"
    >
      
      {/* 1. Searchable City Custom Dropdown */}
      <div ref={cityRef} className="relative w-full lg:border-r border-neutral-200 bg-white lg:bg-transparent rounded-xl lg:rounded-l-full lg:rounded-r-none border lg:border-none px-2 lg:px-4 h-14 flex items-center transition-all focus-within:bg-neutral-50 hover:bg-neutral-50 shadow-sm lg:shadow-none z-20">
        <MapPin className="text-neutral-400 shrink-0 ml-1" size={18} />
        <input 
          type="text" 
          value={cityInput}
          onChange={(e) => {
            setCityInput(e.target.value);
            setIsCityOpen(true);
          }}
          onFocus={() => setIsCityOpen(true)}
          placeholder="Select City"
          className="w-full h-full bg-transparent border-none text-neutral-900 font-medium focus:ring-0 outline-none px-2 text-sm md:text-base placeholder:text-neutral-400"
        />
        <ChevronDown size={16} className={`text-neutral-400 shrink-0 transition-transform ${isCityOpen ? "rotate-180" : ""}`} />
        
        {isCityOpen && (
          <div className="absolute top-[calc(100%+8px)] left-0 w-full md:w-[220px] bg-white border border-neutral-200 shadow-xl rounded-xl overflow-hidden py-2 max-h-[240px] overflow-y-auto">
            {filteredCities.length > 0 ? (
              filteredCities.map(c => (
                <div 
                  key={c.slug}
                  onClick={() => {
                    setCityInput(c.name);
                    setIsCityOpen(false);
                  }}
                  className="px-4 py-2.5 hover:bg-primary-50 hover:text-primary-700 cursor-pointer text-sm font-medium transition-colors"
                >
                  {c.name}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-neutral-500 text-center">No city found</div>
            )}
          </div>
        )}
      </div>

      {/* 2. Free Text Search (Area/Location) */}
      <div className="relative w-full lg:border-r border-neutral-200 bg-white lg:bg-transparent rounded-xl lg:rounded-none border lg:border-none px-2 lg:px-4 h-14 flex items-center transition-all focus-within:bg-neutral-50 hover:bg-neutral-50 shadow-sm lg:shadow-none z-10">
        <Search className="text-neutral-400 shrink-0 ml-1" size={18} />
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter area, location..."
          className="w-full h-full bg-transparent border-none text-neutral-900 font-medium focus:ring-0 outline-none px-2 text-sm md:text-base placeholder:text-neutral-400"
        />
      </div>
      
      {/* 3. PG Type Dropdown */}
      <div className="relative w-full bg-white lg:bg-transparent rounded-xl lg:rounded-none border lg:border-none border-neutral-200 px-2 lg:px-3 h-14 flex items-center transition-all focus-within:bg-neutral-50 hover:bg-neutral-50 cursor-pointer shadow-sm lg:shadow-none z-10">
        <Building className="text-neutral-400 shrink-0 ml-1" size={18} />
        <select 
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full h-full bg-transparent border-none text-neutral-900 font-medium focus:ring-0 appearance-none outline-none px-2 text-sm md:text-base cursor-pointer"
        >
          <option value="" disabled>PG Type</option>
          <option value="all">Any Type</option>
          <option value="BOYS">Boys PG</option>
          <option value="GIRLS">Girls PG</option>
          <option value="COED">Co-living</option>
        </select>
        <ChevronDown size={16} className="text-neutral-400 shrink-0 pointer-events-none" />
      </div>

      {/* 4. Submit Button */}
      <button 
        type="submit"
        className="w-full lg:w-auto shrink-0 h-14 px-8 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl lg:rounded-full shadow-lg shadow-primary-500/30 transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer mt-1 lg:mt-0"
      >
        <Search size={18} className="group-hover:scale-110 transition-transform" />
        <span className="lg:hidden xl:inline">Search</span>
      </button>
    </form>
  );
}
