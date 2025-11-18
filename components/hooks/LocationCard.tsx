"use client";
import React from "react";

interface LocationCardProps {
  onConfirm: () => void;
  tempLocation: [number, number] | null;
}

export default function LocationCard({ onConfirm, tempLocation }: LocationCardProps) {
  if (!tempLocation) return null;

  return (
    <div className="absolute top-70 left-1/2 transform -translate-x-1/2 z-50 bg-white p-4 rounded shadow-lg border">
      <h2 className="mb-2 text-black">Is this your accurate location?</h2>
      <p className="mb-2 text-black">Click on map to change location</p>
      <div className="flex justify-between gap-2">
        <button
          className="bg-blue-800 text-white px-3 py-1 rounded hover:bg-blue-600"
          onClick={onConfirm}
        >
          Confirm Location
        </button>
        
      </div>
    </div>
  );
}
