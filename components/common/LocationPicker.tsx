"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import Map with ssr disabled
const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-neutral-100 flex items-center justify-center rounded-2xl">
      <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      <span className="ml-2 text-sm text-neutral-500">Loading Map...</span>
    </div>
  ),
});

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
  onAddressFound?: (addressData: any) => void;
  /** City already chosen in the form. Appended to map searches so a name that
      exists in many towns resolves to the one being registered. */
  searchCity?: string;
}

export default function LocationPicker({ latitude, longitude, onChange, onAddressFound, searchCity }: LocationPickerProps) {
  const position: [number, number] | null = latitude && longitude ? [latitude, longitude] : null;

  return (
    <div className="w-full h-72 sm:h-96 relative border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
      <Map position={position} onChange={onChange} onAddressFound={onAddressFound || (() => {})} searchCity={searchCity} />

      {/* Sits above the map (Leaflet panes cap out around z-index 700) so the
          one action that actually matters is never missed. */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
        <span className="bg-neutral-900/85 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap backdrop-blur-sm">
          {position ? "📍 Pin ko drag karke apne PG par rakhein" : "📍 Map pe apni jagah par click karein"}
        </span>
      </div>
    </div>
  );
}
