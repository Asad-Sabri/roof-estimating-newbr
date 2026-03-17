"use client";

import React, { useEffect } from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import TopToolbar from "@/components/layout/TopToolbar";
import Mapbox from "@/components/mapbox/mapbox";
import { MapProvider, useMapContext } from "@/components/hooks/mapContext";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";

function PageContent() {
  const { mapRef, updateShapesData } = useMapContext();

  useEffect(() => {
    document.body.classList.add("map-page-no-scroll");
    return () => document.body.classList.remove("map-page-no-scroll");
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
      <LeftSidebar />
      <TopToolbar mapRef={mapRef} onBeforePdf={updateShapesData} />
      <div className="absolute inset-0 w-full h-full">
        <Mapbox />
      </div>
      <RightSidebar />
    </div>
  );
}

export default function RoofEstimatorPage() {
  const { isAuthenticated, isChecking } = useProtectedRoute(); // Protect this route

  // Don't render anything if checking or not authenticated
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via hook
  }

  return (
    <MapProvider>
      <PageContent />
    </MapProvider>
  );
}
