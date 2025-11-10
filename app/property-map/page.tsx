"use client";

import React, { useRef, useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import LeftSidebar from "@/components/common/left-sidebar";
import TopToolbar from "@/components/common/top-tool-bar";
import RightSidebar from "@/components/common/right-sidebar";
import RoofMapSection from "@/components/sections/roof-map-section";
import { MapSectionHandle } from "@/components/sections/components/MapContainer";

export default function RoofEstimatorPage() {
  const roofMapRef = useRef<MapSectionHandle | null>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [labelsVisible, setLabelsVisible] = useState(true);

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
    roofMapRef.current?.handleLabelSelect?.(label);
  };

  const handleToggleLabels = () => {
    setLabelsVisible((prev) => !prev);
    roofMapRef.current?.toggleLabels?.();
  };
const handleMapLoad = (mapInstance: mapboxgl.Map) => {
  console.log("Map loaded ✅", mapInstance);
  setMap(mapInstance);
};

  return (
    <div className="relative w-full h-screen pt-14">
      <LeftSidebar
      onSelectLabel={handleSelectLabel} 
      // onSelectLabel={handleLabelSelect}
      // onToggleLabels={toggleLabels}
      // onDrawLine={startDrawingLine}
      // labelsVisible={labelsVisible}
      />

      <TopToolbar
        map={map}
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
        onStartDrawing={() => roofMapRef.current?.startDrawing?.()}
        onStartSingleDrawing={() => roofMapRef.current?.startSingleDrawing?.()}
        onDeleteAll={() => roofMapRef.current?.deleteAll?.()}
        onDeleteSelected={() => roofMapRef.current?.deleteSelected?.()}
        onUndo={() => roofMapRef.current?.undo?.()}
        onRedo={() => roofMapRef.current?.redo?.()}
        onRotateLeft={() => roofMapRef.current?.rotateLeft?.()}
        onRotateRight={() => roofMapRef.current?.rotateRight?.()}
        onToggleStreetView={() => roofMapRef.current?.toggleStreetView?.()}
        onToggleLabels={handleToggleLabels}
        labelsVisible={labelsVisible}
      />
    </div>
  );
}
