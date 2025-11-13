"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import * as turf from "@turf/turf";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface HistoryState {
  type: "create" | "delete" | "update";
  features: any[];
}

export function useMapboxFunctions() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);

  const [history, setHistory] = useState<HistoryState[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryState[]>([]);
  const [labelsVisible, setLabelsVisible] = useState(true);
  const labelElementsRef = useRef<{ [key: string]: HTMLDivElement }>({});
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  // --- Utility Functions ---

  const toFeetInches = (meters: number) => {
    const ft = meters * 3.28084;
    const feet = Math.floor(ft);
    const inches = Math.round((ft - feet) * 12);
    
    if (inches >= 12) {
      return `${feet + 1}'0"`;
    }
    
    return `${feet}'${inches}"`;
  };

  const pushHistory = (type: HistoryState["type"]) => {
    if (!drawRef.current) return;
    const allFeatures = drawRef.current.getAll();
    setHistory((prev) => [...prev, { type, features: allFeatures.features }]);
    setRedoStack([]);
  };

  // --- New: Label Position Updater (Only moves existing labels) ---
  const updateLabelPositions = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    
    // Sirf woh labels update karein jo `labelElementsRef.current` mein hain
    Object.keys(labelElementsRef.current).forEach(key => {
        const el = labelElementsRef.current[key];
        
        // Key se feature aur segment index nikaalna
        const [featureId, segmentIndexStr] = key.split('-');
        const segmentIndex = parseInt(segmentIndexStr);

        const feature = drawRef.current?.get(featureId);
        if (!feature || !el) return;
        
        const coords = feature.geometry.type === "Polygon"
            ? feature.geometry.coordinates[0]
            : feature.geometry.type === "LineString"
            ? feature.geometry.coordinates
            : [];
            
        const start = coords[segmentIndex];
        const end = coords[segmentIndex + 1];
        
        if (start && end) {
            const midpoint = turf.midpoint(turf.point(start), turf.point(end));
            const pos = map.project(midpoint.geometry.coordinates as [number, number]);
            el.style.left = pos.x + "px";
            el.style.top = pos.y + "px";
        }
    });

  }, []);


  // --- Core Label Logic (Handles creation/deletion/text update) ---
  const updateEdgeLabels = useCallback(
    (showLabels: boolean = labelsVisible) => {
      if (!mapRef.current || !drawRef.current) return;
      const map = mapRef.current;
      const draw = drawRef.current;

      if (!showLabels) {
          Object.values(labelElementsRef.current).forEach(el => el.remove());
          labelElementsRef.current = {}; 
          return;
      }
      
      const features = draw.getAll().features;
      const currentLabelKeys = new Set(); 

      features.forEach((feature) => {
        if (!feature) return;
        
        const coords =
          feature.geometry.type === "Polygon"
            ? feature.geometry.coordinates[0]
            : feature.geometry.type === "LineString"
            ? feature.geometry.coordinates
            : [];

        const numSegments = coords.length - (feature.geometry.type === "Polygon" ? 1 : 1);

        for (let i = 0; i < numSegments; i++) {
          const start = coords[i];
          const end = coords[i + 1];
          
          const lenMeters = turf.length(turf.lineString([start, end]), { units: "meters" });
          
          if (lenMeters < 0.01) continue; 

          const key = `${feature.id}-${i}`;
          currentLabelKeys.add(key);
          let el = labelElementsRef.current[key];

          if (!el) {
            // Label exist nahi karta, naya banao
            el = document.createElement("div");
            el.style.cssText = `
              position: absolute;
              background: rgba(255,255,255,0.9);
              padding: 2px 4px;
              border-radius: 3px;
              font-size: 10px;
              font-weight: 600;
              color: black;
              text-align: center;
              pointer-events: none;
              transform: translate(-50%, -50%);
              border: 1px solid #999;
              z-index: 1000; /* Z-index increase kiya gaya hai */
            `;
            map.getContainer().appendChild(el);
            labelElementsRef.current[key] = el;
          }
          
          // Text update karo (distance change hone par)
          el.innerText = toFeetInches(lenMeters);
        }
      });

      // --- Cleanup Loop ---
      Object.keys(labelElementsRef.current).forEach(key => {
          if (!currentLabelKeys.has(key)) {
              labelElementsRef.current[key].remove();
              delete labelElementsRef.current[key];
          }
      });
      
      // Label create/delete/text update hone ke baad positions ko bhi update karein
      updateLabelPositions();

    },
    [labelsVisible, updateLabelPositions]
  );

  // --- Draw Change Handler (Simplified) ---
  const handleDrawChange = useCallback((e: any) => {
    if (!drawRef.current) return;

    if (e.type === "draw.create" || e.type === "draw.update") {
      if (e.features && e.features.length > 0) {
          pushHistory(e.type === "draw.create" ? "create" : "update");
          
          // Sirf labels ko update/re-create karein (positioning map.on("render") par chhod dein)
          updateEdgeLabels(true); 

          if (e.type === "draw.create") {
              const latestFeature = e.features[0];
              if (latestFeature?.id) {
                  setSelectedFeature(String(latestFeature.id));
              }
          }
      }
    }

  }, [updateEdgeLabels]);

  // --- Map and Draw Initialization (FIXED) ---

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [74.3587, 31.5204],
      zoom: 16,
    });

    mapRef.current = map;

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      styles: [
        // ... (Styles) ...
        { id: "gl-draw-polygon-stroke", type: "line", filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]], layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": ["coalesce", ["get", "customColor"], "#FFD700"], "line-width": 4 } },
        { id: "gl-draw-line", type: "line", filter: ["all", ["==", "$type", "LineString"], ["!=", "mode", "static"]], layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": ["coalesce", ["get", "customColor"], "#FFD700"], "line-width": 4 } },
        { id: "gl-draw-polygon-and-line-vertex-handle-active", type: "circle", filter: ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]], paint: { "circle-radius": 6, "circle-color": "#fff", "circle-stroke-color": "#000", "circle-stroke-width": 2 } },
        { id: "gl-draw-polygon-midpoint-handle", type: "circle", filter: ["all", ["==", "meta", "midpoint"]], paint: { "circle-radius": 4, "circle-color": "#fff", "circle-stroke-color": "#000", "circle-stroke-width": 1 } },
      ],
    });

    drawRef.current = draw;
    map.addControl(draw);

    // Update labels on draw actions
    map.on("draw.create", handleDrawChange);
    map.on("draw.update", handleDrawChange);
    
    // ✅ FIX: `map.on("render")` use karein taake har frame par labels reposition hon
    map.on("render", updateLabelPositions);

    return () => {
        map.off("render", updateLabelPositions);
    }

  }, [handleDrawChange, updateEdgeLabels, updateLabelPositions]);
 
 // --- Other Functions (Only relevant parts are shown) ---

  const drawPolygon = () => drawRef.current?.changeMode("draw_polygon");
  const drawLine = () => drawRef.current?.changeMode("draw_line_string");

  const deleteFeature = () => {
    if (!drawRef.current) return;
    const selected = drawRef.current.getSelectedIds();
    if (!selected.length) return;
    drawRef.current.delete(selected);
    pushHistory("delete");
    updateEdgeLabels(); 
    setSelectedFeature(null);
  };

  const undo = () => {
    if (!drawRef.current || !history.length) return;
    const lastAction = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, lastAction]);
    drawRef.current.deleteAll();
    const previous = history[history.length - 2];
    if (previous) previous.features.forEach((f) => drawRef.current?.add(f));
    updateEdgeLabels();
  };

  const redo = () => {
    if (!drawRef.current || !redoStack.length) return;
    const lastRedo = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setHistory((prev) => [...prev, lastRedo]);
    drawRef.current.deleteAll();
    lastRedo.features.forEach((f) => drawRef.current?.add(f));
    updateEdgeLabels();
  };
  
  // ... (rest of the functions like rotateLeft, rotateRight, applyColorToSelectedFeature, calculatePolygonsDataForPDF remain the same) ...
  
  const rotateLeft = () => mapRef.current?.rotateTo((mapRef.current.getBearing() || 0) - 15);
  const rotateRight = () => mapRef.current?.rotateTo((mapRef.current.getBearing() || 0) + 15);

  const applyColorToSelectedFeature = useCallback(
    (color: string) => {
      if (!drawRef.current || !selectedFeature) return;
      drawRef.current.setFeatureProperty(selectedFeature, "customColor", color);
      const feature = drawRef.current.get(selectedFeature);
      if (feature) {
        drawRef.current.delete(selectedFeature);
        drawRef.current.add(feature);
      }
    },
    [selectedFeature]
  );
  
  const toggleLabels = () => {
    setLabelsVisible((prev) => !prev);
    updateEdgeLabels(!labelsVisible);
  };
  
  const calculatePolygonsDataForPDF = useCallback(() => {
    if (!drawRef.current) return { polygons: [], lines: [], totalAreaSqFt: 0 };
    // ... (rest of the PDF calculation logic)
    const allFeatures = drawRef.current.getAll().features;
    let polygonsData: any[] = [];
    let linesData: any[] = [];
    let totalAreaSqFt = 0;

    allFeatures.forEach((feature) => {
      if (feature.geometry.type === "Polygon") {
        const areaMeters = turf.area(feature);
        const areaFeet = areaMeters * 10.7639;
        totalAreaSqFt += areaFeet;

        const edges = feature.geometry.coordinates[0]
          .map((coord: any, i: number, arr: any[]) => {
            if (!arr[i + 1]) return null;
            const start = arr[i];
            const end = arr[i + 1];
            const lenMeters = turf.length(turf.lineString([start, end]), { units: "meters" });
            return {
              label: `Edge ${i + 1}`,
              length: lenMeters * 3.28084,
              color: feature.properties?.customColor || "#FFD700",
            };
          })
          .filter(Boolean);

        polygonsData.push({ name: feature.id, edges, areaSqFt: areaFeet });
      } else if (feature.geometry.type === "LineString") {
        const edges = feature.geometry.coordinates
          .map((coord: any, i: number, arr: any[]) => {
            if (!arr[i + 1]) return null;
            const start = arr[i];
            const end = arr[i + 1];
            const lenMeters = turf.length(turf.lineString([start, end]), { units: "meters" });
            return {
              label: `Segment ${i + 1}`,
              length: lenMeters * 3.28084,
              color: feature.properties?.customColor || "#FFD700",
            };
          })
          .filter(Boolean);

        linesData.push({ name: feature.id, edges });
      }
    });

    return { polygons: polygonsData, lines: linesData, totalAreaSqFt };
  }, []);


  return {
    mapContainerRef,
    drawPolygon,
    drawLine,
    deleteFeature,
    undo,
    redo,
    rotateLeft,
    rotateRight,
    toggleLabels,
    labelsVisible,
    selectedFeature,
    setSelectedFeature,
    applyColorToSelectedFeature,
    calculatePolygonsDataForPDF,
    toFeetInches,
  };
}