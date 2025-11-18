"use client";

import React from "react";
import { useMapContext } from "../hooks/mapContext";
import GridOverlay from "./GridOverlay";

export default function Mapbox() {
  const { mapContainerRef, showGrid } = useMapContext();

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
      {showGrid && <GridOverlay />}
    </div>
  );
}
