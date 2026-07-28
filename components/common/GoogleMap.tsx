"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import { parseMapInput, isShortMapLink } from "@/lib/map-link";

/**
 * The real Google Maps picker, used when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set.
 * Without a key LocationPicker falls back to the OpenStreetMap version, so the
 * form keeps working either way.
 *
 * Google is worth the key specifically for Indian addresses: the free geocoders
 * return nothing at all for a normal postal address like
 * "2nd St, Mahaveer Nagar-II, ... Kota, Rajasthan 324005", which is why the pin
 * used to fall back to the middle of the PIN code area. Places Autocomplete
 * resolves the same string to the actual building.
 */

declare global {
  interface Window {
    google?: any;
    __pgsathiMapsPromise?: Promise<void>;
  }
}

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 }; // centre of India

/** Loads the Maps JS API once per page, however many maps mount. */
function loadMaps(apiKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps?.places) return Promise.resolve();
  if (window.__pgsathiMapsPromise) return window.__pgsathiMapsPromise;

  window.__pgsathiMapsPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&region=IN&language=en`;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Google Maps script failed to load"));
    document.head.appendChild(s);
  });
  return window.__pgsathiMapsPromise;
}

export default function GoogleMapPicker({
  position,
  onChange,
  onAddressFound,
  searchCity,
  apiKey,
}: {
  position: [number, number] | null;
  onChange: (lat: number, lng: number) => void;
  onAddressFound: (data: any) => void;
  searchCity?: string;
  apiKey: string;
}) {
  const mapEl = useRef<HTMLDivElement>(null);
  const inputEl = useRef<HTMLInputElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [note, setNote] = useState("");

  /** Names the point and hands it back in the shape LocationStep already reads. */
  const reverse = (lat: number, lng: number) => {
    if (!geocoderRef.current) return;
    geocoderRef.current.geocode({ location: { lat, lng } }, (res: any[], ok: string) => {
      if (ok !== "OK" || !res?.[0]) return;
      const r = res[0];
      const get = (t: string) =>
        r.address_components?.find((c: any) => c.types.includes(t))?.long_name ?? "";
      // Mapped to the Nominatim-ish shape LocationStep expects, so both map
      // implementations feed it identically.
      onAddressFound({
        display_name: r.formatted_address,
        address: {
          road: get("route"),
          suburb: get("sublocality_level_1") || get("sublocality"),
          neighbourhood: get("neighborhood"),
          city: get("locality"),
          state_district: get("administrative_area_level_2"),
          state: get("administrative_area_level_1"),
          postcode: get("postal_code"),
        },
      });
      if (inputEl.current) inputEl.current.value = r.formatted_address;
    });
  };

  const place = (lat: number, lng: number, pan = true) => {
    onChange(lat, lng);
    if (markerRef.current) markerRef.current.setPosition({ lat, lng });
    if (pan && mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      if (mapRef.current.getZoom() < 16) mapRef.current.setZoom(17);
    }
    reverse(lat, lng);
  };

  useEffect(() => {
    let cancelled = false;

    loadMaps(apiKey)
      .then(() => {
        if (cancelled || !mapEl.current || !window.google?.maps) return;
        const g = window.google.maps;
        const start = position ? { lat: position[0], lng: position[1] } : DEFAULT_CENTER;

        const map = new g.Map(mapEl.current, {
          center: start,
          zoom: position ? 17 : 5,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: "greedy",
        });
        mapRef.current = map;
        geocoderRef.current = new g.Geocoder();

        const marker = new g.Marker({ map, position: start, draggable: true });
        markerRef.current = marker;

        marker.addListener("dragend", () => {
          const p = marker.getPosition();
          place(p.lat(), p.lng(), false);
        });
        map.addListener("click", (e: any) => place(e.latLng.lat(), e.latLng.lng(), false));

        if (inputEl.current) {
          const ac = new g.places.Autocomplete(inputEl.current, {
            componentRestrictions: { country: "in" },
            fields: ["geometry", "formatted_address", "address_components"],
          });
          ac.bindTo("bounds", map);
          ac.addListener("place_changed", () => {
            const p = ac.getPlace();
            if (!p?.geometry?.location) return;
            place(p.geometry.location.lat(), p.geometry.location.lng());
            setNote("");
          });
        }

        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => { cancelled = true; };
    // Deliberately mount-only: re-running would rebuild the map and lose the pin.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  // Keep the marker in step when the form geocodes from the address fields.
  useEffect(() => {
    if (!position || !mapRef.current || !markerRef.current) return;
    const [lat, lng] = position;
    markerRef.current.setPosition({ lat, lng });
    mapRef.current.panTo({ lat, lng });
    if (mapRef.current.getZoom() < 15) mapRef.current.setZoom(16);
  }, [position]);

  /** A pasted Google Maps link or bare coordinates drops the pin directly. */
  const handlePaste = async (value: string) => {
    const direct = parseMapInput(value);
    if (direct) {
      place(direct.lat, direct.lng);
      setNote("✓ Google Maps location set ho gayi");
      return;
    }
    if (isShortMapLink(value)) {
      setNote("Google link khol rahe hain…");
      try {
        const r = await fetch("/api/geo/resolve-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: value.trim() }),
        }).then((x) => x.json());
        if (r.success) {
          place(r.latitude, r.longitude);
          setNote("✓ Google Maps location set ho gayi");
        } else setNote(r.message || "Is link se location nahi mili");
      } catch {
        setNote("Link kholne mein dikkat aayi");
      }
    }
  };

  if (status === "error") {
    return (
      <div className="w-full h-full grid place-items-center bg-neutral-50 text-center p-6">
        <div>
          <MapPin className="mx-auto text-neutral-300 mb-2" size={28} />
          <p className="text-sm font-bold text-neutral-700">Google Map load nahi hua</p>
          <p className="text-xs text-neutral-500 mt-1">
            API key galat ho sakti hai, ya us key par Maps JavaScript API enabled nahi hai.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-3 left-3 right-3 z-10">
        <div className="flex items-center bg-white border border-neutral-300 rounded-xl shadow-lg overflow-hidden">
          <span className="pl-3 text-neutral-400">
            {status === "loading" ? <Loader2 size={16} className="animate-spin text-primary-500" /> : <Search size={16} />}
          </span>
          <input
            ref={inputEl}
            type="text"
            disabled={status !== "ready"}
            placeholder={searchCity ? `${searchCity} mein jagah dhoondhein…` : "Jagah ka naam ya Google Maps link"}
            onChange={(e) => {
              const v = e.target.value;
              if (parseMapInput(v) || isShortMapLink(v)) handlePaste(v);
            }}
            className="flex-1 px-3 py-2.5 text-sm outline-none disabled:bg-neutral-50"
          />
        </div>
        {note && <p className="mt-1.5 text-[11px] font-semibold text-primary-700 bg-white/90 rounded-md px-2 py-1 inline-block">{note}</p>}
      </div>

      <div ref={mapEl} className="w-full h-full" />

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <span className="bg-neutral-900/85 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap backdrop-blur-sm">
          📍 Pin ko drag karke apne PG par rakhein
        </span>
      </div>
    </div>
  );
}
