"use client";

import { useEffect, useRef, useState } from "react";
import { Sliders, Grid } from "lucide-react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

interface TopToolbarProps {
  map: mapboxgl.Map | null;
  onSaveRoof?: () => void;
  onThicknessChange?: (value: number) => void;
  onSnapToggle?: (enabled: boolean) => void;
  onLocationConfirm?: (coords: [number, number]) => void;
  // ✅ new prop
  onDownloadPDF?: () => void;
}

export default function TopToolbar({
  map,
  onSaveRoof,
  onThicknessChange,
  onSnapToggle,
  onLocationConfirm,
  onDownloadPDF,
}: TopToolbarProps) {
  const [thickness, setThickness] = useState(1);
  const [snap, setSnap] = useState(false);
  const geocoderContainerRef = useRef<HTMLDivElement>(null);
  const geocoderRef = useRef<MapboxGeocoder | null>(null);

  // ✅ Add MapboxGeocoder in toolbar
  useEffect(() => {
    if (map && geocoderContainerRef.current && !geocoderRef.current) {
      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken ?? "",
        mapboxgl,
        marker: false,
        zoom: 19,
        placeholder: "Search an address or place...",
      });

      geocoderRef.current = geocoder;
      geocoderContainerRef.current.innerHTML = ""; // clear old
      geocoder.addTo(geocoderContainerRef.current);

      // ✅ Apply white background and black text styles
      setTimeout(() => {
        const geocoderEl = geocoderContainerRef.current?.querySelector(
          ".mapboxgl-ctrl-geocoder"
        ) as HTMLElement;

        if (geocoderEl) {
          // Main container styles
          geocoderEl.classList.add(
            "!bg-white",
            "!border",
            "!border-gray-300",
            "!text-black",
            "!rounded-lg",
            "!min-w-[300px]",
            "!shadow-md"
          );

          // Input field styles
          const inputEl = geocoderEl.querySelector("input");
          if (inputEl) {
            inputEl.classList.add("!text-black", "!placeholder-gray-500");
          }

          // Suggestions dropdown styles
          const suggestionsEl = geocoderEl.querySelector(".suggestions");
          if (suggestionsEl) {
            suggestionsEl.classList.add(
              "!bg-white",
              "!text-black",
              "!border",
              "!border-gray-300",
              "!shadow-lg"
            );
          }

          // Icon color
          const iconEl = geocoderEl.querySelector(
            ".mapboxgl-ctrl-geocoder--icon"
          );
          if (iconEl) {
            (iconEl as HTMLElement).style.filter = "invert(0)";
          }

          // Loading icon
          const loadingEl = geocoderEl.querySelector(
            ".mapboxgl-ctrl-geocoder--icon-loading"
          );
          if (loadingEl) {
            (loadingEl as HTMLElement).style.filter = "invert(0)";
          }

          // Close button
          const buttonEl = geocoderEl.querySelector(
            ".mapboxgl-ctrl-geocoder--button"
          );
          if (buttonEl) {
            (buttonEl as HTMLElement).style.backgroundColor = "transparent";
          }
        }
      }, 100);

      // ✅ Handle search results
      geocoder.on("result", (e) => {
        const coords = e.result.center as [number, number];

        // Fly to the location
        map.flyTo({
          center: coords,
          zoom: 20,
          essential: true,
        });

        // Notify parent component about the location
        if (onLocationConfirm) {
          onLocationConfirm(coords);
        }
      });

      // Cleanup on unmount
      return () => {
        if (geocoderRef.current) {
          geocoderRef.current.onRemove();
          geocoderRef.current = null;
        }
      };
    }
  }, [map, onLocationConfirm]);

  const handleThicknessChange = (value: number) => {
    setThickness(value);
    if (onThicknessChange) onThicknessChange(value);
  };

  const handleSnapToggle = () => {
    const newSnap = !snap;
    setSnap(newSnap);
    if (onSnapToggle) onSnapToggle(newSnap);
  };

  return (
    <div className="absolute top-0 left-0 w-full bg-[#0a1f44]/95 text-white flex justify-between items-center px-6 py-3 shadow-lg z-20 border-b border-gray-700">
      {/* Left Section - Logo / Title */}
      <h1 className="font-semibold text-lg tracking-wide">
        Roof Measurement Tool
      </h1>

      {/* Middle Section - Search Bar */}
      <div
        ref={geocoderContainerRef}
        className="flex-1 flex justify-center"
      ></div>

      {/* Right Section - Controls */}
      <div className="flex items-center gap-6">
        {/* Line Thickness */}
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-gray-300" />
          <label className="text-sm">Line Thickness:</label>
          <select
            value={thickness}
            onChange={(e) => handleThicknessChange(Number(e.target.value))}
            className="bg-gray-800 text-white rounded px-2 py-1 text-sm focus:outline-none"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}px
              </option>
            ))}
          </select>
        </div>

        {/* Snap Toggle */}
        <div
          onClick={handleSnapToggle}
          className={`flex items-center gap-2 cursor-pointer ${
            snap ? "text-green-400" : "text-gray-300"
          }`}
        >
          <Grid className="w-4 h-4" />
          <span className="text-sm">Snap: {snap ? "On" : "Off"}</span>
        </div>

        {/* Download PDF Button */}
        <button
          onClick={onDownloadPDF}
          className="bg-purple-600 hover:bg-purple-700 px-3 py-1.5 text-sm rounded shadow"
        >
          Download PDF
        </button>

        {/* Save Button */}
        {/* <button
          onClick={onSaveRoof}
          className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-sm rounded shadow"
        >
          Save Roof
        </button> */}
      </div>
    </div>
  );
}
