// layout/pdf/MapCaptureUtil.ts
import mapboxgl from "mapbox-gl";

export const captureMapImage = (mapRef: React.RefObject<mapboxgl.Map>) => {
  if (!mapRef.current) return "";
  return mapRef.current.getCanvas().toDataURL("image/png");
};
