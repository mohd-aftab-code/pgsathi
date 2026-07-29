"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const loading = () => (
  <div className="w-full h-full bg-neutral-100 flex items-center justify-center rounded-2xl">
    <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
    <span className="ml-2 text-sm text-neutral-500">Loading Map...</span>
  </div>
);

// Both are client-only (Leaflet touches window; the Maps SDK injects a script).
const OsmMap = dynamic(() => import("./Map"), { ssr: false, loading });
const GoogleMap = dynamic(() => import("./GoogleMap"), { ssr: false, loading });

/**
 * Google Maps when a key is configured, OpenStreetMap when it isn't.
 *
 * Google is the better map for this form — free geocoders return nothing for a
 * normal Indian postal address, so the pin lands on the PIN-code centre and the
 * owner has to drag it. Google's Places Autocomplete resolves the same string to
 * the building. But it needs a billed API key, so the OSM version stays as the
 * no-key path rather than leaving the form broken without one.
 */
const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
  onAddressFound?: (addressData: any) => void;
  /** City already chosen in the form. Appended to map searches so a name that
      exists in many towns resolves to the one being registered. */
  searchCity?: string;
}

export default function LocationPicker({
  latitude,
  longitude,
  onChange,
  onAddressFound,
  searchCity,
}: LocationPickerProps) {
  const position: [number, number] | null = latitude && longitude ? [latitude, longitude] : null;
  const handleAddress = onAddressFound || (() => {});

  return (
    <div className="w-full h-72 sm:h-96 relative border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
      {GOOGLE_KEY ? (
        <GoogleMap
          position={position}
          onChange={onChange}
          onAddressFound={handleAddress}
          searchCity={searchCity}
          apiKey={GOOGLE_KEY}
        />
      ) : (
        <>
          <OsmMap
            position={position}
            onChange={onChange}
            onAddressFound={handleAddress}
            searchCity={searchCity}
          />
          {/* Sits above the map (Leaflet panes cap out around z-index 700) so the
              one action that actually matters is never missed. */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
            <span className="bg-neutral-900/85 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap backdrop-blur-sm">
              {position ? "📍 Drag the pin to your PG's location" : "📍 Click on the map to set your location"}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
