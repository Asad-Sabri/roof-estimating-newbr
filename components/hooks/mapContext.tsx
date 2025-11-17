// components/hooks/mapContext.tsx
"use client";

import React, { createContext, useContext } from "react";
import { useMapboxFunctions } from "./useMapboxFunctions";

const MapContext = createContext<any>(null);

export const MapProvider = ({ children }: { children: React.ReactNode }) => {
  const mapHook = useMapboxFunctions();
  return <MapContext.Provider value={mapHook}>{children}</MapContext.Provider>;
};

export const useMapContext = () => {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error("useMapContext must be used inside MapProvider");
  return ctx;
};
