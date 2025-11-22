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
    showLocationCard,
    isLocationConfirmed,
    handleConfirmLocation,
    handleChangeLocation,
  } = useMapContext();

  return (
    <div className="w-full h-full">
      <HeaderToolbar mapRef={mapRef || { current: null }} />
      <div ref={mapContainerRef} className="w-full h-full" />
      {showLocationCard && tempLocation && (
        <LocationCard
          tempLocation={tempLocation}
          handleConfirmLocation={handleConfirmLocation}
          handleChangeLocation={handleChangeLocation}
          editMode={!isLocationConfirmed}
        />
      )}
    </div>
  );
}
