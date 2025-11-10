// hooks/useUndoRedo.tsx
import { useCallback, useState } from "react";
import mapboxgl from "mapbox-gl";
import * as turf from "@turf/turf";
import { EdgeItem, PolygonPoint } from "./MapContainer";
import { toFeetInches, normalizeBearing } from "./mapHelper";

interface UndoRedoHookProps {
  drawRef: any;
  mapRef: any;
  labelsRef: any;
  awaitingSplitRef: any;
  setPlanAreaLocal: (value: number) => void;
  setRoofAreaLocal: (value: number) => void;
  setEdgesLocal: (v: EdgeItem[]) => void;
  undoStackRef: any;
  redoStackRef: any;
  clearLabels: () => void;
  setShowGrid: (value: boolean) => void;
  onGridToggle?: (value: boolean) => void;
  onMeasurementsChange: (data: {
    edges: EdgeItem[];
    planArea: number;
    roofArea: number;
    polygonPoints: PolygonPoint[];
    polygonAreas: Record<string, number>;
  }) => void;
  onBearingChange?: (bearing: number) => void;
  setCurrentBearing: (bearing: number) => void;
  setPolygonEdgesMap?: (updater: (prev: any) => any) => void;
  labelsVisible?: boolean;
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
  labelsVisible = true,
}: UndoRedoHookProps) => {
  const [drawMode, setDrawModeState] = useState<string>("");

  // ---------------- UPDATE MEASUREMENTS ----------------
  const updateMeasurements = useCallback(() => {
    if (!drawRef.current || !mapRef.current) return;
    try {
      const data = drawRef.current.getAll();

      // ✅ Clear labels upfront; rebuild if visible
      clearLabels();

      if (!data || !data.features || data.features.length === 0) {
        setPlanAreaLocal(0);
        setRoofAreaLocal(0);
        setEdgesLocal([]);
        onMeasurementsChange({
          edges: [],
          planArea: 0,
          roofArea: 0,
          polygonPoints: [],
          polygonAreas: {},
        });
        return;
      }

      const map = mapRef.current;
      if (map && !map.__bearingListenerAdded) {
        map.__bearingListenerAdded = true;
        map.on("rotate", () => {
          const bearing = map.getBearing();
          setCurrentBearing(bearing);
          onBearingChange?.(bearing);
        });
      }

      const allEdges: EdgeItem[] = [];
      let totalAreaMeters = 0;
      const polygonPointsAcc: PolygonPoint[] = [];
      const polygonAreas: Record<string, number> = {};

      data.features.forEach((feature: any, fIndex: number) => {
        if (!feature.geometry) return;
        if (feature.geometry.type === "Polygon") {
          const coords: number[][] = feature.geometry.coordinates[0];
          let areaSqMeters = 0;
          // Check if it's a single line polygon (3 coords, first and last same, or has our flag)
          let isSingleLine = feature.properties?.isSingleLine || false;
          try {
            if (!isSingleLine && coords.length === 3 && JSON.stringify(coords[0]) === JSON.stringify(coords[2])) {
              isSingleLine = true;
              areaSqMeters = 0; // No area for line
            } else {
              areaSqMeters = turf.area(feature);
            }
          } catch {
            areaSqMeters = 0;
          }
          totalAreaMeters += areaSqMeters;

          const areaSqFt = areaSqMeters * 10.7639;

          // ✅ For single-line, calculate length directly from unique coordinates
          let lineLengthFeet = 0;
          let perimeterFeet = 0;
          
          if (isSingleLine) {
            // Get unique coordinates (excluding duplicates)
            const uniqueCoords = coords.filter((coord, idx) => {
              if (idx === 0) return true;
              const prev = coords[idx - 1];
              return !(coord[0] === prev[0] && coord[1] === prev[1]);
            });
            
            // Calculate length from first to last unique point using lat/lng
            if (uniqueCoords.length >= 2) {
              const from = turf.point([uniqueCoords[0][0], uniqueCoords[0][1]]);
              const to = turf.point([uniqueCoords[uniqueCoords.length - 1][0], uniqueCoords[uniqueCoords.length - 1][1]]);
              // Calculate distance in feet from coordinates
              lineLengthFeet = turf.distance(from, to, { units: "feet" });
              
              // Add polygon points
              uniqueCoords.forEach((c, i) => {
                polygonPointsAcc.push({ lat: c[1], lon: c[0], seq: i + 1 });
              });
            }
          
          
          } else {
            // Regular polygon - calculate perimeter and edge labels
            coords.forEach((c, i) => {
              if (i < coords.length - 1) {
                const from = turf.point(c);
                const to = turf.point(coords[i + 1]);
                const lengthFeet = turf.distance(from, to, { units: "feet" });
                perimeterFeet += lengthFeet;
                if (labelsVisible) {
                  // ✅ Calculate edge angle for label rotation
                  const edgeAngle = Math.atan2(
                    coords[i + 1][1] - coords[i][1],
                    coords[i + 1][0] - coords[i][0]
                  );

                  // ✅ Get midpoint of edge (directly on the line)
                  const midpoint = turf.midpoint(from, to).geometry.coordinates as [
                    number,
                    number
                  ];

                  // ✅ Calculate label position along the edge with dynamic offset for overlaps
                  let labelPosition = midpoint;
                  let offsetAlongEdge = 0; // Offset along the line (0 = midpoint)

                  // ✅ Check for overlapping labels and adjust position along the edge
                  const existingMarkers = labelsRef.current;
                  const overlapThreshold = 0.0003; // ~30 meters in degrees

                  for (const existingMarker of existingMarkers) {
                    const existingLngLat = existingMarker.getLngLat();
                    const distance = turf.distance(
                      turf.point([midpoint[0], midpoint[1]]),
                      turf.point([existingLngLat.lng, existingLngLat.lat]),
                      { units: "kilometers" }
                    );

                    // If labels are too close, offset this label along the edge
                    if (distance < overlapThreshold) {
                      // Try offsetting along the edge in both directions
                      const offsetDistance = 0.00005; // Small offset in degrees
                      const offset1 = offsetAlongEdge + offsetDistance;
                      const offset2 = offsetAlongEdge - offsetDistance;

                      // Calculate positions along the edge
                      const edgeLength = lengthFeet * 0.000001; // Approximate conversion
                      const offset1Pos = [
                        midpoint[0] + Math.cos(edgeAngle) * offset1,
                        midpoint[1] + Math.sin(edgeAngle) * offset1,
                      ] as [number, number];

                      // Check if offset position is better (farther from other labels)
                      const dist1 = turf.distance(
                        turf.point(offset1Pos),
                        turf.point([existingLngLat.lng, existingLngLat.lat]),
                        { units: "kilometers" }
                      );

                      if (dist1 > distance) {
                        labelPosition = offset1Pos;
                        offsetAlongEdge = offset1;
                      } else {
                        // Try opposite direction
                        const offset2Pos = [
                          midpoint[0] + Math.cos(edgeAngle) * offset2,
                          midpoint[1] + Math.sin(edgeAngle) * offset2,
                        ] as [number, number];

                        const dist2 = turf.distance(
                          turf.point(offset2Pos),
                          turf.point([existingLngLat.lng, existingLngLat.lat]),
                          { units: "kilometers" }
                        );

                        if (dist2 > distance) {
                          labelPosition = offset2Pos;
                          offsetAlongEdge = offset2;
                        }
                      }
                    }
                  }

                  // ✅ Create label element - keep horizontal (no rotation)
                  const el = document.createElement("div");
                  el.innerText = toFeetInches(lengthFeet);

                  // ✅ Smaller font size for better readability
                  // ✅ Labels stay horizontal regardless of edge angle
                  Object.assign(el.style, {
                    background: "rgba(255, 255, 255, 0.95)",
                    color: "black",
                    padding: "2px 4px",
                    fontSize: "10px", // ✅ Reduced from 12px
                    borderRadius: "4px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
                    fontWeight: "600",
                    whiteSpace: "nowrap",
                    // ✅ No rotation - keep labels horizontal
                    transform: "none",
                    border: "1px solid rgba(0,0,0,0.1)",
                    pointerEvents: "none", // Prevent label from intercepting clicks
                  });

                  const marker = new mapboxgl.Marker({
                    element: el,
                    anchor: "center",
                    rotationAlignment: "map",
                  })
                    .setLngLat(labelPosition)
                    .addTo(mapRef.current!);
                  labelsRef.current.push(marker);
                }
              }
              polygonPointsAcc.push({ lat: c[1], lon: c[0], seq: i + 1 });
            });
          }

          if (feature.id) {
            polygonAreas[feature.id] = isSingleLine ? lineLengthFeet : areaSqFt;
          }

          //  Center label - show area or length for single-line (only if labelsVisible)
          if (labelsVisible) {
            try {
              let center: [number, number] | null = null;
              if (isSingleLine) {
                const uniqueCoords = coords.filter((coord, idx) => {
                  if (idx === 0) return true;
                  const prev = coords[idx - 1];
                  return !(coord[0] === prev[0] && coord[1] === prev[1]);
                });
                if (uniqueCoords.length >= 2) {
                  center = turf
                    .midpoint(
                      turf.point(uniqueCoords[0]),
                      turf.point(uniqueCoords[uniqueCoords.length - 1])
                    )
                    .geometry.coordinates as [number, number];
                } else if (coords.length) {
                  center = coords[0] as [number, number];
                }
             
             
              } else {
                center = turf.centerOfMass(feature).geometry
                  .coordinates as [number, number];
              }

              if (!center) return;

              // ✅ Get roof type label from feature properties (if assigned)
              const roofTypeLabel = feature.properties?.label || null;

              let labelText = "";
              let measurementText = "";
              if (isSingleLine) {
                // For single-line, show length instead of area
                measurementText = toFeetInches(lineLengthFeet);
                labelText = measurementText;
                if (roofTypeLabel) {
                  labelText = `${roofTypeLabel}\n${measurementText}`;
                }
             
             
              } else {
                // ✅ Calculate area for this polygon
                measurementText = Math.round(areaSqFt) + " sqft";
                labelText = measurementText;
                if (roofTypeLabel) {
                  // ✅ Format: "Ridge\n1200 sqft"
                  labelText = `${roofTypeLabel}\n${measurementText}`;
                }
              }

              const centerKey = `${center[0].toFixed(6)},${center[1].toFixed(
                6
              )}`;
              const div = document.createElement("div");
              if (roofTypeLabel) {
                // ✅ Use HTML for better styling control
                div.innerHTML = `<span style="font-size: 9px; font-weight: 600; color: #555; display: block; margin-bottom: 2px;">${roofTypeLabel}</span><span style="font-size: 11px;">${measurementText}</span>`;
              } else {
                div.innerText = labelText;
              }
              Object.assign(div.style, {
                background: "rgba(255, 255, 255, 0.95)",
                color: "black",
                padding: "4px 6px",
                fontSize: roofTypeLabel ? "10px" : "11px",
                borderRadius: "6px",
                boxShadow: "0 0 4px rgba(0,0,0,0.35)",
                fontWeight: "700",
                whiteSpace: "pre-line",
                textAlign: "center",
                border: "1px solid rgba(0,0,0,0.1)",
                lineHeight: roofTypeLabel ? "1.2" : "1.4",
              });
              const marker = new mapboxgl.Marker({
                element: div,
                anchor: "center",
              })
                .setLngLat(center)
                .addTo(mapRef.current!);
              labelsRef.current.push(marker);
            } catch (e) {}
          }
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
        polygonAreas,
      });
    } catch (err) {
      console.warn("updateMeasurements error", err);
    }
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
    labelsVisible,
  ]);

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

  // ---------------- UNDO / REDO ----------------
  const restoreSnapshot = (snapshot: any) => {
    if (!drawRef.current || !mapRef.current) return;
    try {
      // Clear all current features
      drawRef.current.deleteAll();

      // Clear all labels
      clearLabels();

      // Clear all custom layers and sources from map
      const map = mapRef.current;
      const existingLayers = map.getStyle().layers || [];
      existingLayers.forEach((layer: any) => {
        if (
          layer.id &&
          (layer.id.includes("custom-line-layer-") ||
            layer.id.includes("-edge-"))
        ) {
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
                  [coords[i + 1][0], coords[i + 1][1]] as [number, number],
                ],
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
                    paint: { "line-color": color, "line-width": 3 },
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
      // This prevents label blinking and respects labelsVisible state
      // ✅ Ensure labels and titles are properly restored (including center labels with roof type names)
      requestAnimationFrame(() => {
        updateMeasurements();
        // ✅ Force a second update after a brief delay to ensure all labels are restored correctly
        setTimeout(() => {
          updateMeasurements();
        }, 100);
      });
    } catch (err) {
      console.warn("restoreSnapshot error", err);
    }
  };

  // ---------------- MAP ACTIONS ----------------
  const startDrawing = () => {
    drawRef.current?.changeMode("draw_polygon");
    setShowGrid(true);
    onGridToggle?.(true);
  };

  const startSingleDrawing = () => {
    drawRef.current?.changeMode("draw_line_string");
    setShowGrid(true);
    onGridToggle?.(true);
  };



  const deleteAll = () => {
    try {
      const snap = drawRef.current?.getAll();
      if (snap) undoStackRef.current.push(JSON.parse(JSON.stringify(snap)));
      if (setPolygonEdgesMap) {
        setPolygonEdgesMap(() => ({}));
      }
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
    updateMeasurements: updateMeasurements,
    undo,
    redo,
    startDrawing,
    startSingleDrawing,
    deleteAll,
    setDrawMode,
    rotateLeft,
    rotateRight,
    toggleStreetView,
    getCenter,
    confirmLocation,
  };
};
