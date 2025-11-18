"use client";
import React from "react";
import { useMapContext } from "../hooks/mapContext";

export default function LocationCard() {
  const { tempLocation, handleConfirmLocation, showLocationCard } =
    useMapContext();

  if (!tempLocation || !showLocationCard) return null;

  return (
    <div
      className="
        absolute
        top-40
        left-1/2
        -translate-x-1/2
        -translate-y-1/2
        z-50
        bg-white
        p-3
        rounded-xl
        shadow-2xl
        border-2
        border-blue-800
        w-72
        text-center
        transition-all
        duration-300
        hover:scale-105
      "
    >
      <h2 className="mb-3 text-lg font-semibold text-blue-700">
        Is this your accurate location?
      </h2>
      <p className="mb-4 text-gray-700 text-sm">
        If not, click anywhere on the map to change the location.
      </p>
      <button
        className="
          bg-blue-800
          text-white
          px-5
          py-2
          rounded-lg
          font-medium
          hover:bg-blue-900
          transition-colors
          duration-200
        "
        onClick={() => handleConfirmLocation(tempLocation)}
      >
        Confirm Location
      </button>
    </div>
  );
}
