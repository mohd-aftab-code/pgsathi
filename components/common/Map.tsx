"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
}

function MapEvents({ setMarkerPos, onChange }: { 
  setMarkerPos: (pos: [number, number]) => void;
  onChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      setMarkerPos([e.latlng.lat, e.latlng.lng]);
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function Map({ position, onChange }: MapProps) {
  const [markerPos, setMarkerPos] = useState<[number, number]>(position || DEFAULT_CENTER);
  const markerRef = useRef<L.Marker>(null);

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
          onChange(lat, lng);
        }
      },
    }),
    [onChange]
  );

  return (
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
      <MapEvents setMarkerPos={setMarkerPos} onChange={onChange} />
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={markerPos}
        ref={markerRef}
      />
    </MapContainer>
  );
}
