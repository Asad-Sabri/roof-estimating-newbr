"use client";

import React from "react";
import { useMapContext } from "../hooks/mapContext";
import LocationCard from "../hooks/LocationCard";

export default function Mapbox() {
  const {
    mapContainerRef,
    tempLocation,
    handleConfirmLocation,
    showLocationCard,
  } = useMapContext();

  return (
    <div className="w-full h-full relative">
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
