import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
  "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNqZ3V6bGd2bjA0Z3gycXA0d3Y2OHF5cGkifQ.fYB8mF-T5lFjIRVJ6_XUA"; // temporary demo token

interface MapPopupProps {
  onClose: () => void;
  onSelect: (place: string, coordinates: { lng: number; lat: number }) => void;
}

export default function MapPopup({ onClose, onSelect }: MapPopupProps) {
  const mapContainerRef = useRef(null);
  const [lng, setLng] = useState(74.3587);
  const [lat, setLat] = useState(31.5204);
  const [zoom, setZoom] = useState(12);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
  if (!mapContainerRef.current) return;

  const map = new mapboxgl.Map({
    container: mapContainerRef.current,
    style: "mapbox://styles/mapbox/satellite-streets-v12",
    center: [lng, lat],
    zoom: 18,
  });

  // ✅ Automatically straighten map
  map.on("load", () => {
    map.easeTo({ bearing: 0, pitch: 0, duration: 1000 });
  });

  mapRef.current = map;

  return () => map.remove();
}, []);

  const handleSelect = async () => {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
    );
    const data = await res.json();
    const place = data.features[0]?.place_name || "Unknown location";
    onSelect(place, { lng, lat });
  };

  return (
    <div className="absolute top-0 left-0 w-full bg-white shadow-xl rounded-lg border border-gray-200 p-4 z-40">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-gray-700">
          Select Location on Map
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-red-500 text-xl"
        >
          ×
        </button>
      </div>

      {/* Map container */}
      <div className="relative w-full h-72 rounded-md mb-4 overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Center Marker (Fixed in middle of map) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full z-20 pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="#EF4444"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="white"
            className="w-8 h-8 drop-shadow-lg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 21c4.97-5.33 8-9 8-12a8 8 0 10-16 0c0 3 3.03 6.67 8 12z"
            />
            <circle cx="12" cy="9" r="2.5" fill="white" />
          </svg>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSelect}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Select
        </button>
      </div>
    </div>
  );
}
