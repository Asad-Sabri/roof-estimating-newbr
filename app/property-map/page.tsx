"use client";

import React from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import TopToolbar from "@/components/layout/TopToolbar";
import Mapbox from "@/components/mapbox/mapbox";
import { MapProvider } from "@/components/hooks/mapContext";

export default function RoofEstimatorPage() {
  return (
    <MapProvider>
      <div className="relative w-full h-screen pt-14">
        <LeftSidebar />
        <TopToolbar />
        <div className="absolute inset-0">
          <Mapbox />
        </div>
        <RightSidebar />
      </div>
    </MapProvider>
  );
}
