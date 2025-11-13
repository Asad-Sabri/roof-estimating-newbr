// components/hooks/mapContext.tsx
"use client";

import React, { createContext, useContext } from "react";
import { useMapboxFunctions as useMapboxFunctionsOriginal } from "./useMapboxFunctions";

/**
 * Expose EDGE_TYPE_COLORS and toFeetInchesFormat as named exports
 * so other modules (pdfGenerate) can import them directly.
 */
export const EDGE_TYPE_COLORS: Record<string, string> = {
  Ridge: "#ff0000",
  Valley: "#0000ff",
  Eave: "#00ff00",
  Rake: "#ffa500",
  "Wall Flashing": "#8B4513",
  "Step Flashing": "#800080",
  Unspecified: "#000000",
};

export const toFeetInchesFormat = (lengthInFeet: number) => {
  const feet = Math.floor(lengthInFeet);
  const inches = Math.round((lengthInFeet - feet) * 12);
  return `${feet}' ${inches}"`;
};

const MapContext = createContext<any>(null);

export const MapProvider = ({ children }: { children: React.ReactNode }) => {
  const mapHook = useMapboxFunctionsOriginal();
  return <MapContext.Provider value={mapHook}>{children}</MapContext.Provider>;
};

export const useMapContext = () => {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error("useMapContext must be used inside MapProvider");
  return ctx;
};
