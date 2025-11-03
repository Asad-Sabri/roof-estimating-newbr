import { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

export const useMapInitialization = ({
  mapContainerRef,
  selectedLabel,
  onMapLoad,
  onMeasurementsChange,
  mapRef,
  drawRef,
  initialCenter,
  initialZoom,
  onGridToggle,
  onBearingChange,
  updateMeasurements,
  searchAddress
  
}: any) => {
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: initialCenter,
      zoom: initialZoom,
      maxZoom: 22,
    });

    mapRef.current = mapInstance;
    const drawInstance = new MapboxDraw({ displayControlsDefault: false });
    drawRef.current = drawInstance;

    mapInstance.on("load", () => {
      mapInstance.addControl(drawInstance);
      updateMeasurements();
      onMapLoad?.(mapInstance);
    });

    return () => mapInstance.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
