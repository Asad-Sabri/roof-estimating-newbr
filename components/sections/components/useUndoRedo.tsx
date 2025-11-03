// hooks/useUndoRedo.tsx
import { useCallback, useState } from "react";
import mapboxgl from "mapbox-gl";
import * as turf from "@turf/turf";
// import { toFeetInches } from "../components/MapContainer"; // agar helper alag file me hai
import { EdgeItem, PolygonPoint } from "./MapContainer";
import { clearLabels as clearLabelsHelper, toFeetInches, normalizeBearing } from "./mapHelper";

interface UndoRedoHookProps {
  drawRef: any;
  mapRef: any;
  labelsRef: any;
  setPlanAreaLocal: (v: number) => void;
  setRoofAreaLocal: (v: number) => void;
  setEdgesLocal: (v: EdgeItem[]) => void;
  undoStackRef: any;
  redoStackRef: any;
  awaitingSplitRef: any;
  clearLabels: () => void;
  setShowGrid: (v: boolean) => void;
  onGridToggle?: (v: boolean) => void;
  onMeasurementsChange: (data: {
    edges: EdgeItem[];
    planArea: number;
    roofArea: number;
    polygonPoints: PolygonPoint[];
  }) => void;
  onBearingChange?: (bearing: number) => void;
  setCurrentBearing: (bearing: number) => void;
  setPolygonEdgesMap?: (updater: (prev: any) => any) => void;
}

