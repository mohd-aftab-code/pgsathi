"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, Loader2, MapPin } from "lucide-react";

// Fix missing marker icons in production builds
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

// Center of India as default location
const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629];

interface MapProps {
  position: [number, number] | null;
  onChange: (lat: number, lng: number) => void;
  onAddressFound: (address: string) => void;
}

// Component to fly map to a new position
function FlyToPosition({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 16, { animate: true, duration: 1.2 });
    }
  }, [position, map]);
  return null;
}

function MapEvents({
  setMarkerPos,
  onChange,
  onAddressFound,
}: {
  setMarkerPos: (pos: [number, number]) => void;
  onChange: (lat: number, lng: number) => void;
  onAddressFound: (address: string) => void;
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setMarkerPos([lat, lng]);
      // Call onChange IMMEDIATELY so lat/lng is saved even if geocoding is slow
      onChange(lat, lng);
      // Then async reverse geocode for address
      fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { "Accept-Language": "en" } }
      )
        .then((r) => r.json())
        .then((data) => { if (data.display_name) onAddressFound(data.display_name); })
        .catch(() => {});
    },
  });
  return null;
}

export default function Map({ position, onChange, onAddressFound }: MapProps) {
  const [markerPos, setMarkerPos] = useState<[number, number]>(position || DEFAULT_CENTER);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const markerRef = useRef<L.Marker>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (position) {
      setMarkerPos(position);
    }
  }, [position]);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          setMarkerPos([lat, lng]);
          // Call onChange IMMEDIATELY for lat/lng
          onChange(lat, lng);
          // Then reverse geocode for address
          fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { "Accept-Language": "en" } }
          )
            .then((r) => r.json())
            .then((data) => { if (data.display_name) onAddressFound(data.display_name); })
            .catch(() => {});
        }
      },
    }),
    [onChange, onAddressFound]
  );

  // Search address via Nominatim
  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    setShowResults(false);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!value.trim() || value.length < 3) {
      setSearchResults([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=5&countrycodes=in`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        setSearchResults(data);
        setShowResults(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);
  };

  const handleSelectResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setMarkerPos([lat, lng]);
    setSearchQuery(result.display_name);
    setShowResults(false);
    setSearchResults([]);
    // Call onChange immediately for lat/lng, then address
    onChange(lat, lng);
    onAddressFound(result.display_name);
  };

  return (
    <div className="relative w-full h-full">
      {/* Search Box (floats above map) */}
      <div className="absolute top-3 left-3 right-3 z-[1000]">
        <div className="relative">
          <div className="flex items-center bg-white border border-neutral-300 rounded-xl shadow-lg overflow-hidden">
            <span className="pl-3 text-neutral-400">
              {searching ? (
                <Loader2 size={16} className="animate-spin text-primary-500" />
              ) : (
                <Search size={16} />
              )}
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              placeholder="Search address, area, landmark..."
              className="w-full px-3 py-2.5 text-sm outline-none bg-transparent"
            />
          </div>

          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
              {searchResults.map((result, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectResult(result)}
                  className="w-full text-left px-4 py-3 hover:bg-primary-50 border-b border-neutral-100 last:border-0 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-primary-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-neutral-700 line-clamp-2">
                      {result.display_name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={position || DEFAULT_CENTER}
        zoom={position ? 15 : 5}
        style={{ height: "100%", width: "100%", borderRadius: "1rem" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyToPosition position={markerPos} />
        <MapEvents setMarkerPos={setMarkerPos} onChange={onChange} onAddressFound={onAddressFound} />
        <Marker
          draggable={true}
          eventHandlers={eventHandlers}
          position={markerPos}
          ref={markerRef}
        />
      </MapContainer>
    </div>
  );
}
