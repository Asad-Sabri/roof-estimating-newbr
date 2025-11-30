"use client";

import React from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import TopToolbar from "@/components/layout/TopToolbar";
import Mapbox from "@/components/mapbox/mapbox";
import { MapProvider, useMapContext } from "@/components/hooks/mapContext";

function PageContent() {
  const { mapRef } = useMapContext();
  return (
    <div className="relative w-full h-screen pt-14">
      <LeftSidebar />
      <TopToolbar mapRef={mapRef} />
      <div className="absolute inset-0">
        <Mapbox />
      </div>
      <RightSidebar />
    </div>
  );
}

export default function RoofEstimatorPage() {
  return (
    <MapProvider>
      <PageContent />
    </MapProvider>
  );
}
