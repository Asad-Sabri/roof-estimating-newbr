"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import * as turf from "@turf/turf";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { useMapHistoryActions } from "./useMapHistoryActions";
import { Feature, Polygon, GeoJsonProperties, LineString } from "geojson";
import { SnapPolygonMode, SnapLineMode } from "mapbox-gl-draw-snap-mode";

// ⭐️ FIX 1: Mapbox access token ko set karein
// Isse Mapbox library fonts, sprites aur internal services ke liye authenticate kar payegi.
// Make sure NEXT_PUBLIC_MAPBOX_TOKEN is set in your environment variables.
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""; 

// --- GOOGLE TILE CONFIGURATION (SAME AS BEFORE) ---
const GOOGLE_SATELLITE_KEY = "AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao";
const GOOGLE_TILE_URL = `https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}&key=${GOOGLE_SATELLITE_KEY}`;

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
// --- END GOOGLE TILE CONFIGURATION ---


export function useMapboxFunctions() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  (window as any).mapRef = mapRef;
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);

  const labelElementsRef = useRef<{ [key: string]: HTMLDivElement }>({});
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [polygonsData, setPolygonsData] = useState<any[]>([]);
  const [linesData, setLinesData] = useState<any[]>([]);
  const [gridVisible, setGridVisible] = useState(false);

  const [tempLocation, setTempLocation] = useState<[number, number] | null>(null);
  const [pinLocation, setPinLocation] = useState<[number, number] | null>(null);
  const pinMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const savedLocationRaw = typeof window !== "undefined" ? localStorage.getItem("projectLocation") : null;
  const initialLocationConfirmed = !!savedLocationRaw;
  const [showLocationCard, setShowLocationCard] = useState<boolean>(!initialLocationConfirmed);
  const [isLocationConfirmed, setIsLocationConfirmed] = useState<boolean>(initialLocationConfirmed);

  const defaultPolygonLabels = ["Ridge", "Hip", "Valley", "Rake", "Eave", "Flashing", "Step Flashing"];
  const defaultLineLabels = ["Ridge", "Hip", "Valley", "Rake", "Eave", "Flashing", "Step Flashing"];

  const saveShapesToProjects = useCallback((features: any[], totalAreaFeet: number, totalLengthFeet: number) => {
    if (typeof window === "undefined") return;

    const projectsRaw = localStorage.getItem("projects");
    let projects = projectsRaw ? JSON.parse(projectsRaw) : [];
    if (projects.length === 0) return;

    const latestProject = projects[projects.length - 1];
    const polygons: any[] = [];
    const lines: any[] = [];

    features.forEach((feature: any, idx: number) => {
      if (!feature || !feature.geometry) return;
      const coords = feature.geometry.coordinates;
      const areaSqFeet = feature.properties?.area || 0;
      const edges = feature.properties?.edges || [];

      if (feature.geometry.type === "Polygon") {
        polygons.push({
          id: feature.id,
          coordinates: coords,
          edges,
          area: areaSqFeet,
          customColor: feature.properties?.customColor || "#FFD700",
          label: feature.properties?.label || defaultPolygonLabels[idx] || `Polygon #${idx + 1}`,
        });
      }

      if (feature.geometry.type === "LineString") {
        lines.push({
          id: feature.id,
          coordinates: coords,
          edges,
          customColor: feature.properties?.customColor || "#FFD700",
          label: feature.properties?.label || defaultLineLabels[idx] || `Line #${idx + 1}`,
        });
      }
    });

    latestProject.polygons = polygons;
    latestProject.lines = lines;
    latestProject.totalArea = totalAreaFeet.toFixed(2);
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
      const coords = feature.geometry.type === "Polygon" ? feature.geometry.coordinates[0] : feature.geometry.coordinates;
      const edges: any[] = [];
      let featureLengthFeet = 0;
      let areaSqFeet = 0;
      const color = feature.properties?.customColor || "#FFD700";
      for (let i = 0; i < coords.length - 1; i++) {
        const lenMeters = turf.length(turf.lineString([coords[i], coords[i + 1]]), { units: "meters" });
        const lenFeet = lenMeters * 3.28084;
        featureLengthFeet += lenFeet;
        totalLengthFeet += lenFeet;
        edges.push({ start: coords[i], end: coords[i + 1], lengthFeet: lenFeet });
        edgeFeatures.push({
          type: "Feature",
          properties: { color },
          geometry: { type: "LineString", coordinates: [coords[i], coords[i + 1]] },
        });
      }
      if (feature.geometry.type === "Polygon") {
        areaSqFeet = turf.area(feature) * 10.7639;
        totalAreaFeet += areaSqFeet;
      }
      drawRef.current?.setFeatureProperty(feature.id, "edges", edges);
      if (feature.geometry.type === "Polygon") {
        drawRef.current?.setFeatureProperty(feature.id, "area", areaSqFeet);
      }
      return {
        ...feature,
        properties: {
          ...feature.properties,
          edges,
          area: areaSqFeet
        }
      };
    });
    const source = mapRef.current?.getSource("polygon-edges") as any;
    if (source) {
      source.setData({ type: "FeatureCollection", features: edgeFeatures });
    }
    setPolygonsData(updatedFeatures.filter(f => f.geometry?.type === "Polygon"));
    setLinesData(updatedFeatures.filter(f => f.geometry?.type === "LineString"));
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
    const shouldShow = typeof showLabels === "boolean" ? showLabels : true;
    if (!shouldShow) {
      Object.values(labelElementsRef.current).forEach(el => el.remove());
      labelElementsRef.current = {};
      return;
    }
    const features = draw.getAll().features || [];
    const currentLabelKeys = new Set<string>();

    features.forEach((feature: any) => {
      const edges = feature.properties?.edges || [];
      edges.forEach((edge: any, i: number) => {
        const lenMeters = edge.lengthFeet / 3.28084;
        if (lenMeters < 0.01) return;
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
            color: #000;
            text-align: center;
            pointer-events: none;
            transform: translate(-50%, -50%);
            z-index: 1000;
            border: 1px solid #333;
          `;
          map.getContainer().appendChild(el);
          labelElementsRef.current[key] = el;
        }
        el.innerText = toFeetInches(lenMeters);
      });
    });

    Object.keys(labelElementsRef.current).forEach(key => {
      if (!currentLabelKeys.has(key)) {
        labelElementsRef.current[key].remove();
        delete labelElementsRef.current[key];
      }
    });
    updateLabelPositions();
  }, [toFeetInches, updateLabelPositions]);

  const {
    undo,
    redo,
    deleteFeature,
    rotateLeft,
    rotateRight,
    toggleLabels,
    pushHistory,
    labelsVisible,
  } = useMapHistoryActions(drawRef, updateEdgeLabels, updateShapesData);

  const toggleGrid = useCallback((show: boolean) => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const layerExists = map.getLayer("grid-layer");

    if (show) {
      if (layerExists && map.getLayoutProperty('grid-layer', 'visibility') === 'visible') {
        return;
      }
      const bounds = map.getBounds();
      const bbox = [bounds?.getWest(), bounds?.getSouth(), bounds?.getEast(), bounds?.getNorth()];
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
      const currentColor = feature.properties?.customColor || "#FFD700";
      drawRef.current?.setFeatureProperty(feature.id, "customColor", currentColor);
    });

    if (["draw.create", "draw.update", "draw.delete"].includes(e.type)) {
      pushHistory(
        e.type === "draw.create" ? "create" :
          e.type === "draw.update" ? "update" : "delete"
      );
      updateShapesData();
      updateEdgeLabels(true);

      if (e.type !== "draw.update") {
        toggleGrid(false);
      }
    }
  }, [pushHistory, updateShapesData, updateEdgeLabels, toggleGrid]);

  let center: [number, number] = [0, 0];
  if (savedLocationRaw) {
    try {
      const coords = JSON.parse(savedLocationRaw);
      if (coords && typeof coords.lat === "number" && typeof coords.lng === "number") {
        center = [coords.lng, coords.lat];
      }
    } catch (err) {
      console.warn("Invalid projectLocation in localStorage", err);
    }
  }

  const createPinElement = () => {
    const el = document.createElement("div");
    el.className = "custom-pin-marker-container";
    const img = document.createElement("img");
    img.src = "https://maps.google.com/mapfiles/ms/icons/red-dot.png";
    img.style.width = "40px";
    img.style.height = "40px";
    img.style.display = "block";
    el.style.transform = "translate(-50%, -100%)";
    el.style.zIndex = "10";
    el.appendChild(img);
    return el;
  };

  const handleConfirmLocation = useCallback(() => {
    if (!tempLocation) return;
    if (typeof window !== "undefined") {
      localStorage.setItem("projectLocation", JSON.stringify({ lat: tempLocation[1], lng: tempLocation[0] }));
    }
    setIsLocationConfirmed(true);
    setShowLocationCard(false);
    if (pinMarkerRef.current) {
      pinMarkerRef.current.setLngLat(tempLocation);
      pinMarkerRef.current.setDraggable(false);
    }
    mapRef.current?.flyTo({ center: tempLocation, zoom: 20, essential: true });
  }, [tempLocation]);

  const handleChangeLocation = useCallback(() => {
    setIsLocationConfirmed(false);
    setShowLocationCard(true);
    if (mapRef.current) {
      const map = mapRef.current;
      const onClickMoveMap = (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
        const { lng, lat } = e.lngLat;
        setTempLocation([lng, lat]);
      };
      map.on("click", onClickMoveMap);
      const cleanup = () => {
        map.off("click", onClickMoveMap);
      };
      return cleanup;
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current || !tempLocation) return;
    if (!pinMarkerRef.current) {
      const el = createPinElement();
      const marker = new mapboxgl.Marker({
        element: el,
        draggable: !isLocationConfirmed,
        anchor: 'bottom'
      })
        .setLngLat(tempLocation)
        .addTo(mapRef.current);

      if (!isLocationConfirmed) {
        marker.on("drag", (ev) => {
          const p = (ev.target as any).getLngLat();
          setTempLocation([p.lng, p.lat]);
        });
      }
      pinMarkerRef.current = marker;
    }
    else {
      pinMarkerRef.current.setLngLat(tempLocation);
      pinMarkerRef.current.setDraggable(!isLocationConfirmed);
    }
  }, [tempLocation, isLocationConfirmed]);

  // --- MAP INITIALIZATION USE EFFECT (YAHAN CHANGE HUA HAI) ---
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    
    // ⭐️ CHANGE: Mapbox style ko custom Google Tiles style se replace kiya gaya.
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: customGoogleStyle as mapboxgl.Style, // <--- GOOGLE TILES INTEGRATED
      center,
      zoom: 19,
      preserveDrawingBuffer: true,
    });
    
    mapRef.current = map;
    
    // --- MAPBOX DRAW INITIALIZATION (SAME AS BEFORE) ---
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
          filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
          paint: { "fill-color": "transparent", "fill-opacity": 0 },
        },
        {
          id: "gl-draw-polygon-stroke",
          type: "line",
          filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
          paint: { "line-color": "#FFD700", "line-width": 3 },
        },
        {
          id: "gl-draw-line",
          type: "line",
          filter: ["all", ["==", "$type", "LineString"], ["!=", "mode", "static"]],
          paint: { "line-color": "#FFD700", "line-width": 3 },
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      snap: true,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      snapOptions: { snapPx: 15, snapToMidPoints: true },
    } as any);
    drawRef.current = draw;
    map.addControl(draw);
    // --- END MAPBOX DRAW INITIALIZATION ---

    map.on("load", () => {
      if (!map.getSource("polygon-edges")) {
        map.addSource("polygon-edges", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      }
      if (!map.getLayer("polygon-edges-layer")) {
        map.addLayer({
          id: "polygon-edges-layer",
          type: "line",
          source: "polygon-edges",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-width": 3, "line-color": ["get", "color"] },
        });
      }
    });
    const mapCenter = map.getCenter();
    const lngLat: [number, number] = [mapCenter.lng, mapCenter.lat];

    setTempLocation(lngLat);
    setPinLocation(lngLat);
    setShowLocationCard(true);
    map.on("draw.create", handleDrawChange);
    map.on("draw.update", handleDrawChange);
    map.on("draw.delete", () => {
      pushHistory("delete");
      updateShapesData();
      updateEdgeLabels();
    });
    map.on("render", updateLabelPositions);

    return () => {
      map.off("render", updateLabelPositions);
      map.off("draw.create", handleDrawChange);
      map.off("draw.update", handleDrawChange);
      map.remove();
      mapRef.current = null;
      drawRef.current = null;
    };
  }, [handleDrawChange, updateLabelPositions, pushHistory, updateEdgeLabels, updateShapesData, setTempLocation, setShowLocationCard, toggleGrid]);
  // --- END MAP INITIALIZATION USE EFFECT ---
  
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
    drawRef.current.changeMode("draw_polygon");
  }, []);

  const drawLine = useCallback(() => {
    if (!drawRef.current) return;
    drawRef.current.changeMode("draw_line_string");
  }, []);

  const applyColorToSelectedFeature = useCallback((label: { name: string; color: string }) => {
    if (!drawRef.current || !selectedFeature) return;
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
    linesData,
    updateEdgeLabels,
    updateShapesData,
    toFeetInches,
    undo,
    redo,
    deleteFeature,
    rotateLeft,
    rotateRight,
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
    pinLocation,
  };
}