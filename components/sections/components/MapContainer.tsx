"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import * as turf from "@turf/turf";
import { useUndoRedo } from "../components/useUndoRedo";
import LeftSidebar from "@/components/common/left-sidebar";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export interface MapSectionHandle {
  startDrawing: () => void;
  startDrawingWithLabel?: (label: { name: string; color: string }) => void;
  deleteAll: () => void;
  deleteSelected: () => void;
  setDrawMode: (mode: string) => void;
  undo: () => void;
  redo: () => void;
  startSplitMode: () => void;
  applyOverhang: () => void;
  confirmLocation: (coords: [number, number]) => void;
  searchAddress: (address: string) => void;
  getMapCanvasDataURL: () => string | undefined;
  rotateLeft: () => void;
  rotateRight: () => void;
  toggleStreetView: () => void;
  getCenter?: () => [number, number] | null;
  getMap?: () => mapboxgl.Map | null;
  downloadPDF?: () => void;
}

export interface EdgeItem {
  id: string;
  length: number;
  type: string;
  polygonId: string;
}

export interface PolygonPoint {
  lat: number;
  lon: number;
  seq: number;
}

interface MapContainerProps {
  initialCenter?: [number, number];
  initialZoom?: number;
  onMeasurementsChange: (payload: {
    edges: EdgeItem[];
    planArea: number;
    roofArea: number;
    polygonPoints: PolygonPoint[];
  }) => void;
  onGridToggle?: (visible: boolean) => void;
  onBearingChange?: (bearing: number) => void;
  onMapLoad?: (map: mapboxgl.Map) => void;
  className?: string;
  selectedLabel?: { name: string; color: string };
}

