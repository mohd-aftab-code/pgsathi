"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X, RotateCcw } from "lucide-react";

export default function SearchFilters({ cities = [] }: { cities?: Array<{ name: string; slug: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [city, setCity] = useState<string>(searchParams.get("city") || "all");
  const [budget, setBudget] = useState<string>(searchParams.get("budget") || "");
  const [amenities, setAmenities] = useState<string[]>(
    searchParams.get("amenities")?.split(",").filter(Boolean) || []
  );

  // Keep state in sync when URL changes (e.g. from SearchBar or browser back/forward)
  useEffect(() => {
    setCity(searchParams.get("city") || "all");
    setBudget(searchParams.get("budget") || "");
    setAmenities(searchParams.get("amenities")?.split(",").filter(Boolean) || []);
  }, [searchParams]);

  // When city changes, apply immediately so user instantly sees all PGs in that city!
  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    const params = new URLSearchParams(searchParams.toString());
    
    if (newCity && newCity !== "all") {
      params.set("city", newCity);
    } else {
      params.delete("city");
    }
    // Reset page to 1
    params.delete("page");

    setIsMobileOpen(false);
    router.push(`/search?${params.toString()}`);
  };

  const handleBudgetChange = (val: string) => {
    setBudget(prev => (prev === val ? "" : val));
  };

  const handleAmenityChange = (amenity: string) => {
    setAmenities(prev => {
      if (prev.includes(amenity)) return prev.filter(a => a !== amenity);
      return [...prev, amenity];
    });
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (city && city !== "all") params.set("city", city);
    else params.delete("city");

    if (budget) params.set("budget", budget);
    else params.delete("budget");

    if (amenities.length > 0) params.set("amenities", amenities.join(","));
    else params.delete("amenities");

    params.delete("page");
    setIsMobileOpen(false);
    router.push(`/search?${params.toString()}`);
  };

  const clearAllFilters = () => {
    setCity("all");
    setBudget("");
    setAmenities([]);
    setIsMobileOpen(false);
    router.push("/search");
  };

  const hasActiveFilters = (city && city !== "all") || !!budget || amenities.length > 0;

  return (
    <>
      {/* Mobile Trigger Button (Sticky at bottom on mobile) */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="bg-neutral-900 text-white px-6 py-3.5 rounded-full font-bold shadow-[0_8px_30px_rgb(0,0,0,0.25)] flex items-center gap-2 text-sm border border-neutral-700 active:scale-95 transition-transform"
        >
          <Filter size={18} /> Filters {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 z-50 transition-opacity backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Filter Drawer / Sidebar */}
      <aside className={`
        fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-white h-full shadow-2xl transition-transform duration-300 transform overflow-y-auto
        lg:relative lg:translate-x-0 lg:w-64 lg:shrink-0 lg:bg-transparent lg:shadow-none lg:h-auto lg:overflow-visible lg:z-0
        ${isMobileOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="bg-white p-5 lg:rounded-3xl lg:shadow-sm lg:border lg:border-neutral-200 lg:sticky lg:top-24 h-full lg:h-auto flex flex-col">
          <div className="flex items-center justify-between font-bold text-lg mb-4 pb-4 border-b border-neutral-100 shrink-0">
            <div className="flex items-center gap-2 text-neutral-900">
              <Filter size={18} className="text-primary-600" /> Filters
            </div>
            <div className="flex items-center gap-1">
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-neutral-500 hover:text-neutral-900 flex items-center gap-1 font-semibold px-2 py-1 rounded-lg hover:bg-neutral-100 transition-colors"
                  title="Reset all filters"
                >
                  <RotateCcw size={12} /> Reset
                </button>
              )}
              <button 
                className="lg:hidden p-2 text-neutral-500 hover:text-neutral-900"
                onClick={() => setIsMobileOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto lg:overflow-visible space-y-6">
            {/* CITY / LOCATION FILTER */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-extrabold text-xs text-neutral-500 uppercase tracking-wider">City / Location</h3>
                <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">Instant</span>
              </div>
              <select 
                value={city}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 text-sm font-semibold text-neutral-900 rounded-xl px-3.5 py-3 focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none cursor-pointer transition-all shadow-sm"
              >
                <option value="all">All Cities & Locations</option>
                {cities.map(c => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* BUDGET FILTER */}
            <div>
              <h3 className="font-extrabold text-xs text-neutral-500 mb-3 uppercase tracking-wider">Monthly Budget</h3>
              <div className="space-y-2.5">
                {[
                  { id: "under5k", label: "Under ₹5,000" },
                  { id: "5k-10k", label: "₹5,000 - ₹10,000" },
                  { id: "above10k", label: "Above ₹10,000" },
                ].map((b) => (
                  <label key={b.id} className="flex items-center gap-3 text-xs font-semibold text-neutral-700 cursor-pointer hover:text-primary-600 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={budget === b.id}
                      onChange={() => handleBudgetChange(b.id)}
                      className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4 cursor-pointer" 
                    />
                    <span>{b.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* HOUSE RULES & AMENITIES */}
            <div>
              <h3 className="font-extrabold text-xs text-neutral-500 mb-3 uppercase tracking-wider">Amenities & Rules</h3>
              <div className="space-y-2.5">
                {[
                  { id: "foodIncluded", label: "Food Included" },
                  { id: "gateClosingTime", label: "No Gate Closing" },
                  { id: "noticePeriod", label: "No Notice Period" },
                  { id: "laundryService", label: "Laundry Service" },
                  { id: "roomCleaning", label: "Room Cleaning" },
                ].map(rule => (
                  <label key={rule.id} className="flex items-center gap-3 text-xs font-semibold text-neutral-700 cursor-pointer hover:text-primary-600 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={amenities.includes(rule.id)}
                      onChange={() => handleAmenityChange(rule.id)}
                      className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4 cursor-pointer" 
                    />
                    <span>{rule.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <div className="pt-6 shrink-0 border-t border-neutral-100 mt-4">
            <button 
              onClick={applyFilters}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-primary-600/25 transition-all text-sm cursor-pointer min-h-[44px]"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
