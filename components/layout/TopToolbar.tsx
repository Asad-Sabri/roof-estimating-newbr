"use client";

import React, { useEffect } from "react";
import { generatePDF } from "./pdf/pdfGenerator";
import mapboxgl from "mapbox-gl";

interface HeaderToolbarProps {
  mapRef: React.RefObject<mapboxgl.Map>;
}

export default function HeaderToolbar({ mapRef }: HeaderToolbarProps) {
  useEffect(() => {
    console.log("HeaderToolbar mounted. mapRef.current:", mapRef?.current);
  }, [mapRef]);

  const handleDownloadPDF = () => {
    if (!mapRef || !mapRef.current) {
      console.warn("Map not ready yet!");
      return;
    }

    const canvas = mapRef.current.getCanvas();
    generatePDF({ mapImage: canvas.toDataURL("image/png") });
  };

  return (
    <div className="absolute top-0 left-0 w-full bg-[#0a1f44]/95 text-white flex justify-between items-center px-6 py-3 shadow-lg z-50 border-b border-gray-700">
      <h1 className="font-semibold text-lg tracking-wide">
        Superior Pro Roof Measurement Tool
      </h1>
      <div className="flex items-center gap-4">
        <button
          className="bg-blue-900 px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition"
          onClick={handleDownloadPDF}
          disabled={!mapRef?.current} // map ready hone tak disable
        >
          Download PDF
        </button>
      </div>
    </div>
  );
}
