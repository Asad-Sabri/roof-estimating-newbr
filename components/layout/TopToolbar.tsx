"use client";

import React, { useEffect } from "react";
import { generatePDF } from "./pdf/pdfGenerator";
import mapboxgl from "mapbox-gl";
import { toast } from "react-toastify";
import logoSrc from "../../public/logo-latest.png";
import Image from "next/image";

interface HeaderToolbarProps {
  mapRef: React.RefObject<mapboxgl.Map | null>;
  onBeforePdf?: () => void;
}

export default function HeaderToolbar({ mapRef, onBeforePdf }: HeaderToolbarProps) {
  useEffect(() => {
    console.log("HeaderToolbar mounted. mapRef.current:", mapRef?.current);
  }, [mapRef]);

  const handleDownloadPDF = async () => {
    if (!mapRef?.current) {
      toast.error("Map not ready yet.");
      return;
    }
    try {
      onBeforePdf?.();
      const canvas = mapRef.current.getCanvas();
      await generatePDF({ mapImage: canvas.toDataURL("image/png") });
      toast.success("PDF downloaded.");
    } catch (err: any) {
      console.error("PDF generation failed:", err);
      toast.error(err?.message || "PDF download failed. Try again.");
    }
  };

  return (
    <div className="absolute top-0 left-0 px-20 w-full bg-white text-gray-900 flex justify-between items-center px-6 py-3 shadow-lg z-50 border-b border-gray-200">
      <div className="flex items-center">
        <Image src={logoSrc} alt="Logo" height={130} width={130} />
      </div>

      <div className="flex items-center gap-4">
        <button
          className="bg-[#8b0e0f] text-white px-3 py-3 rounded text-sm hover:opacity-90 transition disabled:opacity-60"
          onClick={handleDownloadPDF}
          disabled={!mapRef?.current}
        >
          Download PDF
        </button>
      </div>
    </div>
  );
}
