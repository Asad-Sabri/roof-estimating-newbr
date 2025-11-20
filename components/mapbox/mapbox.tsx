"use client";

import React from "react";
import { useMapContext } from "../hooks/mapContext";
import LocationCard from "../hooks/LocationCard";
import HeaderToolbar from "../layout/TopToolbar";

export default function Mapbox() {
  const {
    mapRef,
    mapContainerRef,
    tempLocation,
    handleConfirmLocation,
    showLocationCard,
  } = useMapContext();

  // console.log("MapRef from context:", mapRef);
  return (
    <div className="w-full h-full relative">
    <HeaderToolbar mapRef={mapRef || { current: null }} />
      <div ref={mapContainerRef} className="w-full h-full" />

      {showLocationCard && (
        <LocationCard
          tempLocation={tempLocation}
          onConfirm={handleConfirmLocation}
        />
      )}
    </div>
  );
}