const MapContainer = forwardRef<MapSectionHandle, MapContainerProps>(
  (
    {
      initialCenter = [-118.2437, 34.0522],
      initialZoom = 18,
      onMeasurementsChange,
      onMapLoad,
      onGridToggle,
      onBearingChange,
      selectedLabel,
    },
    ref
  ) => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const drawRef = useRef<MapboxDraw | null>(null);
    const labelsRef = useRef<mapboxgl.Marker[]>([]);
    const awaitingSplitRef = useRef<boolean>(false);
    const undoStackRef = useRef<any[]>([]);
    const redoStackRef = useRef<any[]>([]);

    const [edgesLocal, setEdgesLocal] = useState<EdgeItem[]>([]);
    const [planAreaLocal, setPlanAreaLocal] = useState<number>(0);
    const [roofAreaLocal, setRoofAreaLocal] = useState<number>(0);
    const [polygonEdges, setPolygonEdges] = useState<
      { id: string; coords: [number, number][] }[]
    >([]);
    const [selectedLabelName, setSelectedLabelName] = useState<string | null>(null);

    const [polygonEdgesMap, setPolygonEdgesMap] = useState<
      Record<string, { id: string; coords: [number, number][] }[]>
    >({});

    const [selectedPolygonId, setSelectedPolygonId] = useState<string | null>(
      null
    );
    const [polygonColors, setPolygonColors] = useState<{
      [key: string]: string;
    }>({});
    
    const [isDrawMode, setIsDrawMode] = useState(false);

    
    const edgeLabels: Record<string, string> = {
      Ridge: "#e74c3c",
      Hip: "#f39c12",
      Valley: "#8e44ad",
      Rake: "#2980b9",
      Eave: "#27ae60",
      Flashing: "#16a085",
      "Step Flashing": "#d35400",
      Transition: "#2c3e50",
    };

    const clearLabels = () => {
      labelsRef.current.forEach((m) => m.remove());
      labelsRef.current = [];
    };

    const {
      updateMeasurements,
      undo,
      redo,
      startSplitMode,
      applyOverhang,
      startDrawing: startDrawingFn,
      deleteAll,
      setDrawMode,
      rotateLeft,
      rotateRight,
      toggleStreetView,
      getCenter,
    } = useUndoRedo({
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
      setShowGrid: () => {},
      onGridToggle,
      onMeasurementsChange,
      onBearingChange,
      setCurrentBearing: () => {},
      setPolygonEdgesMap,
    });

    // ✅ Wrapper for startDrawing to handle grid toggle (on/off)
    const startDrawing = () => {
      const currentMode = drawRef.current?.getMode();
      if (currentMode === "draw_polygon") {
        // If already in draw mode, toggle off - hide grid and go to select mode
        setIsDrawMode(false);
        onGridToggle?.(false);
        drawRef.current?.changeMode("simple_select");
      } else {
        // Toggle on - show grid and start drawing
        setIsDrawMode(true);
        onGridToggle?.(true);
        startDrawingFn();
      }
    };
const applyPolygonColor = (
  feature: any,
  map: mapboxgl.Map,
  color: string
) => {
  const featureId = feature.id;
  const coords = feature.geometry.coordinates[0];

  // 🧹 Clean up old custom layers/sources for this polygon
  const existingLayers = map.getStyle().layers || [];
  existingLayers.forEach((layer: any) => {
    if (layer.id.includes(`custom-line-layer-${featureId}`)) {
      if (map.getLayer(layer.id)) map.removeLayer(layer.id);
    }
  });

  const existingSources = Object.keys(map.getStyle().sources);
  existingSources.forEach((srcId) => {
    if (srcId.includes(`custom-line-${featureId}`)) {
      if (map.getSource(srcId)) map.removeSource(srcId);
    }
  });

  // ✅ Apply color to all edges of polygon
  for (let i = 0; i < coords.length - 1; i++) {
    const edgeId = `custom-line-${featureId}-${i}`;
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
  }
};

    // ====================== USEEFFECT =========================
    useEffect(() => {
      if (!mapContainerRef.current) return;

      // ✅ Default center fallback
      let defaultCenter: [number, number] = [74.3587, 31.5204]; // Lahore
      let defaultZoom = 15;

      // ✅ Check localStorage for saved project location
      const savedProject = localStorage.getItem("projectLocation");
      if (savedProject) {
        try {
          const parsed = JSON.parse(savedProject);
          const { lat, lng } = parsed;
          if (lat && lng) {
            defaultCenter = [lng, lat];
            defaultZoom = 18;
          }
        } catch (err) {
          console.error("Error parsing project location:", err);
        }
      }

      // ✅ Initialize Mapbox
      const mapInstance = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/satellite-streets-v12",
        center: defaultCenter,
        zoom: defaultZoom,
        maxZoom: 22,
        pitch: 0,
        bearing: 0,
      });

      mapRef.current = mapInstance;
      
      // ✅ Call onMapLoad callback with map instance
      onMapLoad?.(mapInstance);

      // ✅ Optional: Add marker for saved project location
      if (savedProject) {
        try {
          const parsed = JSON.parse(savedProject);
          const { lat, lng } = parsed;
          if (lat && lng) {
            new mapboxgl.Marker({ color: "#FF0000" })
              .setLngLat([lng, lat])
              .addTo(mapInstance);
          }
        } catch (err) {
          console.error("Error adding marker:", err);
        }
      }

      // ✅ Mapbox Draw setup (hide default controls to avoid duplicate sidebar)
      const drawInstance = new MapboxDraw({
        displayControlsDefault: false,
        controls: { polygon: false, trash: false, line_string: false, point: false },
        styles: [
          {
            id: "gl-draw-polygon-stroke",
            type: "line",
            filter: [
              "all",
              ["==", "$type", "Polygon"],
              ["!=", "mode", "static"],
            ],
            layout: { "line-cap": "round", "line-join": "round" },
            paint: { "line-color": "yellow", "line-width": 4 },
          },
          {
            id: "gl-draw-line",
            type: "line",
            filter: [
              "all",
              ["==", "$type", "LineString"],
              ["!=", "mode", "static"],
            ],
            layout: { "line-cap": "round", "line-join": "round" },
            paint: { "line-color": "yellow", "line-width": 4 },
          },
          {
            id: "gl-draw-polygon-midpoint",
            type: "circle",
            filter: [
              "all",
              ["==", "$type", "Point"],
              ["==", "meta", "midpoint"],
            ],
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

      drawRef.current = drawInstance;
      mapInstance.addControl(drawInstance);

      // ✅ Draw Create Event (track polygon edges + handle split)
      mapInstance.on("draw.create", (e: any) => {
        const feature = e.features[0];
        if (!feature) return;

        // ✅ Handle split mode - line created for splitting
        if (awaitingSplitRef.current && feature.geometry.type === "LineString") {
          awaitingSplitRef.current = false;
          const allFeatures = drawInstance.getAll();
          const selected = allFeatures.features.find(
            (f: any) => f.id === selectedPolygonId
          );
          
          if (selected && selected.geometry.type === "Polygon" && feature.geometry.type === "LineString") {
            try {
              const splitResult = turf.lineSplit(selected as any, feature as any);
              if (splitResult.features.length > 1) {
                if (selected.id) {
                  drawInstance.delete(selected.id as string);
                }
                splitResult.features.forEach((f: any) => {
                  drawInstance.add(f);
                });
                if (feature.id) {
                  drawInstance.delete(feature.id as string); // Remove the split line
                }
                updateMeasurements();
                return;
              }
            } catch (err) {
              console.warn("Split error:", err);
            }
          }
          // If split failed, just remove the line
          if (feature.id) {
            drawInstance.delete(feature.id as string);
          }
          return;
        }

        // ✅ Handle polygon creation
        if (feature.geometry.type !== "Polygon") return;

        // ✅ Hide grid after drawing complete
        onGridToggle?.(false);

        const coords = feature.geometry.coordinates[0];
        const edges: { id: string; coords: [number, number][] }[] = [];

        for (let i = 0; i < coords.length - 1; i++) {
          const id = `${feature.id}-edge-${i}`;
          edges.push({ id, coords: [coords[i], coords[i + 1]] });

          if (mapInstance.getLayer(id)) mapInstance.removeLayer(id);
          if (mapInstance.getSource(id)) mapInstance.removeSource(id);

          mapInstance.addSource(id, {
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
        }

        // ✅ Save edges in React state
        setPolygonEdgesMap((prev) => ({
          ...prev,
          [feature.id as string]: edges,
        }));

        // ✅ Save snapshot to undo stack for undo/redo
        try {
          const currentSnapshot = drawInstance.getAll();
          undoStackRef.current.push(JSON.parse(JSON.stringify(currentSnapshot)));
          redoStackRef.current = []; // Clear redo stack on new action
        } catch (err) {
          console.warn("Error saving snapshot:", err);
        }

        updateMeasurements();
      });

      // ✅ Draw Delete Event (remove edges + state cleanup)
      mapInstance.on("draw.delete", (e: any) => {
        const deleted = e.features;
        deleted.forEach((feature: any) => {
          const featureId = feature.id;
          
          // ✅ Clean up ALL related layers and sources
          const cleanupFeature = (id: string) => {
            try {
              // Clean up edge-related items
              setPolygonEdgesMap((prev) => {
                const edges = prev[id];
                if (edges) {
                  edges.forEach((edge: any) => {
                    try {
                      if (mapInstance.getLayer(edge.id)) {
                        mapInstance.removeLayer(edge.id);
                      }
                      if (mapInstance.getSource(edge.id)) {
                        mapInstance.removeSource(edge.id);
                      }
                    } catch (err) {
                      console.warn("Edge cleanup error:", err);
                    }
                  });
                }
                const updated = { ...prev };
                delete updated[id];
                return updated;
              });

              // Clean up custom color layers
              const styleLayers = mapInstance.getStyle().layers || [];
              styleLayers.forEach((layer: any) => {
                if (layer.id.includes(`custom-line-layer-${id}`)) {
                  try {
                    if (mapInstance.getLayer(layer.id)) {
                      mapInstance.removeLayer(layer.id);
                    }
                  } catch (err) {
                    console.warn("Layer cleanup error:", err);
                  }
                }
              });

              // Clean up custom sources
              const sources = Object.keys(mapInstance.getStyle().sources);
              sources.forEach((srcId) => {
                if (srcId.includes(`custom-line-${id}`)) {
                  try {
                    if (mapInstance.getSource(srcId)) {
                      mapInstance.removeSource(srcId);
                    }
                  } catch (err) {
                    console.warn("Source cleanup error:", err);
                  }
                }
              });

              // Clean up colors state
              setPolygonColors((prev) => {
                const updated = { ...prev };
                delete updated[id];
                return updated;
              });

              // Reset selection if this was the selected polygon
              if (id === selectedPolygonId) {
                setSelectedPolygonId(null);
              }
            } catch (err) {
              console.warn("Feature cleanup error:", err);
            }
          };

          cleanupFeature(featureId);
        });

        // Force redraw to ensure clean state
        mapInstance.triggerRepaint();

        // ✅ Clear labels and update measurements after delete
        clearLabels();
        updateMeasurements();
      });

      // ✅ Polygon Selection Change - Track selected polygon for delete functionality
      mapInstance.on("draw.selectionchange", (e: any) => {
        const selected = e?.features?.[0];
        if (selected && selected.id && selected.geometry?.type === "Polygon") {
          const featureId = selected.id as string;
          setSelectedPolygonId(featureId);
        } else {
          setSelectedPolygonId(null);
        }
      });


      // ✅ Draw Mode Change - handle edit mode properly
      mapInstance.on("draw.modechange", (e: any) => {
        // When switching to simple_select, ensure we can still move polygons
        if (e.mode === "simple_select") {
          // Allow moving in simple_select mode
        }
        
        // Handle draw mode changes for grid toggle
        if (e.mode === "draw_polygon") {
          setIsDrawMode(true);
          onGridToggle?.(true);
        } else if (e.mode !== "draw_polygon") {
          setIsDrawMode(false);
          onGridToggle?.(false);
        }
      });

    // ✅ Debounce update snapshot saving for undo/redo
    // ✅ This ensures step-by-step undo/redo: saves snapshot before first edit, pushes after user finishes
    let updateSnapshotTimeout: NodeJS.Timeout | null = null;
    let lastUpdateSnapshot: any = null;
    let hasSavedInitialSnapshot = false;

    mapInstance.on("draw.update", (e: any) => {
      const updatedFeature = e.features[0];
      if (!updatedFeature || updatedFeature.geometry.type !== "Polygon") return;

      const color = updatedFeature.properties?.color || "yellow";
      const featureId = updatedFeature.id;

      // ✅ Save snapshot before first update for undo/redo (step-by-step)
      if (!hasSavedInitialSnapshot) {
        try {
          const currentSnapshot = drawInstance.getAll();
          lastUpdateSnapshot = JSON.parse(JSON.stringify(currentSnapshot));
          hasSavedInitialSnapshot = true; // Mark that we've saved the initial state
        } catch (err) {
          console.warn("Error saving snapshot:", err);
        }
      }

      // Clear previous timeout
      if (updateSnapshotTimeout) clearTimeout(updateSnapshotTimeout);

      // ✅ Save snapshot after delay when user finishes editing (step-by-step undo/redo)
      updateSnapshotTimeout = setTimeout(() => {
        if (lastUpdateSnapshot) {
          try {
            // Push the snapshot taken before editing started (allows step-by-step undo)
            undoStackRef.current.push(lastUpdateSnapshot);
            redoStackRef.current = []; // Clear redo stack on new action
            lastUpdateSnapshot = null;
            hasSavedInitialSnapshot = false; // Reset for next edit session
          } catch (err) {
            console.warn("Error pushing snapshot:", err);
          }
        }
      }, 500); // 500ms delay after last update (when user finishes dragging)

      // 🧹 Clean up old custom layers/sources linked with this polygon
      const existingLayers = mapInstance.getStyle().layers || [];
      existingLayers.forEach((layer: any) => {
        if (layer.id.includes(`custom-line-layer-${featureId}`)) {
          if (mapInstance.getLayer(layer.id)) mapInstance.removeLayer(layer.id);
        }
      });

      const existingSources = Object.keys(mapInstance.getStyle().sources);
      existingSources.forEach((srcId) => {
        if (srcId.includes(`custom-line-${featureId}`)) {
          if (mapInstance.getSource(srcId)) mapInstance.removeSource(srcId);
        }
      });

      // ✅ Reapply correct edges after move
      const coords = updatedFeature.geometry.coordinates[0];
      for (let i = 0; i < coords.length - 1; i++) {
        const edgeId = `custom-line-${featureId}-${i}`;
        mapInstance.addSource(edgeId, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: [coords[i], coords[i + 1]] },
          },
        });
        mapInstance.addLayer({
          id: `custom-line-layer-${featureId}-${i}`,
          type: "line",
          source: edgeId,
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": color, "line-width": 5 },
        });
      }

      // ✅ Update edges in state
      const edges: { id: string; coords: [number, number][] }[] = [];
      for (let i = 0; i < coords.length - 1; i++) {
        const id = `${featureId}-edge-${i}`;
        edges.push({ id, coords: [coords[i], coords[i + 1]] });
      }
      setPolygonEdgesMap((prev) => ({
        ...prev,
        [featureId]: edges,
      }));

      // ✅ Update measurements to move labels with polygon
      updateMeasurements();
    });


      mapInstance.on("rotate", () => {
        onBearingChange?.(mapInstance.getBearing());
      });

      return () => {
        mapInstance.remove();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

const handleLabelSelect = (label: { name: string; color: string }) => {
  if (!selectedPolygonId || !mapRef.current || !drawRef.current) return;

  const map = mapRef.current;
  const draw = drawRef.current;
  const feature = draw.get(selectedPolygonId);
  if (!feature) return;

  // ✅ Save snapshot BEFORE label change for undo/redo
  try {
    const currentSnapshot = draw.getAll();
    undoStackRef.current.push(JSON.parse(JSON.stringify(currentSnapshot)));
    redoStackRef.current = []; // Clear redo stack on new action
  } catch (err) {
    console.warn("Error saving snapshot:", err);
  }

  // 🟢 Update feature properties and re-add to draw instance to ensure properties are saved
  // ✅ Get current feature data
  const featureData = {
    ...feature,
    properties: {
      ...feature.properties,
      color: label.color,
      label: label.name,
    },
  };

  // ✅ Remove and re-add feature with updated properties to ensure they're saved properly
  try {
    const featureId = feature.id as string;
    draw.delete(featureId);
    
    // ✅ Add feature back with updated properties
    draw.add(featureData);
    
    // ✅ Re-select the feature after re-adding
    setTimeout(() => {
      try {
        draw.changeMode("simple_select");
        // Note: Feature will be automatically selected after re-adding if it was selected before
      } catch {}
    }, 10);
  } catch (err) {
    console.warn("Error updating feature in draw instance:", err);
    // Fallback: Just update properties directly
    feature.properties = {
      ...feature.properties,
      color: label.color,
      label: label.name,
    };
  }
  
  setPolygonColors((prev) => ({ ...prev, [selectedPolygonId]: label.color }));

  // ✅ Clean up old layers and reapply color after a short delay (after feature is re-added)
  setTimeout(() => {
    const updatedFeature = draw.get(selectedPolygonId);
    if (!updatedFeature) return;

    // ✅ Clean up old custom layers
    const existingLayers = map.getStyle().layers || [];
    existingLayers.forEach((layer: any) => {
      if (layer.id.includes(`custom-line-layer-${selectedPolygonId}`)) {
        try {
          if (map.getLayer(layer.id)) map.removeLayer(layer.id);
        } catch {}
      }
    });

    const existingSources = Object.keys(map.getStyle().sources);
    existingSources.forEach((srcId) => {
      if (srcId.includes(`custom-line-${selectedPolygonId}`)) {
        try {
          if (map.getSource(srcId)) map.removeSource(srcId);
        } catch {}
      }
    });

    // 🟢 Reapply edge color cleanly
    // ✅ If color is yellow, don't add custom layers (default yellow)
    // ✅ If color is not yellow, apply custom color layers
    if (label.color && label.color !== "yellow") {
      applyPolygonColor(updatedFeature, map, label.color);
    }

    // ✅ Update polygonEdgesMap to ensure delete works properly
    if (updatedFeature.geometry.type === "Polygon") {
      const coords = updatedFeature.geometry.coordinates[0];
      const edges: { id: string; coords: [number, number][] }[] = [];
      for (let i = 0; i < coords.length - 1; i++) {
        const id = `${selectedPolygonId}-edge-${i}`;
        edges.push({ 
          id, 
          coords: [
            [coords[i][0], coords[i][1]] as [number, number], 
            [coords[i + 1][0], coords[i + 1][1]] as [number, number]
          ] 
        });
      }
      setPolygonEdgesMap((prev) => ({
        ...prev,
        [selectedPolygonId]: edges,
      }));
    }
  }, 50);

  // ✅ Ensure we stay in simple_select mode to allow moving
  try {
    if (draw) {
      draw.changeMode("simple_select");
    }
  } catch (err) {
    // Mode change might fail if already in that mode, ignore
  }
};

  // ✅ Start drawing with label selected
  const startDrawingWithLabel = (label: { name: string; color: string }) => {
    setSelectedLabelName(label.name);
    setIsDrawMode(true);
    onGridToggle?.(true);
    startDrawingFn();
  };



    // ====================== HELPERS =========================
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
        if (!canvas) return undefined;
        return canvas.toDataURL("image/png");
      } catch {
        return undefined;
      }
    };

    // ✅ Delete Selected Polygon function with enhanced cleanup
    const deleteSelected = () => {
      if (!drawRef.current || !mapRef.current) {
        if (drawRef.current) deleteAll();
        return;
      }
      
      try {
        let polygonToDelete: string | null = null;
        const draw = drawRef.current;
        
        // Enhanced selection detection
        // ✅ Priority 1: Check currently selected features in draw instance
        try {
          const selectedFeatures = draw.getSelected();
          const selectedPolygons = selectedFeatures?.features?.filter(
            (f: any) => f.geometry?.type === "Polygon"
          );
          if (selectedPolygons?.length > 0) {
            polygonToDelete = selectedPolygons[0].id as string;
          }
        } catch {}
        
        // ✅ Priority 2: Use tracked selection state
        if (!polygonToDelete && selectedPolygonId) {
          try {
            const feature = draw.get(selectedPolygonId);
            if (feature?.geometry?.type === "Polygon") {
              polygonToDelete = selectedPolygonId;
            }
          } catch {}
        }
        
        // ✅ Priority 3: Single polygon auto-selection
        if (!polygonToDelete) {
          try {
            const allFeatures = draw.getAll();
            const polygons = allFeatures?.features?.filter(
              (f: any) => f.geometry?.type === "Polygon"
            );
            if (polygons?.length === 1) {
              polygonToDelete = polygons[0].id as string;
            }
          } catch {}
        }

        if (!polygonToDelete) {
          deleteAll();
          return;
        }

        // Save state for undo/redo before deletion
        try {
          const currentSnapshot = draw.getAll();
          undoStackRef.current.push(JSON.parse(JSON.stringify(currentSnapshot)));
          redoStackRef.current = [];
        } catch (err) {
          console.warn("Error saving snapshot:", err);
        }

        // Ensure polygon exists before trying to delete
        const polygonExists = draw.get(polygonToDelete);
        if (!polygonExists) {
          deleteAll();
          return;
        }

        // Pre-cleanup to ensure smooth deletion
        try {
          // Clean up custom styling
          const map = mapRef.current;
          const styleLayers = map.getStyle().layers || [];
          styleLayers.forEach((layer: any) => {
            if (layer.id.includes(`custom-line-layer-${polygonToDelete}`)) {
              try {
                if (map.getLayer(layer.id)) {
                  map.removeLayer(layer.id);
                }
              } catch {}
            }
          });

          // Remove custom sources
          const sources = Object.keys(map.getStyle().sources);
          sources.forEach((srcId) => {
            if (srcId.includes(`custom-line-${polygonToDelete}`)) {
              try {
                if (map.getSource(srcId)) {
                  map.removeSource(srcId);
                }
              } catch {}
            }
          });

          // Clean up edge references
          setPolygonEdgesMap((prev) => {
            const updated = { ...prev };
            delete updated[polygonToDelete!];
            return updated;
          });

          // Clean up color references
          setPolygonColors((prev) => {
            const updated = { ...prev };
            delete updated[polygonToDelete!];
            return updated;
          });
        } catch (err) {
          console.warn("Pre-cleanup error:", err);
        }

        // Perform the actual deletion
        try {
          draw.delete([polygonToDelete]);
          setSelectedPolygonId(null);
          
          // Force a map repaint to ensure clean state
          mapRef.current.triggerRepaint();
        } catch (err) {
          console.error("Primary delete failed:", err);
          try {
            // Fallback: manual cleanup and re-add
            const allFeatures = draw.getAll();
            const remainingFeatures = allFeatures.features.filter(
              (f: any) => f.id !== polygonToDelete
            );
            draw.deleteAll();
            remainingFeatures.forEach((f: any) => draw.add(f));
            setSelectedPolygonId(null);
          } catch {
            deleteAll(); // Last resort
          }
        }

        // Update UI state
        clearLabels();
        updateMeasurements();
      } catch (err) {
        console.error("Delete operation failed:", err);
        deleteAll();
      }
    };

    useImperativeHandle(ref, () => ({
      confirmLocation,
      startDrawing,
      startDrawingWithLabel,
      deleteAll,
      deleteSelected,
      setDrawMode,
      searchAddress,
      undo,
      redo,
      startSplitMode,
      applyOverhang,
      getMapCanvasDataURL,
      rotateLeft,
      rotateRight,
      toggleStreetView,
      getCenter: () => {
        if (!mapRef.current) return null;
        const c = mapRef.current.getCenter();
        return [c.lng, c.lat] as [number, number];
      },
      getMap: () => mapRef.current,
    }));

    return (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
        <LeftSidebar onSelectLabel={handleLabelSelect} />
      </div>
    );
  }
);

MapContainer.displayName = "MapContainer";
export default MapContainer;
