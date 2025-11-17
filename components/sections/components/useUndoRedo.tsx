// // hooks/useUndoRedo.tsx
// import { useCallback, useEffect, useState, useRef } from "react";
// import mapboxgl from "mapbox-gl";
// import * as turf from "@turf/turf";
// import { EdgeItem, PolygonPoint } from "./MapContainer";
// import { toFeetInches, normalizeBearing } from "./mapHelper";

// interface UndoRedoHookProps {
//   drawRef: any;
//   mapRef: any;
//   labelsRef: any;
//   awaitingSplitRef?: any;
//   setPlanAreaLocal: (value: number) => void;
//   setRoofAreaLocal: (value: number) => void;
//   setEdgesLocal: (v: EdgeItem[]) => void;
//   undoStackRef: any;
//   redoStackRef: any;
//   clearLabels: () => void;
//   setShowGrid?: (value: boolean) => void;
//   onGridToggle?: (value: boolean) => void;
//   onMeasurementsChange: (data: {
//     edges: EdgeItem[];
//     planArea: number;
//     roofArea: number;
//     polygonPoints: PolygonPoint[];
//     polygonAreas: Record<string, number>;
//   }) => void;
//   onBearingChange?: (bearing: number) => void;
//   setCurrentBearing: (bearing: number) => void;
//   setPolygonEdgesMap?: (updater: (prev: any) => any) => void;
//   labelsVisible?: boolean;
// }

// export const useUndoRedo = ({
//   drawRef,
//   mapRef,
//   labelsRef,
//   setPlanAreaLocal,
//   setRoofAreaLocal,
//   setEdgesLocal,
//   undoStackRef,
//   redoStackRef,
//   clearLabels,
//   onMeasurementsChange,
//   setPolygonEdgesMap,
//   labelsVisible = true,
// }: UndoRedoHookProps) => {
//   const [drawMode, setDrawModeState] = useState<string>("");
//   const edgeLabelsRef = useRef<Record<string, mapboxgl.Marker>>({});

//   // ---------------- EDGE LABELS ----------------
//   const updateEdgeLabels = useCallback(
//     (feature: any) => {
//       if (!mapRef.current) return;
//       const map = mapRef.current;

//       const coords =
//         feature.geometry.type === "Polygon"
//           ? feature.geometry.coordinates[0]
//           : feature.geometry.coordinates;

//       const uniqueCoords = coords.filter(
//         (v: any, i: number, a: any[]) =>
//           i === 0 || v.toString() !== a[i - 1].toString()
//       );

//       // Remove old labels for this feature
//       Object.keys(edgeLabelsRef.current).forEach((key) => {
//         if (key.startsWith(feature.id)) {
//           edgeLabelsRef.current[key].remove();
//           delete edgeLabelsRef.current[key];
//         }
//       });

//       if (uniqueCoords.length < 2) return;

//       for (let i = 0; i < uniqueCoords.length - 1; i++) {
//         const from = turf.point(uniqueCoords[i]);
//         const to = turf.point(uniqueCoords[i + 1]);
//         const lengthFeet = turf.distance(from, to, { units: "feet" });
//         const midpoint = turf.midpoint(from, to).geometry.coordinates as [
//           number,
//           number
//         ];

//         const el = document.createElement("div");
//         el.innerText = toFeetInches(lengthFeet);
//         Object.assign(el.style, {
//           background: "rgba(255,255,255,0.95)",
//           color: "black",
//           fontSize: "10px",
//           fontWeight: "600",
//           padding: "2px 4px",
//           borderRadius: "4px",
//           boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
//           whiteSpace: "nowrap",
//           pointerEvents: "none",
//           border: "1px solid rgba(0,0,0,0.1)",
//           textAlign: "center",
//         });

//         const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
//           .setLngLat(midpoint)
//           .addTo(map);

//         edgeLabelsRef.current[`${feature.id}_${i}`] = marker;
//       }
//     },
//     [mapRef]
//   );

//   // ---------------- MEASUREMENTS ----------------
//   const updateMeasurements = useCallback(() => {
//     if (!drawRef.current || !mapRef.current) return;
//     try {
//       const data = drawRef.current.getAll();
//       const map = mapRef.current;

//       // Remove all old labels
//       Object.values(edgeLabelsRef.current).forEach((m) => m.remove());
//       edgeLabelsRef.current = {};

//       if (!data?.features?.length) {
//         setPlanAreaLocal(0);
//         setRoofAreaLocal(0);
//         setEdgesLocal([]);
//         onMeasurementsChange({
//           edges: [],
//           planArea: 0,
//           roofArea: 0,
//           polygonPoints: [],
//           polygonAreas: {},
//         });
//         return;
//       }

//       const allEdges: EdgeItem[] = [];
//       const polygonPointsAcc: PolygonPoint[] = [];
//       const polygonAreas: Record<string, number> = {};
//       let totalAreaMeters = 0;

//       data.features.forEach((feature: any) => {
//         if (!feature.geometry) return;

//         const coords =
//           feature.geometry.type === "Polygon"
//             ? feature.geometry.coordinates[0]
//             : feature.geometry.coordinates;

//         const uniqueCoords = coords.filter(
//           (coord, idx) =>
//             idx === 0 ||
//             coord[0] !== coords[idx - 1][0] ||
//             coord[1] !== coords[idx - 1][1]
//         );

