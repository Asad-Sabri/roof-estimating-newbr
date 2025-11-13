"use client";

import React, { useState, useEffect } from "react";
import { useMapboxFunctions } from "../hooks/useMapboxFunctions";
import { generatePDF } from "../hooks/pdfGenerate";

export default function TopToolbar() {
  const { mapContainerRef, mapRef, calculatePolygonsDataForPDF } = useMapboxFunctions();
  const [mapReady, setMapReady] = useState(false);

  // Check if map is ready
  useEffect(() => {
    if (!mapRef || !mapRef.current || !mapContainerRef || !mapContainerRef.current) return;

    const interval = setInterval(() => {
      if (mapRef.current && mapContainerRef.current) {
        setMapReady(true);
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [mapRef, mapContainerRef]);

  const handleDownloadPDF = async () => {
    if (!mapReady) {
      alert("Map not ready for PDF. Please wait...");
      return;
    }

    const { polygons = [], lines = [], totalAreaSqFt = 0 } = calculatePolygonsDataForPDF() || {};

    if (polygons.length === 0) {
      alert("No polygons drawn on the map yet.");
      return;
    }

    const projectData = {
      name: "Project ABC",
      address: "Lahore",
      totalPolygons: polygons.length,
      totalLines: lines.length,
      totalAreaSqFt: Number(totalAreaSqFt.toFixed(2)),
    };

    try {
      await generatePDF(mapContainerRef, mapRef, projectData, polygons, lines);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Error generating PDF. Check console for details.");
    }
  };

  return (
    <div className="absolute top-0 left-0 w-full bg-[#0a1f44]/95 text-white flex justify-between items-center px-6 py-3 shadow-lg z-50 border-b border-gray-700">
      <h1 className="font-semibold text-lg tracking-wide">Roof Measurement Tool</h1>
      <div className="flex items-center gap-4">
        {/* ✅ Download PDF Button */}
        <button
          onClick={handleDownloadPDF}
          disabled={!mapReady}
          className={`bg-blue-900 px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition ${
            !mapReady ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Download PDF
        </button>
      </div>
    </div>
  );
}
