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
    isEditMode,
    handleConfirmLocation,
    handleChangeLocation,
  } = useMapContext();

  return (
    <div className="absolute inset-0 w-full h-full relative" style={{ zIndex: 1, overflow: 'hidden' }}>
      <div 
        ref={mapContainerRef} 
        className="absolute inset-0 w-full h-full" 
        style={{ zIndex: 0, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      {showLocationCard && tempLocation && (
        <LocationCard
          tempLocation={tempLocation}
          handleConfirmLocation={handleConfirmLocation}
          handleChangeLocation={handleChangeLocation}
          editMode={isEditMode}
          isLocationConfirmed={isLocationConfirmed}
          showLocationCard={showLocationCard}
        />
      )}
    </div>
  );
}
