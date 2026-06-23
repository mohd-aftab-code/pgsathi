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
}

export default function LocationPicker({ latitude, longitude, onChange }: LocationPickerProps) {
  const position: [number, number] | null = latitude && longitude ? [latitude, longitude] : null;

  return (
    <div className="w-full h-64 relative border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
      <Map position={position} onChange={onChange} />
    </div>
  );
}
