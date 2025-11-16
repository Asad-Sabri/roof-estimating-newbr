"use client";

import React, { useRef } from "react";
import { Viewer } from "resium";
import { Cartesian3 } from "cesium";

export default function CesiumMap() {
  const viewerRef = useRef<any>(null);

  return (
    <div className="w-full h-full">
      <Viewer
        ref={viewerRef}
        full
        terrainProvider={undefined} // Cesium Ion terrain or your own
        imageryProvider={undefined} // Satellite imagery or street map
        sceneMode={2} // 3D
        homeButton={false}
        timeline={false}
        animation={false}
      />
    </div>
  );
}