//         // ---------------- EDGE LABELS ----------------
//         updateEdgeLabels(feature);

//         // ---------------- EDGES DATA ----------------
//         if (uniqueCoords.length >= 2) {
//           for (let i = 0; i < uniqueCoords.length - 1; i++) {
//             const from = uniqueCoords[i];
//             const to = uniqueCoords[i + 1];
//             const lengthFeet = turf.distance(turf.point(from), turf.point(to), {
//               units: "feet",
//             });

//             allEdges.push({
//               from: { lat: from[1], lon: from[0] },
//               to: { lat: to[1], lon: to[0] },
//               lengthFeet,
//             });
//           }
//         }

//         // ---------------- AREA ----------------
//         if (feature.geometry.type === "Polygon") {
//           const areaSqMeters = turf.area(feature);
//           totalAreaMeters += areaSqMeters;
//           polygonAreas[feature.id] = areaSqMeters * 10.7639;
//         }
//       });

//       const totalAreaSqFt = totalAreaMeters * 10.7639;
//       setPlanAreaLocal(totalAreaSqFt);
//       setRoofAreaLocal(totalAreaSqFt);
//       setEdgesLocal(allEdges);

//       onMeasurementsChange({
//         edges: allEdges,
//         planArea: totalAreaSqFt,
//         roofArea: totalAreaSqFt,
//         polygonPoints: polygonPointsAcc,
//         polygonAreas,
//       });
//     } catch (err) {
//       console.warn("updateMeasurements error", err);
//     }
//   }, [
//     drawRef,
//     mapRef,
//     setPlanAreaLocal,
//     setRoofAreaLocal,
//     setEdgesLocal,
//     onMeasurementsChange,
//     updateEdgeLabels,
//   ]);

//   // ---------------- MAP EVENTS ----------------
//   useEffect(() => {
//     if (!drawRef.current || !mapRef.current) return;
//     const draw = drawRef.current;
//     const map = mapRef.current;

//     const onUpdate = () => updateMeasurements();

//     map.on("draw.create", onUpdate);
//     map.on("draw.update", onUpdate);
//     map.on("draw.delete", onUpdate);

//     return () => {
//       map.off("draw.create", onUpdate);
//       map.off("draw.update", onUpdate);
//       map.off("draw.delete", onUpdate);
//     };
//   }, [drawRef, mapRef, updateMeasurements]);

//   // ---------------- UNDO / REDO ----------------
//   const undo = () => {
//     if (!drawRef.current || !undoStackRef.current.length) return;
//     const last = undoStackRef.current.pop();
//     clearLabels();
//     if (last?.features) last.features.forEach((f: any) => drawRef.current.add(f));
//     updateMeasurements();
//   };

//   const redo = () => {
//     if (!drawRef.current || !redoStackRef.current.length) return;
//     const next = redoStackRef.current.pop();
//     clearLabels();
//     if (next?.features) next.features.forEach((f: any) => drawRef.current.add(f));
//     updateMeasurements();
//   };

//   // ---------------- MAP ACTIONS ----------------
//   const startDrawing = () => drawRef.current?.changeMode("draw_polygon");
//   const startSingleDrawing = () => drawRef.current?.changeMode("draw_line_string");

//   const setDrawMode = (mode: string) => {
//     try {
//       drawRef.current?.changeMode(mode as any);
//     } catch (err) {
//       console.warn("setDrawMode error", err);
//     }
//   };

//   // ---------------- MAP ROTATION ----------------
//   const rotateLeft = () => {
//     if (!mapRef.current) return;
//     const bearing = mapRef.current.getBearing();
//     const snapped = normalizeBearing(bearing);
//     const newBearing = (snapped - 90 + 360) % 360;
//     mapRef.current.easeTo({ bearing: newBearing, duration: 500 });
//   };

//   const rotateRight = () => {
//     if (!mapRef.current) return;
//     const bearing = mapRef.current.getBearing();
//     const snapped = normalizeBearing(bearing);
//     const newBearing = (snapped + 90) % 360;
//     mapRef.current.easeTo({ bearing: newBearing, duration: 500 });
//   };

//   const toggleStreetView = () => {
//     if (!mapRef.current) return;
//     const map = mapRef.current;
//     const currentPitch = map.getPitch();
//     if (currentPitch === 0) {
//       map.easeTo({
//         pitch: 65,
//         bearing: 180,
//         duration: 1000,
//         zoom: map.getZoom() + 1,
//       });
//     } else {
//       map.easeTo({
//         pitch: 0,
//         bearing: 0,
//         duration: 1000,
//         zoom: map.getZoom() - 1,
//       });
//     }
//   };

//   const getCenter = () => {
//     if (!mapRef.current) return null;
//     const c = mapRef.current.getCenter();
//     return [c.lng, c.lat];
//   };

//   const confirmLocation = (coords: [number, number]) => {
//     if (!mapRef.current) return;
//     const [lat, lng] = coords;
//     mapRef.current.flyTo({ center: [lng, lat], zoom: 20 });
//     localStorage.setItem("selectedAddress", JSON.stringify({ lat, lng }));
//   };

//   return {
//     updateMeasurements,
//     undo,
//     redo,
//     startDrawing,
//     startSingleDrawing,
//     setDrawMode,
//     rotateLeft,
//     rotateRight,
//     toggleStreetView,
//     getCenter,
//     confirmLocation,
//   };
// };
