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

  // ✅ NEW: Runtime state for polygons/lines
  const [polygonsData, setPolygonsData] = useState<any[]>([]);
  const [linesData, setLinesData] = useState<any[]>([]);

  // --- Utility Functions ---
  const toFeetInches = (meters: number) => {
    const ft = meters * 3.28084;
    const feet = Math.floor(ft);
    const inches = Math.round((ft - feet) * 12);
    if (inches >= 12) return `${feet + 1}'0"`;
    return `${feet}'${inches}"`;
  };


  const pushHistory = (type: HistoryState["type"]) => {
    if (!drawRef.current) return;
    const allFeatures = drawRef.current.getAll();
    setHistory((prev) => [...prev, { type, features: allFeatures.features }]);
    setRedoStack([]);
  };

  // --- Update Shape State (Edges + Measurements) ---
 const updateShapesData = useCallback(() => {
    if (!drawRef.current) return;
    const allFeatures = drawRef.current.getAll().features;

    const newPolygons: any[] = [];
    allFeatures.forEach((feature) => {
      if (feature.geometry.type === "Polygon") {
        const coords = feature.geometry.coordinates[0];
        const edges = coords.map((coord: any, i: number, arr: any[]) => {
          if (!arr[i + 1]) return null;
          const start = arr[i];
          const end = arr[i + 1];
          const lenMeters = turf.length(turf.lineString([start, end]), { units: "meters" });
          return {
            start,
            end,
            lengthMeters: lenMeters,
            color: feature.properties?.customColor || "#FFD700",
          };
        }).filter(Boolean);

        newPolygons.push({
          id: feature.id,
          edges,
        });
      }
    });

    setPolygonsData(newPolygons);
  }, []);

  // --- Label Functions ---
  const updateLabelPositions = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    Object.keys(labelElementsRef.current).forEach(key => {
      const el = labelElementsRef.current[key];
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

// useMapboxFunctions ke andar, updateEdgeLabels function mein yeh changes hain:

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

        // 1. Feature ka custom color nikalna
        const featureColor = feature.properties?.customColor || "#FFD700"; // Default color

        const coords = feature.geometry.type === "Polygon"
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
              z-index: 1000;
            `;
            map.getContainer().appendChild(el);
            labelElementsRef.current[key] = el;
          }

          // 2. Label ka border color edge color se match karega
          el.style.border = `3px solid ${featureColor}`;

          el.innerText = toFeetInches(lenMeters);
        }
      });

      Object.keys(labelElementsRef.current).forEach(key => {
        if (!currentLabelKeys.has(key)) {
          labelElementsRef.current[key].remove();
          delete labelElementsRef.current[key];
        }
      });

      updateLabelPositions();
    },
    [labelsVisible, updateLabelPositions]
  );

  const handleDrawChange = useCallback((e: any) => {
    if (!drawRef.current) return;
    if (e.type === "draw.create" || e.type === "draw.update") {
      pushHistory(e.type === "draw.create" ? "create" : "update");
      const latestFeature = e.features[0];
      if (latestFeature?.id) {
        setSelectedFeature(String(latestFeature.id));
        updateEdgeLabels(true);
        updateShapesData(); // ✅ Save state after every draw/update
      }
    }
  }, [updateEdgeLabels, updateShapesData]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      zoom: 16,
    });

    mapRef.current = map;
    
const draw = new MapboxDraw({
  displayControlsDefault: false,
  styles: [
    {
      id: "gl-draw-polygon-stroke",
      type: "line",
      filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": ["coalesce", ["get", "customColor"], "#FFD700"], "line-width": 4 },
    },
    {
      id: "gl-draw-line",
      type: "line",
      filter: ["all", ["==", "$type", "LineString"], ["!=", "mode", "static"]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": ["coalesce", ["get", "customColor"], "#FFD700"], "line-width": 4 },
    },
    {
      id: "gl-draw-polygon-midpoint",
      type: "circle",
      filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
      paint: {
        "circle-radius": 5,
        "circle-color": "#FFD700",
        "circle-opacity": 1,
      },
    },
    {
      id: "gl-draw-polygon-vertex-active",
      type: "circle",
      filter: ["all", ["==", "$type", "Point"], ["==", "meta", "vertex"]],
      paint: {
        "circle-radius": 5,
        "circle-color": "#FFFFFF",
        "circle-stroke-color": "#000000",
        "circle-stroke-width": 1,
      },
    },
  ],
});



    drawRef.current = draw;
    map.addControl(draw);

    map.on("load", () => {
      const savedAddress = localStorage.getItem("projectLocation");
      if (savedAddress) {
        const addr = JSON.parse(savedAddress);
        if (addr.lng && addr.lat) {
          map.setCenter([addr.lng, addr.lat]);
          map.setZoom(18);
        }
      }
    });

    map.on("draw.create", handleDrawChange);
    map.on("draw.update", handleDrawChange);
    map.on("render", updateLabelPositions);

    return () => {
      map.off("render", updateLabelPositions);
    };
  }, [handleDrawChange, updateEdgeLabels, updateLabelPositions]);



  useEffect(() => {
  if (!drawRef.current || !mapRef.current) return;

  const map = mapRef.current;
  const draw = drawRef.current;

  const handleSelectionChange = (e: any) => {
    if (e.features.length > 0) {
      setSelectedFeature(e.features[0].id);
    } else {
      setSelectedFeature(null);
    }
  };

  map.on("draw.selectionchange", handleSelectionChange);

  return () => {
    map.off("draw.selectionchange", handleSelectionChange);
  };
}, []);



  const drawPolygon = () => drawRef.current?.changeMode("draw_polygon");
  const drawLine = () => drawRef.current?.changeMode("draw_line_string");

  const deleteFeature = () => {
    if (!drawRef.current) return;
    const selected = drawRef.current.getSelectedIds();
    if (!selected.length) return;
    drawRef.current.delete(selected);
    pushHistory("delete");
    updateEdgeLabels();
    updateShapesData(); // ✅ Save state after delete
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
    updateShapesData(); // ✅ Save state after undo
  };

  const redo = () => {
    if (!drawRef.current || !redoStack.length) return;
    const lastRedo = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setHistory((prev) => [...prev, lastRedo]);
    drawRef.current.deleteAll();
    lastRedo.features.forEach((f) => drawRef.current?.add(f));
    updateEdgeLabels();
    updateShapesData(); // ✅ Save state after redo
  };

  const rotateLeft = () => mapRef.current?.rotateTo((mapRef.current.getBearing() || 0) - 15);
  const rotateRight = () => mapRef.current?.rotateTo((mapRef.current.getBearing() || 0) + 15);

// useMapboxFunctions ke andar, applyColorToSelectedFeature function ko change karein:

const applyColorToSelectedFeature = useCallback(
  (color: string) => {
    if (!drawRef.current || !selectedFeature) return;

    // 1. MapboxDraw ka built-in method property set karne ke liye
    // Yeh Mapbox GL JS ke rendering ko trigger karega (polygon/line color change)
    drawRef.current.setFeatureProperty(selectedFeature, "customColor", color);

    // 2. Custom Labels aur Shapes data ko update karna
    // Taa'ke aapke polygonsData state mein bhi naya color save ho jaye (agar zaroorat ho)
    // Aur edges/labels update ho saken agar aap unmein yeh color use kar rahe hain
    updateShapesData(); // Naya color 'polygonsData' mein save hoga
    updateEdgeLabels(labelsVisible); // Labels ki position aur data refresh karein (agar label mein color dikhana ho)
  },
  [selectedFeature, updateEdgeLabels, labelsVisible, updateShapesData]
);



  const toggleLabels = () => {
    setLabelsVisible((prev) => !prev);
    updateEdgeLabels(!labelsVisible);
  };

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
    polygonsData, // ✅ Runtime data for polygons
    linesData, // ✅ Runtime data for lines
    toFeetInches,
  };
}
