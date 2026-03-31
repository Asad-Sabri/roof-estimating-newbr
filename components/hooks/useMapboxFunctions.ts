// useMapboxFunctions.ts
"use client";
import { useRef, useCallback, useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import * as turf from "@turf/turf";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { useMapHistoryActions } from "./useMapHistoryActions";
import { Feature, Polygon, GeoJsonProperties, LineString } from "geojson";
import { SnapPolygonMode, SnapLineMode } from "mapbox-gl-draw-snap-mode";
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
const GOOGLE_SATELLITE_KEY = "AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao";
const GOOGLE_TILE_URL = `https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}&k=${GOOGLE_SATELLITE_KEY}`;
const DEFAULT_POLYGON_LABELS = ["Ridge", "Hip", "Valley", "Rake", "Eave", "Flashing", "Step Flashing"];
const DEFAULT_LINE_LABELS = ["Ridge", "Hip", "Valley", "Rake", "Eave", "Flashing", "Step Flashing"];

const customGoogleStyle = {
  version: 8,
  name: "Google Satellite Tiles",
  sources: {
    "google-satellite-tiles": {
      type: "raster",
      tiles: [GOOGLE_TILE_URL],
      tileSize: 256,
      minzoom: 0,
      maxzoom: 22,
    },
  },
  layers: [
    {
      id: "google-satellite",
      type: "raster",
      source: "google-satellite-tiles",
    },
  ],
};
export function useMapboxFunctions() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  (window as any).mapRef = mapRef;
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const isDeductionModeActive = useRef(false);
  const labelElementsRef = useRef<{ [key: string]: HTMLDivElement }>({});
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [polygonsData, setPolygonsData] = useState<any[]>([]);
  const [linesData, setLinesData] = useState<any[]>([]);
  const [gridVisible, setGridVisible] = useState(false);
  const [labelsVisible, setLabelsVisible] = useState(true);
  const [tempLocation, setTempLocation] = useState<[number, number] | null>(null);
  const [pinLocation, setPinLocation] = useState<[number, number] | null>(null);
  const pinMarkerRef = useRef<mapboxgl.Marker | null>(null);
  
  // Function to create/update marker at a location
  const setMarkerAtLocation = useCallback((location: [number, number], draggable: boolean = false) => {
    if (!mapRef.current) {
      // Wait for map to be ready
      setTimeout(() => setMarkerAtLocation(location, draggable), 100);
      return;
    }
    
    if (!pinMarkerRef.current) {
      // Same marker as Step2Address: default Mapbox pin
      const marker = new mapboxgl.Marker({ draggable })
        .setLngLat(location)
        .addTo(mapRef.current);
      const el = marker.getElement();
      if (el) {
        // Don't set position/top/left – Mapbox positions marker via transform (needed for Google tiles)
        el.style.opacity = "1";
        el.style.willChange = "transform";
        el.style.transition = "opacity .2s";
        el.style.zIndex = "9999";
        el.style.pointerEvents = draggable ? "auto" : "none";
        const container = el.closest(".mapboxgl-marker-container");
        if (container && container instanceof HTMLElement) {
          (container as HTMLElement).style.zIndex = "9999";
          (container as HTMLElement).style.pointerEvents = draggable ? "auto" : "none";
        }
      }
      // Keep temp/pin location synced while dragging in edit mode
      marker.on("drag", (ev) => {
        const p = (ev.target as mapboxgl.Marker).getLngLat();
        const next: [number, number] = [p.lng, p.lat];
        setTempLocation(next);
        setPinLocation(next);
      });
      marker.on("dragend", (ev) => {
        const p = (ev.target as mapboxgl.Marker).getLngLat();
        const next: [number, number] = [p.lng, p.lat];
        setTempLocation(next);
        setPinLocation(next);
      });
      
      pinMarkerRef.current = marker;
    } else {
      pinMarkerRef.current.setLngLat(location);
      pinMarkerRef.current.setDraggable(draggable);
      const el = pinMarkerRef.current.getElement();
      if (el) {
        el.style.opacity = "1";
        el.style.willChange = "transform";
        el.style.transition = "opacity .2s";
        el.style.zIndex = "9999";
        el.style.pointerEvents = draggable ? "auto" : "none";
        const container = el.closest(".mapboxgl-marker-container");
        if (container && container instanceof HTMLElement) {
          (container as HTMLElement).style.zIndex = "9999";
          (container as HTMLElement).style.pointerEvents = draggable ? "auto" : "none";
        }
      }
    }
  }, []);
  
  // Function to get location from localStorage (projectLocation or latest project from projects array)
  const getLocationFromStorage = useCallback((): [number, number] | null => {
    if (typeof window === "undefined") return null;
    // 1) Prefer projectLocation (exact coords user confirmed)
    const savedLoc = localStorage.getItem("projectLocation");
    if (savedLoc) {
      try {
        const coords = JSON.parse(savedLoc);
        if (coords && typeof coords.lat === "number" && typeof coords.lng === "number") {
          return [coords.lng, coords.lat];
        }
      } catch (err) {
        console.warn("Error parsing projectLocation from localStorage", err);
      }
    }
    // 2) Fallback: request-estimate saves to "projects" only – use latest project's lat/lng
    const projectsRaw = localStorage.getItem("projects");
    if (projectsRaw) {
      try {
        const projects = JSON.parse(projectsRaw);
        if (Array.isArray(projects) && projects.length > 0) {
          const last = projects[projects.length - 1];
          const lat = last.lat ?? last.latitude;
          const lng = last.lng ?? last.longitude;
          if (typeof lat === "number" && typeof lng === "number") {
            return [lng, lat];
          }
        }
      } catch (err) {
        console.warn("Error parsing projects from localStorage", err);
      }
    }
    return null;
  }, []);
  
  // Get initial coordinates from localStorage
  const initialCoords = getLocationFromStorage();
  
  // Show location card initially - user needs to confirm even if location is saved
  const [showLocationCard, setShowLocationCard] = useState<boolean>(true);
  const [isLocationConfirmed, setIsLocationConfirmed] = useState<boolean>(false);

  const saveShapesToProjects = useCallback((features: any[], totalAreaFeet: number, totalLengthFeet: number) => {
    if (typeof window === "undefined") return;
    const projectsRaw = localStorage.getItem("projects");
    let projects = projectsRaw ? JSON.parse(projectsRaw) : [];
    if (projects.length === 0) return;

    let netTotalAreaFeet = 0;
    let totalDeductionAreaFeet = 0;

    const latestProject = projects[projects.length - 1];
    const polygons: any[] = [];
    const lines: any[] = [];

    features.forEach((feature: any, idx: number) => {
      if (!feature || !feature.geometry) return;

      const coords = feature.geometry.coordinates;
      const areaSqFeet = feature.properties?.area || 0;
      const edges = feature.properties?.edges || [];
      const isDeduction = feature.properties?.isDeduction === true;

      // Handle Polygons
      if (feature.geometry.type === "Polygon") {
        if (!isDeduction) {
          netTotalAreaFeet += areaSqFeet;
        } else {
          totalDeductionAreaFeet += areaSqFeet;
        }
        polygons.push({
          id: feature.id,
          coordinates: coords,
          edges,
          area: areaSqFeet,
          customColor: feature.properties?.customColor || (isDeduction ? "#808080" : "#FFD700"),
          label: feature.properties?.label || (isDeduction ? "Deduction Area" : DEFAULT_POLYGON_LABELS[idx] || `Polygon #${idx + 1}`),
          isDeduction,
        });
      }

      // Handle Lines (Updated to include Area logic)
      if (feature.geometry.type === "LineString") {
        // Agar line ka area hai (matlab wo closed/shape hai), to usy total me add karo
        if (areaSqFeet > 0) {
          netTotalAreaFeet += areaSqFeet;
        }

        lines.push({
          id: feature.id,
          coordinates: coords,
          edges,
          area: areaSqFeet, // Saving area in Line object too
          customColor: feature.properties?.customColor || "#FFD700",
          label: feature.properties?.label || DEFAULT_LINE_LABELS[idx] || `Line #${idx + 1}`,
        });
      }
    });

    latestProject.polygons = polygons;
    latestProject.lines = lines;
    // Calculation: Total Positive Area (Polygons + Closed Lines) - Deductions
    latestProject.totalArea = (netTotalAreaFeet - totalDeductionAreaFeet).toFixed(2);
    latestProject.totalLength = totalLengthFeet.toFixed(2);

    localStorage.setItem("projects", JSON.stringify(projects));
  }, []);



  const updateShapesData = useCallback(() => {
    if (!drawRef.current) return;
    const allFeatures = drawRef.current.getAll().features;
    const edgeFeatures: any[] = [];
    let totalAreaFeet = 0;
    let totalLengthFeet = 0;

    const updatedFeatures = allFeatures.map((feature: any) => {
      if (!feature || !feature.geometry) return feature;

      // Coordinate extraction handle for both Polygon and LineString
      const coords = feature.geometry.type === "Polygon"
        ? feature.geometry.coordinates[0]
        : feature.geometry.coordinates;

      const edges: any[] = [];
      let featureLengthFeet = 0;
      let areaSqFeet = 0;

      const isDeduction = feature.properties?.isDeduction === true;
      const color = feature.properties?.customColor || (isDeduction ? "#808080" : "#FFD700");

      // --- 1. Calculate Edges & Length (Standard Logic) ---
      for (let i = 0; i < coords.length - 1; i++) {
        const lenMeters = turf.length(turf.lineString([coords[i], coords[i + 1]]), { units: "meters" });
        const lenFeet = lenMeters * 3.28084;
        featureLengthFeet += lenFeet;
        totalLengthFeet += lenFeet;
        edges.push({ start: coords[i], end: coords[i + 1], lengthFeet: lenFeet });
        edgeFeatures.push({
          type: "Feature",
          properties: { color, isDeduction: isDeduction },
          geometry: { type: "LineString", coordinates: [coords[i], coords[i + 1]] },
        });
      }

      // --- 2. Calculate Area (Updated Logic for Lines) ---
      if (feature.geometry.type === "Polygon") {
        areaSqFeet = turf.area(feature) * 10.7639;
      }
      else if (feature.geometry.type === "LineString" && coords.length >= 3) {
        // Agar Line ke pass 3+ points hain, to temporary polygon bana kar area nikalo
        try {
          const tempPolygon = turf.lineToPolygon(feature);
          areaSqFeet = turf.area(tempPolygon) * 10.7639;
        } catch (err) {
          console.warn("Unable to calculate area for incomplete line", err);
          areaSqFeet = 0;
        }
      }

      // Add to Total Area Calculation
      if (feature.geometry.type === "Polygon") {
        if (!isDeduction) totalAreaFeet += areaSqFeet;
      } else {
        // Lines are generally not deductions, so just add if it has area
        totalAreaFeet += areaSqFeet;
      }

      // Update Feature Properties
      drawRef.current?.setFeatureProperty(feature.id, "edges", edges);
      // Area property set karo taaki LineString me bhi area save rahe
      drawRef.current?.setFeatureProperty(feature.id, "area", areaSqFeet);

      return {
        ...feature,
        properties: {
          ...feature.properties,
          edges,
          area: areaSqFeet // Return area so it saves in state correctly
        }
      };
    });

    const source = mapRef.current?.getSource("polygon-edges") as any;
    if (source) {
      source.setData({ type: "FeatureCollection", features: edgeFeatures });
    }

    setPolygonsData(updatedFeatures.filter(f => f.geometry?.type === "Polygon"));
    setLinesData(updatedFeatures.filter(f => f.geometry?.type === "LineString"));

    // Yahan hum calculated total bhej rahe hain
    saveShapesToProjects(updatedFeatures, totalAreaFeet, totalLengthFeet);
  }, [saveShapesToProjects]);

  const updateLabelPositions = useCallback(() => { 
    if (!mapRef.current) return;
    const map = mapRef.current;
    Object.keys(labelElementsRef.current).forEach(key => {
      const el = labelElementsRef.current[key];
      const [featureId, segmentIndexStr] = key.split("-");
      const segmentIndex = parseInt(segmentIndexStr, 10);
      const feature = drawRef.current?.get(featureId);
      if (!feature || !el) return;
      const coords = feature.geometry?.type === "Polygon"
        ? feature.geometry.coordinates[0]
        : feature.geometry?.type === "LineString"
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
  const toFeetInches = useCallback((meters: number) => {
    const ft = meters * 3.28084;
    const feet = Math.floor(ft);
    const inches = Math.round((ft - feet) * 12);
    if (inches >= 12) return `${feet + 1}'0"`;
    return `${feet}'${inches}"`;
  }, []);
  const updateEdgeLabels = useCallback((showLabels?: boolean) => {
    if (!mapRef.current || !drawRef.current) return;
    const map = mapRef.current;
    const draw = drawRef.current;
    const shouldShow = typeof showLabels === "boolean" ? showLabels : labelsVisible;
    if (!shouldShow) {
      Object.values(labelElementsRef.current).forEach(el => el.remove());
      labelElementsRef.current = {};
      return;
    }
    const features = draw.getAll().features || [];
    const currentLabelKeys = new Set<string>();
    features.forEach((feature: any) => {
      const edges = feature.properties?.edges || [];
      const isDeduction = feature.properties?.isDeduction === true;
      edges.forEach((edge: any, i: number) => {
        const lenMeters = edge.lengthFeet / 3.28084;
        if (lenMeters < 0.01) return;
        const key = `${feature.id}-${i}`;
        currentLabelKeys.add(key);
        let el = labelElementsRef.current[key];
        const background = isDeduction ? "rgba(128, 128, 128, 0.9)" : "rgba(255,255,255,0.9)";
        const color = isDeduction ? "white" : "#000";
        const border = isDeduction ? "1px solid #333" : "1px solid #333";
        if (!el) {
          el = document.createElement("div");
          el.style.cssText = `
            // position: absolute;
            background: ${background};
            padding: 2px 4px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: 600;
            color: ${color};
            text-align: center;
            pointer-events: none;
            // transform: translate(-50%, -50%);
            z-index: 1000;
            border: ${border};
          `;
          map.getContainer().appendChild(el);
          labelElementsRef.current[key] = el;
        }
        el.innerText = toFeetInches(lenMeters);
        el.style.background = background;
        el.style.color = color;
        el.style.border = border;
      });
    });
    Object.keys(labelElementsRef.current).forEach(key => {
      if (!currentLabelKeys.has(key)) {
        labelElementsRef.current[key].remove();
        delete labelElementsRef.current[key];
      }
    });
    updateLabelPositions();
  }, [toFeetInches, updateLabelPositions, labelsVisible]);
  const {
    undo,
    redo,
    deleteFeature,
    toggleLabels,
    pushHistory,
  } = useMapHistoryActions(mapRef, drawRef, updateEdgeLabels, updateShapesData, labelsVisible);
  const toggleGrid = useCallback((show: boolean) => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const layerExists = map.getLayer("grid-layer");
    if (show) {
      if (layerExists && map.getLayoutProperty('grid-layer', 'visibility') === 'visible') {
        return;
      }
      const bounds = map.getBounds();
      if (!bounds) return;
      const bbox: [number, number, number, number] = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];
      const cellSide = 10;
      const options = { units: 'meters' } as any;
      const grid = turf.squareGrid(bbox, cellSide, options);
      if (!map.getSource("grid-layer")) {
        map.addSource("grid-layer", {
          type: "geojson",
          data: grid,
        });
      }
      if (!layerExists) {
        map.addLayer({
          id: "grid-layer",
          type: "line",
          source: "grid-layer",
          layout: { "visibility": "visible" },
          paint: {
            "line-color": "rgba(255, 255, 255, 0.5)",
            "line-width": 1,
            "line-dasharray": [1, 1]
          },
        });
      } else {
        map.setLayoutProperty('grid-layer', 'visibility', 'visible');
        (map.getSource("grid-layer") as mapboxgl.GeoJSONSource).setData(grid);
      }
      setGridVisible(true);
    } else {
      if (layerExists) {
        map.setLayoutProperty('grid-layer', 'visibility', 'none');
      }
      setGridVisible(false);
    }
  }, []);
  const handleDrawChange = useCallback((e: any) => {
    if (!drawRef.current) return;
    e.features.forEach((feature: any) => {
      if (e.type === "draw.create" && feature.geometry.type === "LineString") {
        const coords = feature.geometry.coordinates;
        if (coords.length >= 3 && turf.distance(turf.point(coords[0]), turf.point(coords[coords.length - 1]), { units: 'meters' }) < 1) {
          drawRef.current?.delete(feature.id);
          drawRef.current?.add({
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [coords]
            },
            properties: {
              customColor: feature.properties?.customColor || "#FFD700",
              label: feature.properties?.label || "Auto-Closed Area",
              isDeduction: false,
            }
          });
          return;
        }
      }
      if (e.type === "draw.create" && feature.geometry.type === "Polygon") {
        const isDeduction = isDeductionModeActive.current;
        if (isDeduction) {
          drawRef.current?.setFeatureProperty(feature.id, "isDeduction", true);
          drawRef.current?.setFeatureProperty(feature.id, "customColor", "#808080");
          drawRef.current?.setFeatureProperty(feature.id, "label", "Deduction Area");
          isDeductionModeActive.current = false;
        } else {
          const currentColor = feature.properties?.customColor || "#FFD700";
          drawRef.current?.setFeatureProperty(feature.id, "customColor", currentColor);
        }
      }
      if (e.type === "draw.update" && feature.properties?.isDeduction === true) {
        drawRef.current?.setFeatureProperty(feature.id, "customColor", "#808080");
      }
    });
    if (["draw.create", "draw.update", "draw.delete"].includes(e.type)) {
      pushHistory(
        e.type === "draw.create" ? "create" :
          e.type === "draw.update" ? "update" : "delete"
      );
      updateShapesData();
      updateEdgeLabels(labelsVisible);
      if (e.type !== "draw.update") {
        toggleGrid(false);
      }
    }
  }, [pushHistory, updateShapesData, updateEdgeLabels, toggleGrid, labelsVisible]);
  
  // Calculate center from saved location (projectLocation or projectAddress)
  // Use initialCoords if available, otherwise default to [0, 0]
  const center: [number, number] = initialCoords || [0, 0];
  const handleConfirmLocation = useCallback(() => {
    if (!tempLocation) return;
    
    // Save location to localStorage
    if (typeof window !== "undefined") {
      const location = { lat: tempLocation[1], lng: tempLocation[0] };
      localStorage.setItem("projectLocation", JSON.stringify(location));
      // Ensure "projects" has at least one entry so saveShapesToProjects can save measurements for PDF
      let projects = [];
      try {
        const raw = localStorage.getItem("projects");
        projects = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(projects)) projects = [];
        if (projects.length === 0) {
          projects = [{
            polygons: [],
            lines: [],
            totalArea: "0",
            totalLength: "0",
            mapboxBearing: "0",
            ...location,
          }];
          localStorage.setItem("projects", JSON.stringify(projects));
        }
      } catch (_) {}
      // Also update projectAddress if it exists
      const projectAddress = localStorage.getItem("projectAddress");
      if (projectAddress) {
        try {
          const addr = JSON.parse(projectAddress);
          addr.lat = tempLocation[1];
          addr.lng = tempLocation[0];
          localStorage.setItem("projectAddress", JSON.stringify(addr));
        } catch (e) {
          console.warn("Could not update projectAddress", e);
        }
      }
    }
    
    setPinLocation(tempLocation);
    // Hide location card and exit edit mode
    setIsLocationConfirmed(true);
    setIsEditMode(false);
    setShowLocationCard(false);
    
    // Lock marker: position + non-draggable (so it stays fixed with Google tiles + Mapbox)
    setMarkerAtLocation(tempLocation, false);
    // Enforce lock after React flush so pin never moves on zoom/pan
    const lockedLngLat = tempLocation;
    requestAnimationFrame(() => {
      if (pinMarkerRef.current) {
        pinMarkerRef.current.setLngLat(lockedLngLat);
        pinMarkerRef.current.setDraggable(false);
        const el = pinMarkerRef.current.getElement();
        if (el) {
          el.style.pointerEvents = "none";
          const container = el.closest(".mapboxgl-marker-container");
          if (container && container instanceof HTMLElement) {
            (container as HTMLElement).style.pointerEvents = "none";
          }
        }
      }
    });
    
    // Zoom to confirmed location - marker will stay fixed at coordinates
    if (mapRef.current) {
      mapRef.current.flyTo({ 
        center: tempLocation, 
        zoom: 21, 
        essential: true,
        duration: 1000 
      });
    }
  }, [tempLocation, setMarkerAtLocation]);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  
  const handleChangeLocation = useCallback(() => {
    setIsLocationConfirmed(false);
    setIsEditMode(true); // Enable edit mode when "Change Location" is clicked
    setShowLocationCard(true);
    // Make marker draggable again and re-enable pointer-events
    if (pinMarkerRef.current) {
      const p = pinMarkerRef.current.getLngLat();
      const next: [number, number] = [p.lng, p.lat];
      setTempLocation(next);
      setPinLocation(next);
      pinMarkerRef.current.setDraggable(true);
      const el = pinMarkerRef.current.getElement();
      if (el) {
        el.style.pointerEvents = "auto";
        const container = el.closest(".mapboxgl-marker-container");
        if (container && container instanceof HTMLElement) {
          (container as HTMLElement).style.pointerEvents = "auto";
        }
      }
    }
  }, []);
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    let onClickMoveMap: (e: mapboxgl.MapMouseEvent) => void;

    // Enable map clicks when location card is shown, location is not confirmed, and in edit mode
    if (showLocationCard && !isLocationConfirmed && isEditMode) {
      onClickMoveMap = (e: mapboxgl.MapMouseEvent) => {
        const { lng, lat } = e.lngLat;
        const newLocation: [number, number] = [lng, lat];
        setTempLocation(newLocation);
        setPinLocation(newLocation);
        
        // Move marker to clicked location
        setMarkerAtLocation(newLocation, true);
      };
      map.on("click", onClickMoveMap);
      return () => {
        map.off("click", onClickMoveMap);
      };
    }
    return () => { };
  }, [showLocationCard, isLocationConfirmed, isEditMode, setMarkerAtLocation]);
  useEffect(() => {
    if (!mapRef.current || !tempLocation) return;
    // Update marker position based on confirmation status
    setMarkerAtLocation(tempLocation, !isLocationConfirmed);
  }, [tempLocation, isLocationConfirmed, setMarkerAtLocation]);
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: customGoogleStyle as mapboxgl.Style,
      center,
      zoom: 20,
      preserveDrawingBuffer: true,
    });
    mapRef.current = map;
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      userProperties: true,
      modes: {
        ...MapboxDraw.modes,
        draw_polygon: SnapPolygonMode,
        draw_line_string: SnapLineMode,
      },
      styles: [
        {
          id: "gl-draw-polygon-fill",
          type: "fill",
          filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"], ["!=", "isDeduction", true]],
          paint: { "fill-color": "transparent", "fill-opacity": 0 },
        },
        {
          id: "gl-draw-deduction-polygon-fill",
          type: "fill",
          filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"], ["==", "isDeduction", true]],
          paint: { "fill-color": "#808080", "fill-opacity": 0.3 },
        },
        {
          id: "gl-draw-polygon-stroke",
          type: "line",
          filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
          paint: { "line-color": ["coalesce", ["get", "customColor"], "#FFD700"], "line-width": 3, "line-dasharray": ["case", ["==", ["get", "isDeduction"], true], ["literal", [3, 2]], ["literal", [1]]] },
        },
        {
          id: "gl-draw-line",
          type: "line",
          filter: ["all", ["==", "$type", "LineString"], ["!=", "mode", "static"]],
          paint: { "line-color": ["coalesce", ["get", "customColor"], "#FFD700"], "line-width": 3 },
        },
        {
          id: "gl-draw-polygon-midpoint",
          type: "circle",
          filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
          paint: { "circle-radius": 5, "circle-color": ["coalesce", ["get", "customColor"], "#FFD700"], "circle-opacity": 1 },
        },
        {
          id: "gl-draw-polygon-vertex-active",
          type: "circle",
          filter: ["all", ["==", "$type", "Point"], ["==", "meta", "vertex"]],
          paint: {
            "circle-radius": 4,
            "circle-color": ["coalesce", ["get", "customColor"], "white"],
            "circle-stroke-color": ["coalesce", ["get", "customColor"], "white"],
            "circle-stroke-width": 0.1,
          },
        },
      ],
      snap: true,
      snapOptions: { snapPx: 2, snapToMidPoints: true },
    } as any);
    drawRef.current = draw;
    map.addControl(draw);
    
    // Handle window resize to keep map responsive
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    };
    window.addEventListener('resize', handleResize);
    
    map.on("load", () => {
      // Resize map to ensure proper display
      setTimeout(() => {
        map.resize();
      }, 100);
      if (!map.getSource("polygon-edges")) {
        map.addSource("polygon-edges", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      }
      if (!map.getLayer("polygon-edges-layer")) {
        map.addLayer({
          id: "polygon-edges-layer",
          type: "line",
          source: "polygon-edges",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-width": 3,
            "line-color": ["get", "color"],
            "line-dasharray": ["case", ["==", ["get", "isDeduction"], true], ["literal", [3, 2]], ["literal", [1]]],
          },
        });
      }
      
      // Use exact coords: projectLocation first, then latest project from "projects" (request-estimate saves there)
      let savedLocation: [number, number] | null = null;
      if (typeof window !== "undefined") {
        const savedLoc = localStorage.getItem("projectLocation");
        if (savedLoc) {
          try {
            const coords = JSON.parse(savedLoc);
            if (coords && typeof coords.lat === "number" && typeof coords.lng === "number") {
              savedLocation = [coords.lng, coords.lat];
            }
          } catch (err) {
            console.warn("Error parsing projectLocation", err);
          }
        }
        if (!savedLocation) {
          const projectsRaw = localStorage.getItem("projects");
          if (projectsRaw) {
            try {
              const projects = JSON.parse(projectsRaw);
              if (Array.isArray(projects) && projects.length > 0) {
                const last = projects[projects.length - 1];
                const lat = last.lat ?? last.latitude;
                const lng = last.lng ?? last.longitude;
                if (typeof lat === "number" && typeof lng === "number") {
                  savedLocation = [lng, lat];
                }
              }
            } catch (err) {
              console.warn("Error parsing projects", err);
            }
          }
        }
        if (savedLocation) {
          setTempLocation(savedLocation);
          setPinLocation(savedLocation);
          setShowLocationCard(true);
          setIsLocationConfirmed(true);
          setIsEditMode(false);
          map.flyTo({ center: savedLocation, zoom: 20, essential: true });
          // Add pin after map has finished moving (like Instant Estimate Step1) so it's visible
          map.once("moveend", () => {
            if (mapRef.current && savedLocation) {
              setMarkerAtLocation(savedLocation, false);
            }
          });
          return;
        }
      }
      
      // Default behavior if no saved location
      const mapCenter = map.getCenter();
      const lngLat: [number, number] = [mapCenter.lng, mapCenter.lat];
      setTempLocation(lngLat);
      setPinLocation(lngLat);
      setShowLocationCard(true);
    });
    map.on("draw.create", handleDrawChange);
    map.on("draw.update", handleDrawChange);
    map.on("draw.delete", () => {
      pushHistory("delete");
      updateShapesData();
      updateEdgeLabels(labelsVisible);
    });
    map.on("render", updateLabelPositions);
    return () => {
      window.removeEventListener('resize', handleResize);
      map.off("render", updateLabelPositions);
      map.off("draw.create", handleDrawChange);
      map.off("draw.update", handleDrawChange);
      map.off("draw.delete", handleDrawChange);
      map.remove();
      mapRef.current = null;
      drawRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - map should only initialize once

  useEffect(() => {
    if (!mapRef.current) return;
    const handleSelectionChange = (e: any) => {
      if (e.features.length > 0) {
        const featureId = e.features[0].id;
        setSelectedFeature(featureId);
        const feature = drawRef.current?.get(featureId);
        if (feature && feature.properties?.customColor) {
          updateShapesData();
          updateEdgeLabels(labelsVisible);
        }
      } else {
        setSelectedFeature(null);
      }
    };
    mapRef.current.on("draw.selectionchange", handleSelectionChange);
    return () => {
      mapRef.current?.off("draw.selectionchange", handleSelectionChange);
    };
  }, [labelsVisible, updateShapesData, updateEdgeLabels]);
  const drawPolygon = useCallback(() => {
    if (!drawRef.current) return;
    isDeductionModeActive.current = false;
    drawRef.current.changeMode("draw_polygon");
  }, []);
  const drawLine = useCallback(() => {
    if (!drawRef.current) return;
    drawRef.current.changeMode("draw_line_string");
  }, []);
  const drawDeductionPolygon = useCallback(() => {
    if (!drawRef.current) return;
    isDeductionModeActive.current = true;
    drawRef.current.changeMode("draw_polygon");
  }, []);
  const applyColorToSelectedFeature = useCallback((label: { name: string; color: string }) => {
    if (!drawRef.current || !selectedFeature) return;
    const isDeduction = drawRef.current.get(selectedFeature)?.properties?.isDeduction === true;
    if (isDeduction) {
      alert("Deduction areas cannot have their color or label changed.");
      return;
    }
    drawRef.current.setFeatureProperty(selectedFeature, "customColor", label.color);
    drawRef.current.setFeatureProperty(selectedFeature, "label", label.name);
    const updatedFeature = drawRef.current.get(selectedFeature);
    if (updatedFeature) {
      pushHistory("update");
      updateShapesData();
    }
    updateEdgeLabels(labelsVisible);
    if (drawRef.current.getMode() === "simple_select" || drawRef.current.getMode() === "direct_select") {
      setGridVisible(false);
    }
  }, [selectedFeature, updateShapesData, updateEdgeLabels, labelsVisible, pushHistory]);
  const rotateMapCW = useCallback(() => {
    if (!mapRef.current) return;
    const currentBearing = mapRef.current.getBearing();
    mapRef.current.rotateTo(currentBearing + 15, { duration: 300 });
  }, []);
  const rotateMapCCW = useCallback(() => {
    if (!mapRef.current) return;
    const currentBearing = mapRef.current.getBearing();
    mapRef.current.rotateTo(currentBearing - 15, { duration: 300 });
  }, []);
  return {
    mapRef,
    mapContainerRef,
    drawRef,
    selectedFeature,
    setSelectedFeature,
    applyColorToSelectedFeature,
    polygonsData,
    drawPolygon,
    drawLine,
    drawDeductionPolygon,
    linesData,
    updateEdgeLabels,
    updateShapesData,
    toFeetInches,
    undo,
    redo,
    deleteFeature,
    toggleLabels,
    pushHistory,
    labelsVisible,
    createGridLayer: () => { },
    toggleGrid,
    gridVisible,
    handleConfirmLocation,
    handleChangeLocation,
    showLocationCard,
    tempLocation,
    isLocationConfirmed,
    isEditMode,
    pinLocation,
    rotateMapCCW,
    rotateMapCW,
  };
}