"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

interface Props {
  tempLocation: [number, number] | null;
  handleConfirmLocation: () => void;
  handleChangeLocation: () => void;
  editMode: boolean;
  isLocationConfirmed?: boolean;
  showLocationCard?: boolean;
}

export default function LocationCard({
  tempLocation,
  handleConfirmLocation,
  handleChangeLocation,
  editMode,
  isLocationConfirmed = false,
  showLocationCard = true,
}: Props) {
  const [address, setAddress] = useState("Loading address...");

  useEffect(() => {
    let cancelled = false;
    if (!tempLocation) return setAddress("No location selected");

    const fetchAddress = async () => {
      try {
        const [lng, lat] = tempLocation;
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (!token) return setAddress("No Mapbox token");

        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}`;
        const response = await axios.get(url);
        if (!cancelled) {
          setAddress(response.data.features?.[0]?.place_name || "Address not found");
        }
      } catch {
        if (!cancelled) setAddress("Unable to fetch address");
      }
    };

    fetchAddress();
    return () => { cancelled = true; };
  }, [tempLocation]);

  if (!tempLocation) return null;

  return (
    <div className="absolute top-30 left-1/2 -translate-x-1/2 z-50 bg-white p-3 rounded-xl shadow-2xl border-2 border-blue-800 w-80 text-center transition-all duration-300 pointer-events-auto">
      <h2 className="mb-2 text-lg font-semibold text-blue-700">
        Is this your accurate location?
      </h2>
      <p className="mb-2 text-gray-700 text-sm">{address}</p>
      <p className="mb-3 text-gray-500 text-xs">
        Lng: {tempLocation[0].toFixed(6)}, Lat: {tempLocation[1].toFixed(6)}
      </p>
      <div className="flex gap-2 justify-center">
        <button
          onClick={handleConfirmLocation}
          className="bg-blue-800 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-900 transition-colors"
        >
          Confirm Location
        </button>
        {/* Show "Change Location" button when NOT in edit mode */}
        {!editMode && (
          <button
            onClick={handleChangeLocation}
            className="px-3 py-1.5 rounded-md text-sm font-medium border border-gray-300 bg-white text-black hover:bg-gray-50 transition-colors"
          >
            Change Location
          </button>
        )}
        {/* Show "Click on map to move pin" when in edit mode - same row */}
        {editMode && (
          <div className="px-3 py-1.5 rounded-md text-sm font-medium border border-yellow-400 bg-yellow-50 text-yellow-800">
            Click on map to move pin
          </div>
        )}
      </div>
    </div>
  );
}
