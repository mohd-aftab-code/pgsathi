"use client";

/**
 * components/listings/LocationStep.tsx
 * Step 2 of the listing wizard, shared by the "new" and "edit" pages.
 *
 * It exists as one component because the two pages previously each had their own
 * copy — fixing the city bug in one silently left the other broken.
 *
 * Flow is a strict cascade so the owner is never asked for something we haven't
 * given them the context for:
 *   State → City/District → PIN code → Area → street address → map
 * Every step has a free-text escape hatch; nothing here can dead-end.
 */

import { useEffect, useState } from "react";
import { MapPin, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import LocationPicker from "@/components/common/LocationPicker";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { STATE_NAMES, districtsOf } from "@/lib/india-locations";

export type LocationValue = {
  stateName: string;
  cityName: string;
  pincode: string;
  areaLocality: string;
  localityId: string;
  address: string;
  landmark: string;
  latitude: number | null;
  longitude: number | null;
};

export function LocationStep({
  value,
  onChange,
  simpleAddress = false,
}: {
  value: LocationValue;
  onChange: (patch: Partial<LocationValue>) => void;
  /**
   * Collapses Area/Mohalla, Building and Landmark into a single Address box.
   * The partner form uses this: a partner is filling the form on someone else's
   * behalf, often over the phone, and three separate location boxes is where
   * they stall. State + city + PIN + the map pin already place the PG, so the
   * rest is detail a tenant reads, not data the system needs split up.
   */
  simpleAddress?: boolean;
}) {
  const [pinStatus, setPinStatus] = useState<"idle" | "loading" | "ok" | "fail">("idle");
  const [pinMessage, setPinMessage] = useState("");
  const [pinCity, setPinCity] = useState<{ city: string; state: string } | null>(null);
  const [areas, setAreas] = useState<{ id: number | null; name: string }[]>([]);
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "ok" | "fail">("idle");
  const [geoHit, setGeoHit] = useState<{ label: string; precision: string } | null>(null);

  const districts = districtsOf(value.stateName);

  // Re-resolve a pincode that arrived from a saved draft / existing listing, so
  // the area list is populated on first paint instead of looking empty.
  useEffect(() => {
    if (value.pincode.length === 6 && areas.length === 0 && pinStatus === "idle") {
      resolvePincode(value.pincode);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function resolvePincode(pin: string) {
    if (pin.length !== 6) return;
    setPinStatus("loading");
    setPinMessage("");
    try {
      const res = await fetch(`/api/geo/pincode?pin=${pin}`);
      const data = await res.json();
      if (!data.success) {
        setPinStatus("fail");
        setPinCity(null);
        setPinMessage(data.message || "Could not find details for this PIN — please type the area.");
        setAreas([]);
        return;
      }
      setAreas(data.areas || []);
      setPinCity({ city: data.cityName, state: data.stateName });
      setPinStatus("ok");
      setPinMessage("");
      // Fill state/city only if the owner hasn't chosen them yet
      onChange({
        stateName: value.stateName || data.stateName,
        cityName: value.cityName || data.cityName,
        latitude: value.latitude ?? data.latitude ?? null,
        longitude: value.longitude ?? data.longitude ?? null,
      });
    } catch {
      setPinStatus("fail");
      setPinCity(null);
      setPinMessage("Network issue — please type the area manually.");
      setAreas([]);
    }
  }

  async function locateOnMap() {
    if (!value.cityName && value.pincode.length !== 6) return;
    setGeoStatus("loading");
    try {
      const res = await fetch("/api/geo/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: value.address,
          area: value.areaLocality,
          city: value.cityName,
          state: value.stateName,
          pincode: value.pincode,
        }),
      });
      const data = await res.json();
      if (!data.success) { setGeoHit(null); return setGeoStatus("fail"); }
      setGeoStatus("ok");
      setGeoHit({ label: data.label, precision: data.precision });
      onChange({ latitude: data.latitude, longitude: data.longitude });
    } catch {
      setGeoHit(null);
      setGeoStatus("fail");
    }
  }

  // The PIN belongs to a different district than the one picked — worth saying,
  // but not worth blocking: administrative and postal districts differ.
  const cityMismatch =
    pinStatus === "ok" &&
    pinCity &&
    value.cityName &&
    pinCity.city.toLowerCase() !== value.cityName.toLowerCase();

  const locationReady = !!(value.latitude && value.longitude);

  const label = (n: number, text: string, required = true) => (
    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary-500 text-white text-[10px] mr-1.5 align-middle">
        {n}
      </span>
      {text} {required && <span className="text-red-500">*</span>}
    </label>
  );

  const inputCls =
    "w-full h-11 px-3 rounded-lg border-2 border-neutral-200 bg-white text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none transition-all shadow-sm placeholder:text-neutral-400";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-5 md:p-6 bg-white">
        <h3 className="text-lg font-bold text-neutral-900 mb-1">Where is your PG located?</h3>
        <p className="text-xs text-neutral-500 mb-5 pb-4 border-b border-neutral-100">
          You can type to search in every field. The map will automatically update at the end.
        </p>

        {/* Row 1 — State + City */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            {label(1, "State")}
            <SearchableSelect
              options={STATE_NAMES}
              value={value.stateName}
              onChange={(v) => onChange({ stateName: v, cityName: "" })}
              placeholder="Type e.g. Uttar"
              customHint="this state is not in the list"
            />
          </div>
          <div>
            {label(2, "City / District")}
            <SearchableSelect
              options={districts}
              value={value.cityName}
              onChange={(v) => onChange({ cityName: v })}
              disabled={!value.stateName}
              disabledText="Select state first…"
              placeholder="Type e.g. Hath"
              customHint="this city is not in the list — it will be saved as typed"
            />
          </div>
        </div>

        {/* Row 2 — PIN + Area */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            {label(3, "PIN Code")}
            {!value.cityName ? (
              <div className="h-11 px-3 rounded-lg border-2 border-neutral-200 bg-neutral-50 flex items-center text-sm text-neutral-400 cursor-not-allowed">
                Select city first…
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className={`w-full h-11 pl-3 pr-9 rounded-lg border-2 bg-white text-sm tracking-[0.2em] font-semibold focus:ring-2 outline-none transition-all shadow-sm ${
                    pinStatus === "fail"
                      ? "border-amber-300 focus:ring-amber-300"
                      : pinStatus === "ok"
                      ? "border-green-400 focus:ring-green-300"
                      : "border-neutral-200 focus:ring-primary-300 focus:border-primary-400"
                  }`}
                  placeholder="204211"
                  value={value.pincode}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                    onChange({ pincode: v, areaLocality: "", localityId: "" });
                    if (v.length < 6) {
                      setPinStatus("idle");
                      setPinMessage("");
                      setPinCity(null);
                      setAreas([]);
                    } else {
                      resolvePincode(v);
                    }
                  }}
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  {pinStatus === "loading" && <Loader2 size={16} className="animate-spin text-primary-500" />}
                  {pinStatus === "ok" && <CheckCircle2 size={16} className="text-green-500" />}
                  {pinStatus === "fail" && <AlertCircle size={16} className="text-amber-500" />}
                </div>
              </div>
            )}
          </div>

          {!simpleAddress && (
            <div>
              {label(4, "Area / Mohalla", false)}
              {/* India Post only lists post offices, not every mohalla — so this is
                  a text field first, with those names offered as suggestions. */}
              <SearchableSelect
                options={areas.map((a) => a.name)}
                value={value.areaLocality}
                onChange={(v) => {
                  const match = areas.find((a) => a.name === v);
                  onChange({ areaLocality: v, localityId: match?.id ? String(match.id) : "" });
                }}
                disabled={value.pincode.length !== 6}
                disabledText="Enter PIN code first…"
                placeholder="Type your area/mohalla"
                customHint="this name will be saved"
              />
              <p className="text-[11px] text-neutral-400 mt-1">
                Type your area name — whether it's in the list or not, it will be saved.
              </p>
            </div>
          )}
        </div>

        {/* PIN feedback sits under the row so the grid stays aligned */}
        {value.cityName && (pinStatus !== "idle" || pinMessage) && (
          <div className="-mt-1 mb-4">
            {pinStatus === "ok" && !cityMismatch && (
              <p className="text-[11px] font-medium text-green-700">✓ {pinCity?.city}, {pinCity?.state} — looks good</p>
            )}
            {cityMismatch && (
              <p className="text-[11px] font-medium text-amber-700">
                Note: this PIN is for <strong>{pinCity?.city}</strong>, but you selected <strong>{value.cityName}</strong> — please verify.
              </p>
            )}
            {pinStatus === "fail" && <p className="text-[11px] font-medium text-amber-700">{pinMessage}</p>}
          </div>
        )}

        {/* Row 3 — Address (+ Landmark on the full form only) */}
        {simpleAddress ? (
          <div className="mb-5">
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">Address</label>
            <textarea
              rows={2}
              className={inputCls + " resize-none"}
              placeholder="e.g. 42, Gandhi Road, Civil Lines — opposite Apollo Hospital"
              value={value.address}
              onChange={(e) => onChange({ address: e.target.value })}
            />
            <p className="text-[11px] text-neutral-400 mt-1">
              Write the complete address in one place, including area and landmark.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              {/* Optional, not required: area + city + PIN + the map pin already
                  locate the PG. This only sharpens it for tenants who are coming
                  to visit, so it must never block a listing. */}
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                House / Building <span className="text-neutral-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                className={inputCls}
                placeholder="e.g. 42, Gandhi Road"
                value={value.address}
                onChange={(e) => onChange({ address: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                Landmark <span className="text-neutral-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                className={inputCls}
                placeholder="e.g. opposite Apollo Hospital"
                value={value.landmark}
                onChange={(e) => onChange({ landmark: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Map — built from everything above */}
        <div className="border-t border-neutral-100 pt-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <h4 className="font-bold text-neutral-800 text-sm flex items-center gap-1.5">
                <MapPin className="text-primary-500" size={15} /> Confirm location
              </h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {locationReady ? "Drag the pin to adjust if it's incorrect." : "Click this button after filling the address."}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {locationReady && (
                <span className="text-[11px] bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                  <CheckCircle2 size={11} /> Set
                </span>
              )}
              <button
                type="button"
                onClick={locateOnMap}
                disabled={geoStatus === "loading" || (!value.cityName && value.pincode.length !== 6)}
                className="bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                {geoStatus === "loading" ? (
                  <><Loader2 size={13} className="animate-spin" /> Searching…</>
                ) : (
                  <><MapPin size={13} /> Show on map</>
                )}
              </button>
            </div>
          </div>

          {geoStatus === "fail" && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3 text-xs text-amber-800">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>Could not find location from this address. Click on your location on the map below.</span>
            </div>
          )}

          {/* Say plainly what the map actually matched. A city-level match looks
              identical to a doorstep match on screen, so without this an owner
              would happily publish a pin that's kilometres off. */}
          {geoStatus === "ok" && geoHit && (
            <div
              className={`flex items-start gap-2 rounded-lg px-3 py-2 mb-3 text-xs border ${
                geoHit.precision === "exact"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-amber-50 border-amber-200 text-amber-800"
              }`}
            >
              {geoHit.precision === "exact" ? (
                <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
              )}
              <span>
                <strong>Map set to:</strong> {geoHit.label}
                {geoHit.precision !== "exact" && (
                  <>
                    {" "}— this is the center of the {geoHit.precision === "city" ? "entire city" : "area"}, not your PG's
                    exact location. <strong>Drag the pin below to your PG's location.</strong>
                  </>
                )}
              </span>
            </div>
          )}

          <LocationPicker
            latitude={value.latitude}
            longitude={value.longitude}
            searchCity={value.cityName}
            onChange={(lat, lng) => {
              onChange({ latitude: lat, longitude: lng });
              setGeoStatus("ok");
            }}
            onAddressFound={(data) => {
              // Manual map click is an override — only fill what's still blank.
              const a = data.address || {};
              const mapPin = (a.postcode || "").replace(/\D/g, "").slice(0, 6);
              onChange({
                pincode: value.pincode || mapPin,
                cityName: value.cityName || a.city || a.state_district || a.county || a.town || "",
                stateName: value.stateName || a.state || "",
                address: value.address || [a.road, a.suburb || a.neighbourhood].filter(Boolean).join(", "),
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}

/** Shared validation so both pages reject the same things with the same words. */
export function validateLocation(v: LocationValue): string | null {
  if (!v.stateName.trim()) return "Select state.";
  if (!v.cityName.trim()) return "Select city.";
  if (v.pincode.length !== 6) return "Enter a 6-digit PIN code.";
  // Street address is deliberately optional — state/city/PIN plus the map pin
  // are enough to place the PG, and requiring it only blocked owners.
  if (!v.latitude || !v.longitude)
    return "Location not set — click 'Show on map' or pin it on the map.";
  return null;
}
