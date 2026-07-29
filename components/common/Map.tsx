"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, Loader2, MapPin, Link2 } from "lucide-react";
import { parseMapInput, isShortMapLink } from "@/lib/map-link";

// Fix missing marker icons in production builds
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    // Served from /public, not unpkg. The CSP has no reason to allow a CDN for
    // three small PNGs, and a blocked (or slow) CDN is why the pin used to
    // render as a broken image.
    iconRetinaUrl: "/leaflet/marker-icon-2x.png",
    iconUrl: "/leaflet/marker-icon.png",
    shadowUrl: "/leaflet/marker-shadow.png",
  });
}

// Center of India as default location
const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629];

interface MapProps {
  position: [number, number] | null;
  onChange: (lat: number, lng: number) => void;
  /** Full geocoder response — consumers read .display_name and .address off it. */
  onAddressFound: (data: any) => void;
  /** City already chosen in the form, appended to searches for local results. */
  searchCity?: string;
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
  /** Full geocoder response — consumers read .display_name and .address off it. */
  onAddressFound: (data: any) => void;
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setMarkerPos([lat, lng]);
      // Call onChange IMMEDIATELY so lat/lng is saved even if geocoding is slow
      onChange(lat, lng);
      // Then async reverse geocode for address
      fetch(`/api/geo/reverse?lat=${lat}&lng=${lng}`)
        .then((r) => r.json())
        .then((data) => { if (data.display_name) onAddressFound(data); })
        .catch(() => {});
    },
  });
  return null;
}

export default function Map({ position, onChange, onAddressFound, searchCity }: MapProps) {
  const [markerPos, setMarkerPos] = useState<[number, number]>(position || DEFAULT_CENTER);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [linkNote, setLinkNote] = useState("");
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
          fetch(`/api/geo/reverse?lat=${lat}&lng=${lng}`)
            .then((r) => r.json())
            .then((data) => { if (data.display_name) onAddressFound(data); })
            .catch(() => {});
        }
      },
    }),
    [onChange, onAddressFound]
  );

  /**
   * Owners typically already have their PG pinned on Google Maps. Pasting that
   * link (or bare coordinates) drops the marker exactly there instead of making
   * them find the same spot again on this map.
   */
  const applyPastedLink = async (value: string): Promise<boolean> => {
    const direct = parseMapInput(value);
    if (direct) {
      setMarkerPos([direct.lat, direct.lng]);
      onChange(direct.lat, direct.lng);
      setLinkNote("✓ Google Maps location set");
      setShowResults(false);
      setSearchResults([]);
      return true;
    }

    if (isShortMapLink(value)) {
      setSearching(true);
      setLinkNote("Opening Google link…");
      try {
        const res = await fetch("/api/geo/resolve-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: value.trim() }),
        });
        const d = await res.json();
        if (d.success) {
          setMarkerPos([d.latitude, d.longitude]);
          onChange(d.latitude, d.longitude);
          setLinkNote("✓ Google Maps location set");
          setShowResults(false);
          setSearchResults([]);
          return true;
        }
        setLinkNote(d.message || "Could not find location from this link");
      } catch {
        setLinkNote("Failed to open link");
      } finally {
        setSearching(false);
      }
      return true; // handled — don't fall through to a text search
    }
    return false;
  };

  // Search address via Nominatim
  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    setShowResults(false);
    setLinkNote("");

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!value.trim() || value.length < 3) {
      setSearchResults([]);
      return;
    }

    // A pasted link/coords resolves immediately — no debounce, no text search
    if (parseMapInput(value) || isShortMapLink(value)) {
      applyPastedLink(value);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        // Through our own server, not Nominatim directly: the browser has no way
        // to send the User-Agent Nominatim's policy requires, so direct calls got
        // throttled and the box appeared to hang. The server route also puts
        // Photon in front, which actually matches place names typed by hand.
        // Append the city the form already has. Geocoders rank by fame, so a
        // bare "Civil Lines" returns Delhi even when searching from Prayagraj —
        // and no amount of coordinate bias fixes that, because the local match
        // is never in the results to begin with. Putting the city in the query
        // is what actually finds it.
        const alreadyHasCity =
          searchCity && value.toLowerCase().includes(searchCity.toLowerCase());
        const q = searchCity && !alreadyHasCity ? `${value}, ${searchCity}` : value;

        const params = new URLSearchParams({ q });
        // Coordinate bias on top, to order what does come back.
        if (markerPos) params.set("near", `${markerPos[0]},${markerPos[1]}`);

        const res = await fetch(`/api/geo/search?${params}`);
        const d = await res.json();
        setSearchResults(d?.data ?? []);
        setShowResults(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  };

  const handleSelectResult = (result: any) => {
    const lat = Number(result.lat);
    const lng = Number(result.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    setMarkerPos([lat, lng]);
    setSearchQuery(result.label);
    setShowResults(false);
    setSearchResults([]);
    // Call onChange immediately for lat/lng, then address
    onChange(lat, lng);
    onAddressFound({ display_name: result.label });
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
              onPaste={(e) => {
                // Handle the paste directly: React's onChange fires with the same
                // text a tick later, but doing it here means the marker moves the
                // instant they paste, with no debounce.
                const text = e.clipboardData.getData("text");
                if (parseMapInput(text) || isShortMapLink(text)) {
                  e.preventDefault();
                  setSearchQuery(text);
                  applyPastedLink(text);
                }
              }}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              placeholder="Paste Google Maps link, or search address"
              className="w-full px-3 py-2.5 text-sm outline-none bg-transparent"
            />
          </div>

          {linkNote && (
            <div
              className={`mt-1 flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg shadow ${
                linkNote.startsWith("✓") ? "bg-green-600 text-white" : "bg-white text-neutral-700 border border-neutral-200"
              }`}
            >
              <Link2 size={12} className="shrink-0" /> {linkNote}
            </div>
          )}

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
                      {result.label}
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
