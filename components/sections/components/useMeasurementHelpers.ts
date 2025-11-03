import * as turf from "@turf/turf";
import mapboxgl from "mapbox-gl";
import type { MutableRefObject, RefObject } from "react";

export const useMeasurementHelpers = (
  mapRef: RefObject<mapboxgl.Map | null>,
  labelsRef: MutableRefObject<mapboxgl.Marker[]>,
  onMeasurementsChange: (payload: {
    edges: any[];
    planArea: number;
    roofArea: number;
    polygonPoints: any[];
  }) => void
) => {
  const clearLabels = () => {
    labelsRef.current.forEach((m) => m.remove());
    labelsRef.current = [];
  };

  const toFeetInches = (feetValue: number) => {
    const feet = Math.floor(feetValue);
    const inches = Math.round((feetValue - feet) * 12);
    return `${feet}'${inches}"`;
  };

  const updateMeasurements = (drawRef: RefObject<any>) => {
    if (!drawRef.current) return;
    const data = drawRef.current.getAll();
    clearLabels();

    // area, edges, etc. calculate karo (same turf logic)
    // ... turf.area, turf.distance, midpoint label, etc.
    // last me callback:
    onMeasurementsChange({
      edges: [], planArea: 0, roofArea: 0, polygonPoints: [],
    });
  };

  return { updateMeasurements };
};
