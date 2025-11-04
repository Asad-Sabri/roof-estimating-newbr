import * as turf from "@turf/turf";
import mapboxgl from "mapbox-gl";

export const useMeasurementHelpers = (mapRef, labelsRef, onMeasurementsChange) => {
  const clearLabels = () => {
    labelsRef.current.forEach((m) => m.remove());
    labelsRef.current = [];
  };

  const toFeetInches = (feetValue: number) => {
    const feet = Math.floor(feetValue);
    const inches = Math.round((feetValue - feet) * 12);
    return `${feet}'${inches}"`;
  };

  const updateMeasurements = (drawRef) => {
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
