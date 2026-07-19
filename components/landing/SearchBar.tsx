"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Building, ChevronDown, MapPinIcon } from "lucide-react";
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
  
  // Locality Auto-complete state
  const [query, setQuery] = useState(initialQuery);
  const [isLocalityOpen, setIsLocalityOpen] = useState(false);
  const [localities, setLocalities] = useState<any[]>([]);
  const [isLoadingLocalities, setIsLoadingLocalities] = useState(false);
  const localityRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setIsCityOpen(false);
      }
      if (localityRef.current && !localityRef.current.contains(event.target as Node)) {
        setIsLocalityOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch localities on query change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 2) {
      setLocalities([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoadingLocalities(true);
      try {
        const matchedCity = cities.find((c: any) => c.name.toLowerCase() === cityInput.toLowerCase());
        const citySlug = matchedCity ? matchedCity.slug : "all";
        
        const res = await fetch(`/api/localities/search?q=${encodeURIComponent(query)}&city=${citySlug}`);
        const data = await res.json();
        if (data.success) {
          setLocalities(data.data || []);
        }
      } catch (err) {
        console.error("Error fetching localities", err);
      } finally {
        setIsLoadingLocalities(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, cityInput, cities]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    
    const matchedCity = cities.find((c: any) => c.name.toLowerCase() === cityInput.toLowerCase());
    const finalCitySlug = matchedCity ? matchedCity.slug : (cityInput ? cityInput.toLowerCase().replace(/\s+/g, '-') : "all");
    
    if (finalCitySlug && finalCitySlug !== "all") params.set("city", finalCitySlug);
    if (gender && gender !== "all") params.set("gender", gender);
    
    setIsLocalityOpen(false);
    router.push(`/search?${params.toString()}`);
  };

  const filteredCities = cities.filter(c => c.name.toLowerCase().includes(cityInput.toLowerCase()));

  return (
    <form 
      onSubmit={handleSearch} 
      className="flex flex-col lg:flex-row w-full bg-transparent lg:bg-white lg:rounded-full rounded-2xl lg:border border-neutral-200 lg:shadow-sm lg:p-1.5 gap-3 lg:gap-0 items-stretch lg:items-center"
    >
      
      {/* 1. Searchable City Custom Dropdown */}
      <div ref={cityRef} className="relative w-full min-w-0 lg:flex-[1.1] lg:border-r border-neutral-200 bg-white lg:bg-transparent rounded-xl lg:rounded-l-full lg:rounded-r-none border lg:border-none px-2 h-14 lg:h-12 flex items-center transition-all focus-within:bg-neutral-50 hover:bg-neutral-50 shadow-sm lg:shadow-none z-20">
        <MapPin className="text-neutral-400 shrink-0 ml-1" size={16} />
        <input 
          type="text" 
          value={cityInput}
          onChange={(e) => {
            setCityInput(e.target.value);
            setIsCityOpen(true);
          }}
          onFocus={() => setIsCityOpen(true)}
          placeholder="City"
          className="w-full h-full min-w-0 bg-transparent border-none text-neutral-900 font-medium focus:ring-0 outline-none px-2 text-[13px] sm:text-sm placeholder:text-neutral-400 text-ellipsis overflow-hidden whitespace-nowrap"
        />
        <ChevronDown size={14} className={`text-neutral-400 shrink-0 transition-transform ${isCityOpen ? "rotate-180" : ""}`} />
        
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

      {/* 2. Free Text Search (Area/Location) with Auto-complete */}
      <div ref={localityRef} className="relative w-full min-w-0 lg:flex-[1.6] lg:border-r border-neutral-200 bg-white lg:bg-transparent rounded-xl lg:rounded-none border lg:border-none px-2 h-14 lg:h-12 flex items-center transition-all focus-within:bg-neutral-50 hover:bg-neutral-50 shadow-sm lg:shadow-none z-10">
        <Search className="text-neutral-400 shrink-0 ml-1" size={16} />
        <input 
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsLocalityOpen(true);
          }}
          onFocus={() => setIsLocalityOpen(true)}
          placeholder="Area or locality..."
          className="w-full h-full min-w-0 bg-transparent border-none text-neutral-900 font-medium focus:ring-0 outline-none px-2 text-[13px] sm:text-sm placeholder:text-neutral-400 text-ellipsis overflow-hidden whitespace-nowrap"
          autoComplete="off"
        />
        
        {isLocalityOpen && query.length >= 2 && (
          <div className="absolute top-[calc(100%+8px)] left-0 w-full md:w-[300px] bg-white border border-neutral-200 shadow-xl rounded-xl overflow-hidden py-2 max-h-[300px] overflow-y-auto">
            {isLoadingLocalities ? (
              <div className="px-4 py-3 text-sm text-neutral-500 text-center animate-pulse">Searching localities...</div>
            ) : localities.length > 0 ? (
              localities.map(loc => (
                <div 
                  key={loc.id}
                  onClick={() => {
                    setQuery(loc.name);
                    // Also auto-select city if not matched
                    if (loc.cityName && cityInput.toLowerCase() !== loc.cityName.toLowerCase()) {
                      setCityInput(loc.cityName);
                    }
                    setIsLocalityOpen(false);
                  }}
                  className="px-4 py-2.5 hover:bg-primary-50 cursor-pointer flex flex-col transition-colors"
                >
                  <span className="text-sm font-semibold text-neutral-900">{loc.name}</span>
                  <span className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                    <MapPinIcon size={10} /> {loc.cityName}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-neutral-500 text-center">No localities found</div>
            )}
          </div>
        )}
      </div>
      
      {/* 3. PG Type Dropdown */}
      <div className="relative w-full min-w-0 lg:flex-[1] bg-white lg:bg-transparent rounded-xl lg:rounded-none border lg:border-none border-neutral-200 px-2 h-14 lg:h-12 flex items-center transition-all focus-within:bg-neutral-50 hover:bg-neutral-50 cursor-pointer shadow-sm lg:shadow-none z-10">
        <Building className="text-neutral-400 shrink-0 ml-1" size={16} />
        <select 
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full h-full min-w-0 bg-transparent border-none text-neutral-900 font-medium focus:ring-0 appearance-none outline-none px-2 text-[13px] sm:text-sm cursor-pointer text-ellipsis overflow-hidden whitespace-nowrap"
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
        className="w-full lg:w-auto shrink-0 h-14 lg:h-10 lg:my-1 lg:mx-1 px-6 lg:px-4 xl:px-6 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl lg:rounded-full shadow-lg shadow-primary-500/30 transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer mt-1 lg:mt-0"
      >
        <Search size={16} className="group-hover:scale-110 transition-transform" />
        <span className="lg:hidden xl:inline text-sm">Search</span>
      </button>
    </form>
  );
}
