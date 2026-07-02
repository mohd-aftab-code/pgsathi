"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X } from "lucide-react";

export default function SearchFilters({ cities = [] }: { cities?: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [city, setCity] = useState<string>(searchParams.get("city") || "all");
  const [budget, setBudget] = useState<string>(searchParams.get("budget") || "");
  const [amenities, setAmenities] = useState<string[]>(
    searchParams.get("amenities")?.split(",").filter(Boolean) || []
  );

  const handleBudgetChange = (val: string) => {
    setBudget(prev => prev === val ? "" : val); // toggle
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

    setIsMobileOpen(false); // Close drawer on apply
    router.push(`/search?${params.toString()}`);
  };

  return (
    <>
      {/* Mobile Trigger Button (Sticky at bottom on mobile) */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="bg-neutral-900 text-white px-6 py-3 rounded-full font-bold shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex items-center gap-2"
        >
          <Filter size={18} /> Filters
        </button>
      </div>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 z-50 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Filter Drawer / Sidebar */}
      <aside className={`
        fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-white h-full shadow-2xl transition-transform duration-300 transform overflow-y-auto
        lg:relative lg:translate-x-0 lg:w-64 lg:shrink-0 lg:bg-transparent lg:shadow-none lg:h-auto lg:overflow-visible lg:z-0
        ${isMobileOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="bg-white p-5 lg:rounded-2xl lg:shadow-sm lg:border lg:border-neutral-200 lg:sticky lg:top-24 h-full lg:h-auto flex flex-col">
          <div className="flex items-center justify-between font-bold text-lg mb-4 pb-4 border-b border-neutral-100 shrink-0">
            <div className="flex items-center gap-2">
              <Filter size={20} /> Filters
            </div>
            <button 
              className="lg:hidden p-2 -mr-2 text-neutral-500 hover:text-neutral-900"
              onClick={() => setIsMobileOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto lg:overflow-visible">
            {/* CITY FILTER */}
            <div className="mb-6">
              <h3 className="font-semibold text-sm text-neutral-500 mb-3 uppercase tracking-wider">Location</h3>
              <select 
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="all">All Cities</option>
                {cities.map(c => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
            
            {/* BUDGET FILTER */}
            <div className="mb-6">
              <h3 className="font-semibold text-sm text-neutral-500 mb-3 uppercase tracking-wider">Budget</h3>
              <div className="space-y-3 lg:space-y-2">
                <label className="flex items-center gap-3 lg:gap-2 text-sm cursor-pointer hover:text-primary-600 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={budget === "under5k"}
                    onChange={() => handleBudgetChange("under5k")}
                    className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4 lg:w-auto lg:h-auto" 
                  />
                  Under ₹5,000
                </label>
                <label className="flex items-center gap-3 lg:gap-2 text-sm cursor-pointer hover:text-primary-600 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={budget === "5k-10k"}
                    onChange={() => handleBudgetChange("5k-10k")}
                    className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4 lg:w-auto lg:h-auto" 
                  />
                  ₹5,000 - ₹10,000
                </label>
                <label className="flex items-center gap-3 lg:gap-2 text-sm cursor-pointer hover:text-primary-600 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={budget === "above10k"}
                    onChange={() => handleBudgetChange("above10k")}
                    className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4 lg:w-auto lg:h-auto" 
                  />
                  Above ₹10,000
                </label>
              </div>
            </div>

            {/* AMENITIES FILTER */}
            <div>
              <h3 className="font-semibold text-sm text-neutral-500 mb-3 uppercase tracking-wider">House Rules & Amenities</h3>
              <div className="space-y-3 lg:space-y-2">
                {[
                  { id: "noticePeriod", label: "No Notice Period" },
                  { id: "gateClosingTime", label: "No Gate Closing" },
                  { id: "foodIncluded", label: "Food Included" },
                  { id: "laundryService", label: "Laundry Service" },
                  { id: "roomCleaning", label: "Room Cleaning" },
                ].map(rule => (
                  <label key={rule.id} className="flex items-center gap-3 lg:gap-2 text-sm cursor-pointer hover:text-primary-600 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={amenities.includes(rule.id)}
                      onChange={() => handleAmenityChange(rule.id)}
                      className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4 lg:w-auto lg:h-auto" 
                    />
                    {rule.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <div className="pt-5 shrink-0">
            <button 
              onClick={applyFilters}
              className="w-full bg-primary-600 text-white font-bold py-3.5 lg:py-2 lg:bg-primary-100 lg:text-primary-700 rounded-xl lg:hover:bg-primary-200 transition-colors cursor-pointer"
            >
              Show Results
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
