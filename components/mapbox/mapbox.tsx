"use client";

import React, { useEffect } from "react";
import { useMapContext } from "../hooks/mapContext";


export default function Mapbox() {
  const { mapContainerRef } = useMapContext();

  // map is already initialized inside the hook (useMapboxFunctions)
  // so this component only provides the container div
  return (
    <div className="w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