export const useUndoRedo = ({
  drawRef,
  mapRef,
  labelsRef,
  setPlanAreaLocal,
  setRoofAreaLocal,
  setEdgesLocal,
  undoStackRef,
  redoStackRef,
  awaitingSplitRef,
  clearLabels,
  setShowGrid,
  onGridToggle,
  onMeasurementsChange,
  onBearingChange,
  setCurrentBearing,
  setPolygonEdgesMap,
}: UndoRedoHookProps) => {
  const [drawMode, setDrawModeState] = useState<string>("");

  // ---------------- UPDATE MEASUREMENTS ----------------
  const updateMeasurements = useCallback(() => {
    if (!drawRef.current) return;
    const data = drawRef.current.getAll();
    
    // ✅ Track existing labels before clearing to minimize blinking
    const existingLabelMap = new Map<string, { marker: mapboxgl.Marker; element: HTMLElement }>();
    labelsRef.current.forEach((marker: any) => {
      try {
        const lngLat = marker.getLngLat();
        const key = `${lngLat.lng.toFixed(6)},${lngLat.lat.toFixed(6)}`;
        const element = marker.getElement();
        if (element) {
          existingLabelMap.set(key, { marker, element });
        }
      } catch {}
    });
    
    // ✅ Clear labels
    clearLabelsHelper(labelsRef);

    if (!data || !data.features || data.features.length === 0) {
      setPlanAreaLocal(0);
      setRoofAreaLocal(0);
      setEdgesLocal([]);
      onMeasurementsChange({
        edges: [],
        planArea: 0,
        roofArea: 0,
        polygonPoints: [],
      });
      return;
    }

    const map = mapRef.current;
    if (map) {
      map.on("rotate", () => {
        const bearing = map.getBearing();
        setCurrentBearing(bearing);
        if (onBearingChange) onBearingChange(bearing);
      });
    }

    const allEdges: EdgeItem[] = [];
    let totalAreaMeters = 0;
    const polygonPointsAcc: PolygonPoint[] = [];

    data.features.forEach((feature: any, fIndex: number) => {
      if (!feature.geometry) return;
      if (feature.geometry.type === "Polygon") {
        const coords: number[][] = feature.geometry.coordinates[0];
        let areaSqMeters = 0;
        try {
          areaSqMeters = turf.area(feature);
        } catch {
          areaSqMeters = 0;
        }
        totalAreaMeters += areaSqMeters;

        let perimeterFeet = 0;
        coords.forEach((c, i) => {
          if (i < coords.length - 1) {
            const from = turf.point(c);
            const to = turf.point(coords[i + 1]);
            const lengthFeet = turf.distance(from, to, { units: "feet" });
            perimeterFeet += lengthFeet;

            allEdges.push({
              id: `side-${fIndex}-${i}`,
              length: lengthFeet,
              type: "edge",
            });

            try {
              const midpoint = turf.midpoint(from, to).geometry.coordinates as [
                number,
                number
              ];
              const el = document.createElement("div");
              el.innerText = toFeetInches(lengthFeet);
              Object.assign(el.style, {
                background: "white",
                color: "black",
                padding: "1px 3px",
                fontSize: "12px",
                borderRadius: "8px",
                boxShadow: "0 0 3px rgba(0,0,0,0.3)",
                fontWeight: "700",
                whiteSpace: "nowrap",
              });

              // ✅ Check for overlapping labels and adjust position (reduced margin)
              let adjustedMidpoint = midpoint;
              const existingMarkers = labelsRef.current;
              
              // Check if label would overlap with existing labels (reduced threshold)
              const overlapThreshold = 0.000005; // Smaller threshold for less margin
              
              for (const existingMarker of existingMarkers) {
                try {
                  const existingLngLat = existingMarker.getLngLat();
                  const distance = turf.distance(
                    turf.point([midpoint[0], midpoint[1]]),
                    turf.point([existingLngLat.lng, existingLngLat.lat]),
                    { units: "kilometers" }
                  );
                  
                  // If labels are very close (less than ~0.5 meter), offset this one (reduced threshold)
                  if (distance < 0.0005) {
                    // Offset perpendicular to the edge (smaller offset)
                    const edgeAngle = Math.atan2(
                      coords[i + 1][1] - coords[i][1],
                      coords[i + 1][0] - coords[i][0]
                    );
                    const offsetAngle = edgeAngle + Math.PI / 2; // Perpendicular
                    const offsetDistance = 0.00001; // Smaller offset for less margin
                    
                    adjustedMidpoint = [
                      midpoint[0] + Math.cos(offsetAngle) * offsetDistance,
                      midpoint[1] + Math.sin(offsetAngle) * offsetDistance,
                    ] as [number, number];
                    break;
                  }
                } catch {}
              }

              // ✅ Check if label existed at this position before (prevent blinking)
              const labelKey = `${adjustedMidpoint[0].toFixed(6)},${adjustedMidpoint[1].toFixed(6)}`;
              const existingLabel = existingLabelMap.get(labelKey);
              
              if (existingLabel) {
                // ✅ Reuse existing marker element by updating text
                try {
                  existingLabel.element.innerText = toFeetInches(lengthFeet);
                  // Re-add marker to map (it was removed by clearLabels)
                  existingLabel.marker.addTo(mapRef.current!);
                  labelsRef.current.push(existingLabel.marker);
                } catch {
                  // If reuse fails, create new marker
                  const marker = new mapboxgl.Marker({
                    element: el,
                    anchor: "center",
                  })
                    .setLngLat(adjustedMidpoint)
                    .addTo(mapRef.current!);
                  labelsRef.current.push(marker);
                }
              } else {
                // ✅ Create new marker if none existed at this position
                const marker = new mapboxgl.Marker({
                  element: el,
                  anchor: "center",
                })
                  .setLngLat(adjustedMidpoint)
                  .addTo(mapRef.current!);
                labelsRef.current.push(marker);
              }
            } catch {}
            polygonPointsAcc.push({ lat: c[1], lon: c[0], seq: i + 1 });
          }
        });

        // center label - reuse existing or create new
        try {
          const center = turf.centerOfMass(feature).geometry.coordinates as [
            number,
            number
          ];
          const centerKey = `${center[0].toFixed(6)},${center[1].toFixed(6)}`;
          const existingCenterLabel = existingLabelMap.get(centerKey);
          
          // ✅ Check if it's a center label (has "ft" text)
          if (existingCenterLabel && existingCenterLabel.element.innerText.includes("ft")) {
            // ✅ Reuse existing center marker
            try {
              existingCenterLabel.element.innerText = `${perimeterFeet.toFixed(2)} ft`;
              // Re-add marker to map (it was removed by clearLabels)
              existingCenterLabel.marker.addTo(mapRef.current!);
              labelsRef.current.push(existingCenterLabel.marker);
            } catch {
              // If reuse fails, create new marker
              const div = document.createElement("div");
              div.innerText = `${perimeterFeet.toFixed(2)} ft`;
              Object.assign(div.style, {
                background: "white",
                color: "black",
                padding: "3px 5px",
                fontSize: "12px",
                borderRadius: "8px",
                boxShadow: "0 0 4px rgba(0,0,0,0.35)",
                fontWeight: "700",
                whiteSpace: "pre-line",
              });
              const marker = new mapboxgl.Marker({ element: div, anchor: "center" })
                .setLngLat(center)
                .addTo(mapRef.current!);
              labelsRef.current.push(marker);
            }
          } else {
            // ✅ Create new center marker
            const div = document.createElement("div");
            div.innerText = `${perimeterFeet.toFixed(2)} ft`;
            Object.assign(div.style, {
              background: "white",
              color: "black",
              padding: "3px 5px",
              fontSize: "12px",
              borderRadius: "8px",
              boxShadow: "0 0 4px rgba(0,0,0,0.35)",
              fontWeight: "700",
              whiteSpace: "pre-line",
            });
            const marker = new mapboxgl.Marker({ element: div, anchor: "center" })
              .setLngLat(center)
              .addTo(mapRef.current!);
            labelsRef.current.push(marker);
          }
        } catch {}
      }
    });

    const totalAreaSqFt = totalAreaMeters * 10.7639;
    setPlanAreaLocal(totalAreaSqFt);
    setRoofAreaLocal(totalAreaSqFt);
    setEdgesLocal(allEdges);

    onMeasurementsChange({
      edges: allEdges,
      planArea: totalAreaSqFt,
      roofArea: totalAreaSqFt,
      polygonPoints: polygonPointsAcc,
    });
  }, [
    drawRef,
    mapRef,
    labelsRef,
    setPlanAreaLocal,
    setRoofAreaLocal,
    setEdgesLocal,
    onMeasurementsChange,
    onBearingChange,
    setCurrentBearing,
    clearLabels,
  ]);

  // ---------------- UNDO / REDO ----------------
  const restoreSnapshot = (snapshot: any) => {
    if (!drawRef.current || !mapRef.current) return;
    try {
      // Clear all current features
      drawRef.current.deleteAll();
      
      // Clear all labels
      clearLabelsHelper(labelsRef);
      
      // Clear all custom layers and sources from map
      const map = mapRef.current;
      const existingLayers = map.getStyle().layers || [];
      existingLayers.forEach((layer: any) => {
        if (layer.id && (layer.id.includes("custom-line-layer-") || layer.id.includes("-edge-"))) {
          try {
            if (map.getLayer(layer.id)) map.removeLayer(layer.id);
          } catch {}
        }
      });

      const existingSources = Object.keys(map.getStyle().sources || {});
      existingSources.forEach((srcId) => {
        if (srcId.includes("custom-line-") || srcId.includes("-edge-")) {
          try {
            if (map.getSource(srcId)) map.removeSource(srcId);
          } catch {}
        }
      });

      if (!snapshot?.features) {
        // If snapshot is empty, clear polygonEdgesMap and update measurements
        if (setPolygonEdgesMap) {
          setPolygonEdgesMap(() => ({}));
        }
        updateMeasurements();
        return;
      }
      
      // ✅ Restore features from snapshot (preserve all properties including labels/colors)
      snapshot.features.forEach((f: any) => {
        // ✅ Ensure properties are preserved when restoring
        const featureToAdd = {
          ...f,
          properties: {
            ...f.properties, // Preserve all properties (color, label, etc.)
          },
        };
        drawRef.current?.add(featureToAdd);
      });
      
      // Rebuild polygonEdgesMap and reapply colors for all polygons
      if (setPolygonEdgesMap) {
        const newPolygonEdgesMap: Record<string, any[]> = {};
        snapshot.features.forEach((feature: any) => {
          if (feature.geometry?.type === "Polygon" && feature.id) {
            const featureId = feature.id;
            const coords = feature.geometry.coordinates[0];
            const edges: { id: string; coords: [number, number][] }[] = [];
            
            for (let i = 0; i < coords.length - 1; i++) {
              const id = `${featureId}-edge-${i}`;
              edges.push({ 
                id, 
                coords: [
                  [coords[i][0], coords[i][1]] as [number, number], 
                  [coords[i + 1][0], coords[i + 1][1]] as [number, number]
                ] 
              });
            }
            
            newPolygonEdgesMap[featureId] = edges;

            // ✅ Reapply color layers if color exists and is not yellow
            // ✅ If color is yellow or undefined, custom layers won't be added (keeping default yellow)
            const color = feature.properties?.color || "yellow";
            if (color && color !== "yellow") {
              // ✅ Add custom color layers for non-yellow colors
              for (let i = 0; i < coords.length - 1; i++) {
                const edgeId = `custom-line-${featureId}-${i}`;
                try {
                  map.addSource(edgeId, {
                    type: "geojson",
                    data: {
                      type: "Feature",
                      properties: {},
                      geometry: {
                        type: "LineString",
                        coordinates: [coords[i], coords[i + 1]],
                      },
                    },
                  });
                  map.addLayer({
                    id: `custom-line-layer-${featureId}-${i}`,
                    type: "line",
                    source: edgeId,
                    layout: { "line-cap": "round", "line-join": "round" },
                    paint: { "line-color": color, "line-width": 5 },
                  });
                } catch {}
              }
            }
            // ✅ If color is yellow or undefined, no custom layers are added
            // ✅ This ensures yellow polygons show default yellow color without custom layers
          }
        });
        setPolygonEdgesMap(() => newPolygonEdgesMap);
      }
      
      // ✅ Update measurements after restore - use requestAnimationFrame for smooth update
      // This prevents label blinking
      requestAnimationFrame(() => {
        updateMeasurements();
      });
    } catch (err) {
      console.warn("restoreSnapshot error", err);
    }
  };

  const undo = () => {
    if (!drawRef.current) return;
    const stack = undoStackRef.current;
    if (!stack.length) return;
    try {
      const current = drawRef.current.getAll();
      redoStackRef.current.push(JSON.parse(JSON.stringify(current)));
    } catch {}
    const last = stack.pop();
    restoreSnapshot(last);
  };

  const redo = () => {
    if (!drawRef.current) return;
    const rstack = redoStackRef.current;
    if (!rstack.length) return;
    try {
      const current = drawRef.current.getAll();
      undoStackRef.current.push(JSON.parse(JSON.stringify(current)));
    } catch {}
    const next = rstack.pop();
    restoreSnapshot(next);
  };

  // ---------------- SPLIT ----------------
  const startSplitMode = () => {
    awaitingSplitRef.current = true;
    try {
      drawRef.current?.changeMode("draw_line_string");
    } catch {}
  };

const handleLineForSplit = (lineFeature: any) => {
  if (!mapRef.current || !drawRef.current) return;

  const map = mapRef.current;
  const draw = drawRef.current;

  try {
    const allFeatures = draw.getAll();
    if (!allFeatures.features.length) return;

    // Find the selected polygon
    const selected = allFeatures.features.find(
      (f: any) => f.properties?.isSelected
    );
    if (!selected || selected.geometry.type !== "Polygon") return;

    // Split polygon using turf
    const splitResult = turf.lineSplit(selected, lineFeature);

    if (splitResult.features.length > 1) {
      draw.delete(selected.id);
      splitResult.features.forEach((f: any) => {
        draw.add(f);
      });

      // Update undo/redo stack
      undoStackRef.current.push(draw.getAll());
      redoStackRef.current = [];

      console.log("Polygon successfully split!");
    }
  } catch (err) {
    console.error("Error splitting polygon:", err);
  }
};


  // ---------------- OVERHANG ----------------
  const applyOverhang = useCallback(() => {
    if (!drawRef.current || !mapRef.current) return;
    
    try {
      const allFeatures = drawRef.current.getAll();
      const selectedFeatures = drawRef.current.getSelected();
      
      // ✅ Get selected polygon or first polygon if none selected
      let polygonToBuffer = null;
      if (selectedFeatures?.features?.length > 0) {
        const selected = selectedFeatures.features[0];
        if (selected && selected.geometry?.type === "Polygon") {
          polygonToBuffer = selected;
        }
      } else if (allFeatures?.features?.length > 0) {
        // If no selection, use first polygon
        const firstPolygon = allFeatures.features.find(
          (f: any) => f.geometry?.type === "Polygon"
        );
        if (firstPolygon) polygonToBuffer = firstPolygon;
      }
      
      if (!polygonToBuffer) {
        alert("Please select a polygon to apply overhang");
        return;
      }
      
      // ✅ Save snapshot before overhang for undo/redo
      const currentSnapshot = drawRef.current.getAll();
      undoStackRef.current.push(JSON.parse(JSON.stringify(currentSnapshot)));
      redoStackRef.current = [];
      
      // ✅ Apply buffer (overhang) - typically 6-12 inches outward (0.5-1 feet)
      const overhangDistance = 0.5; // Default 0.5 feet (6 inches)
      
      try {
        const buffered: any = turf.buffer(polygonToBuffer as any, overhangDistance, {
          units: "feet",
        });
        
        // ✅ Replace original polygon with buffered version
        if (polygonToBuffer.id) {
          drawRef.current.delete(polygonToBuffer.id as string);
        }
        
        // ✅ Preserve properties and color from original
        const bufferedFeature = {
          ...buffered,
          properties: {
            ...polygonToBuffer.properties,
            ...buffered.properties,
          },
        };
        
        drawRef.current.add(bufferedFeature);
        
        // ✅ Update measurements after overhang
        setTimeout(() => {
          updateMeasurements();
        }, 100);
      } catch (err) {
        console.error("Error applying overhang:", err);
        alert("Error applying overhang. Please try again.");
      }
    } catch (err) {
      console.error("Overhang error:", err);
    }
  }, [drawRef, mapRef, undoStackRef, updateMeasurements]);

  // ---------------- MAP ACTIONS ----------------
  const startDrawing = () => {
    drawRef.current?.changeMode("draw_polygon");
    setShowGrid(true);
    onGridToggle?.(true);
  };

  const deleteAll = () => {
    try {
      const snap = drawRef.current?.getAll();
      if (snap) undoStackRef.current.push(JSON.parse(JSON.stringify(snap)));
      drawRef.current?.deleteAll();
      clearLabels();
      updateMeasurements();
    } catch {}
  };

  const setDrawMode = (mode: string) => {
    try {
      drawRef.current?.changeMode(mode as any);
    } catch (err) {
      console.warn("setDrawMode error", err);
    }
  };

// const setDrawMode = (mode: string) => {
//   setDrawModeState(mode);
//   if (mode === "draw_polygon") {
//     drawRef.current?.changeMode("draw_polygon");
//   }
// };
    // ---------------- MAP ROTATION + VIEW ----------------
  const rotateLeft = () => {
    if (!mapRef.current) return;
    const bearing = mapRef.current.getBearing();
    const snapped = normalizeBearing(bearing);
    const newBearing = (snapped - 90 + 360) % 360;
    mapRef.current.easeTo({ bearing: newBearing, duration: 500 });
  };

  const rotateRight = () => {
    if (!mapRef.current) return;
    const bearing = mapRef.current.getBearing();
    const snapped = normalizeBearing(bearing);
    const newBearing = (snapped + 90) % 360;
    mapRef.current.easeTo({ bearing: newBearing, duration: 500 });
  };

  const toggleStreetView = () => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const currentPitch = map.getPitch();
    if (currentPitch === 0) {
      map.easeTo({
        pitch: 65,
        bearing: 180,
        duration: 1000,
        zoom: map.getZoom() + 1,
      });
    } else {
      map.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 1000,
        zoom: map.getZoom() - 1,
      });
    }
  };

  const getCenter = () => {
    if (!mapRef.current) return null;
    const c = mapRef.current.getCenter();
    return [c.lng, c.lat];
  };



    const confirmLocation = (coords: [number, number]) => {
      if (!mapRef.current) return;
      const [lat, lng] = coords;
      mapRef.current.flyTo({ center: [lng, lat], zoom: 20 });
      localStorage.setItem("selectedAddress", JSON.stringify({ lat, lng }));
    };

    const searchAddress = (address: string) => {
      if (!mapRef.current) return;
      fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          address
        )}.json?access_token=${mapboxgl.accessToken}`
      )
        .then((r) => r.json())
        .then((data) => {
          if (data.features?.length > 0) {
            const coords = data.features[0].center as [number, number];
            mapRef.current?.flyTo({ center: coords, zoom: 19 });
          }
        })
        .catch((err) => console.warn("geocode error", err));
    };

    const getMapCanvasDataURL = () => {
      try {
        const canvas = mapRef.current?.getCanvas();
        if (!canvas) return null;
        return canvas.toDataURL("image/png");
      } catch {
        return null;
      }
    };


  return {
    updateMeasurements,
    undo,
    redo,
    startSplitMode,
    handleLineForSplit,
    applyOverhang,
    startDrawing,
    deleteAll,
    setDrawMode,
    rotateLeft,
    rotateRight,
    toggleStreetView,
    getCenter,
  };
};
