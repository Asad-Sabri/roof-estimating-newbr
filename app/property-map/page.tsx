"use client";

import React, { useRef, useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import LeftSidebar from "@/components/common/left-sidebar";
import TopToolbar from "@/components/common/top-tool-bar";
import RightSidebar from "@/components/common/right-sidebar";
import RoofMapSection, {
  RoofMapSectionHandle,
} from "@/components/sections/roof-map-section";

export default function RoofEstimatorPage() {
  const roofMapRef = useRef<RoofMapSectionHandle | null>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);

  const [planArea, setPlanArea] = useState(0);
  const [roofArea, setRoofArea] = useState(0);
  const [edges, setEdges] = useState<any[]>([]);
  const [polygonPoints, setPolygonPoints] = useState<any[]>([]);

  // selectedLabel state mostly for UI / later use (optional)
  const [selectedLabel, setSelectedLabel] = useState<{
    name: string;
    color: string;
  } | null>(null);

  // called by LeftSidebar
  const handleSelectLabel = (label: { name: string; color: string }) => {
    setSelectedLabel(label);
    // direct call to MapContainer method exposed through RoofMapSection
    roofMapRef.current?.startDrawingWithLabel?.(label);
  };
const handleMapLoad = (mapInstance: mapboxgl.Map) => {
  console.log("Map loaded ✅", mapInstance);
  setMap(mapInstance);
};

  return (
    <div className="relative w-full h-screen pt-14">
      <LeftSidebar onSelectLabel={handleSelectLabel} />

      <TopToolbar
        map={map}
        onSaveRoof={() => console.log("save")}
        onThicknessChange={(value) => {
          // ✅ Update line thickness on map draw layers
          if (map) {
            const layers = ["gl-draw-polygon-stroke", "gl-draw-line"];
            layers.forEach((layerId) => {
              try {
                if (map.getLayer(layerId)) {
                  map.setPaintProperty(layerId, "line-width", value);
                }
              } catch {}
            });
          }
        }}
        onSnapToggle={(enabled) => {
          // ✅ Toggle snap mode (can be implemented with grid snapping)
          console.log("Snap:", enabled);
        }}
        onLocationConfirm={() => {}}
        onDownloadPDF={() => roofMapRef.current?.downloadPDF?.()}
      />

      <div className="absolute inset-0">
        <RoofMapSection
          ref={roofMapRef}
          onMapLoad={handleMapLoad}
          setPlanArea={setPlanArea}
          setRoofArea={setRoofArea}
          setEdges={setEdges}
          setPolygonPoints={setPolygonPoints}
          selectedLabel={selectedLabel} // ✅ add this
        />
      </div>

      <RightSidebar
        onSetDrawMode={(m) => roofMapRef.current?.setDrawMode?.(m)}
        onStartDrawing={() => roofMapRef.current?.startDrawing?.()}
        onDeleteAll={() => roofMapRef.current?.deleteAll?.()}
        onDeleteSelected={() => roofMapRef.current?.deleteSelected?.()}
        onUndo={() => roofMapRef.current?.undo?.()}
        onRedo={() => roofMapRef.current?.redo?.()}
        onSplit={() => roofMapRef.current?.startSplitMode?.()}
        onOverhang={() => roofMapRef.current?.applyOverhang?.()}
        onRotateLeft={() => roofMapRef.current?.rotateLeft?.()}
        onRotateRight={() => roofMapRef.current?.rotateRight?.()}
        onToggleStreetView={() => roofMapRef.current?.toggleStreetView?.()}
      />
    </div>
  );
}
