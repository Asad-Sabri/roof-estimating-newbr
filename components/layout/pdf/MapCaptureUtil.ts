// MapCaptureUtil.ts
import mapboxgl from "mapbox-gl";

export const captureMapImage = (mapRef: React.RefObject<mapboxgl.Map>) => {
  if (!mapRef.current) return "";
  const canvas = mapRef.current.getCanvas();
  // ensure preserveDrawingBuffer: true when creating map
  return canvas.toDataURL("image/png");
};
