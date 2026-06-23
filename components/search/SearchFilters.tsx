"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";

export default function SearchFilters({ cities = [] }: { cities?: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
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

    router.push(`/search?${params.toString()}`);
  };

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200 sticky top-24">
        <div className="flex items-center gap-2 font-bold text-lg mb-4 pb-4 border-b border-neutral-100">
          <Filter size={20} /> Filters
        </div>

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
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary-600 transition-colors">
              <input 
                type="checkbox" 
                checked={budget === "under5k"}
                onChange={() => handleBudgetChange("under5k")}
                className="rounded text-primary-600 focus:ring-primary-500" 
              />
              Under ₹5,000
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary-600 transition-colors">
              <input 
                type="checkbox" 
                checked={budget === "5k-10k"}
                onChange={() => handleBudgetChange("5k-10k")}
                className="rounded text-primary-600 focus:ring-primary-500" 
              />
              ₹5,000 - ₹10,000
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary-600 transition-colors">
              <input 
                type="checkbox" 
                checked={budget === "above10k"}
                onChange={() => handleBudgetChange("above10k")}
                className="rounded text-primary-600 focus:ring-primary-500" 
              />
              Above ₹10,000
            </label>
          </div>
        </div>

        {/* AMENITIES FILTER */}
        <div>
          <h3 className="font-semibold text-sm text-neutral-500 mb-3 uppercase tracking-wider">House Rules / Amenities</h3>
          <div className="space-y-2">
            {[
              { id: "noticePeriod", label: "No Notice Period" },
              { id: "gateClosingTime", label: "No Gate Closing" },
              { id: "foodIncluded", label: "Food Included" },
              { id: "laundryService", label: "Laundry Service" },
              { id: "roomCleaning", label: "Room Cleaning" },
            ].map(rule => (
              <label key={rule.id} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary-600 transition-colors">
                <input 
                  type="checkbox" 
                  checked={amenities.includes(rule.id)}
                  onChange={() => handleAmenityChange(rule.id)}
                  className="rounded text-primary-600 focus:ring-primary-500" 
                />
                {rule.label}
              </label>
            ))}
          </div>
        </div>
        
        <button 
          onClick={applyFilters}
          className="w-full mt-6 bg-primary-100 text-primary-700 font-semibold py-2 rounded-xl hover:bg-primary-200 transition-colors cursor-pointer"
        >
          Apply Filters
        </button>
      </div>
    </aside>
  );
}
