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

  // Location states
  const [tempLocation, setTempLocation] = useState<[number, number] | null>(null);
  const [pinLocation, setPinLocation] = useState<[number, number] | null>(null);
  const pinMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const savedLocationRaw = typeof window !== "undefined" ? localStorage.getItem("projectLocation") : null;
  const initialLocationConfirmed = !!savedLocationRaw;
  const [showLocationCard, setShowLocationCard] = useState<boolean>(!initialLocationConfirmed);
  const [isLocationConfirmed, setIsLocationConfirmed] = useState<boolean>(initialLocationConfirmed);

  const defaultPolygonLabels = ["Ridge","Hip","Valley","Rake", "Eave", "Flashing", "Step Flashing"];
  const defaultLineLabels = ["Ridge","Hip","Valley","Rake", "Eave", "Flashing", "Step Flashing"];

  // --------------------------
  // Save shapes to projects (unchanged logic)
  // --------------------------
  const saveShapesToProjects = useCallback((features: any[]) => {
    if (typeof window === "undefined") return;

    const projectsRaw = localStorage.getItem("projects");
    let projects = projectsRaw ? JSON.parse(projectsRaw) : [];
    if (projects.length === 0) return;

    const latestProject = projects[projects.length - 1];
    const polygons: any[] = [];
    const lines: any[] = [];
    let totalAreaFeet = 0;
    let totalLengthFeet = 0;

    features.forEach((feature: any, idx: number) => {
      if (!feature || !feature.geometry) return;
      const coords = feature.geometry.coordinates;
      const edges: any[] = [];

      if (feature.geometry.type === "Polygon") {
        const polyCoords = coords[0];
        for (let i = 0; i < polyCoords.length - 1; i++) {
          const lenMeters = turf.length(turf.lineString([polyCoords[i], polyCoords[i + 1]]), { units: "meters" });
          const lenFeet = lenMeters * 3.28084;
          totalLengthFeet += lenFeet;
          edges.push({ start: polyCoords[i], end: polyCoords[i + 1], lengthFeet: lenFeet });
        }
        const areaSqFeet = turf.area(feature) * 10.7639;
        totalAreaFeet += areaSqFeet;
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
        for (let i = 0; i < coords.length - 1; i++) {
          const lenMeters = turf.length(turf.lineString([coords[i], coords[i + 1]]), { units: "meters" });
          const lenFeet = lenMeters * 3.28084;
          totalLengthFeet += lenFeet;
          edges.push({ start: coords[i], end: coords[i + 1], lengthFeet: lenFeet });
        }
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

  // --------------------------
  // Update shapes & save to new structure
  // --------------------------
 const updateShapesData = useCallback(() => {
  if (!drawRef.current) return;
  const allFeatures = drawRef.current.getAll().features;

  const edgeFeatures: any[] = [];
  allFeatures.forEach((feature) => {
    const color = feature.properties?.customColor || "#FFD700"; // always use feature color
    let coords: any[] = [];

    if (feature.geometry.type === "Polygon") {
      coords = feature.geometry.coordinates[0];
    } else if (feature.geometry.type === "LineString") {
      coords = feature.geometry.coordinates;
    }

    for (let i = 0; i < coords.length - 1; i++) {
      edgeFeatures.push({
        type: "Feature",
        properties: { color },
        geometry: { type: "LineString", coordinates: [coords[i], coords[i + 1]] },
      });
    }
  });

  const source = mapRef.current?.getSource("polygon-edges") as any;
  if (source) {
    source.setData({ type: "FeatureCollection", features: edgeFeatures });
  }

  setPolygonsData(allFeatures.filter(f => f.geometry?.type === "Polygon"));
  setLinesData(allFeatures.filter(f => f.geometry?.type === "LineString"));
}, []);

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
      const coords =
        feature.geometry?.type === "Polygon"
          ? feature.geometry.coordinates[0]
          : feature.geometry?.type === "LineString"
            ? feature.geometry.coordinates
            : [];
      const numSegments = Math.max(0, coords.length - 1);
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
      }
    });

    Object.keys(labelElementsRef.current).forEach(key => {
      if (!currentLabelKeys.has(key)) {
        labelElementsRef.current[key].remove();
        delete labelElementsRef.current[key];
      }
    });

    updateLabelPositions();
  }, [toFeetInches, updateLabelPositions]);

  // --------------------------states / history-actions
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

      // Remove grid after drawing
      if (mapRef.current?.getLayer("grid-layer")) {
        try {
          mapRef.current.removeLayer("grid-layer");
          mapRef.current.removeSource("grid-layer");
        } catch (err) { /* ignore */ }
      }
      setGridVisible(false);
    }
  }, [pushHistory, updateShapesData, updateEdgeLabels]);

  // --------------------------
  // Initialize map + draw
  // --------------------------
  let center: [number, number] = [0, 0]; // fallback
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
  el.className = "custom-pin-marker";
  el.style.width = "36px";
  el.style.height = "36px";
  el.style.backgroundImage = "url('https://maps.google.com/mapfiles/ms/icons/red-dot.png')";
  el.style.backgroundSize = "contain";
  el.style.backgroundRepeat = "no-repeat";
  el.style.transform = "translate(-50%, -100%)";
  return el;
};

useEffect(() => {
  if (!mapRef.current || !tempLocation) return;
  if (!pinMarkerRef.current) {
    const el = createPinElement();
    pinMarkerRef.current = new mapboxgl.Marker({ element: el, draggable: !isLocationConfirmed })
      .setLngLat(tempLocation)
      .addTo(mapRef.current);
  } else {
    pinMarkerRef.current.setLngLat(tempLocation);
    pinMarkerRef.current.setDraggable(!isLocationConfirmed);
  }
}, [tempLocation, isLocationConfirmed]);


  // ---------- Confirm / Change handlers (fixed)
  // ---------- Confirm / Change handlers (fixed)
  const handleConfirmLocation = useCallback(() => {
    if (!tempLocation) return;

    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("projectLocation", JSON.stringify({ lat: tempLocation[1], lng: tempLocation[0] }));
    }

    setIsLocationConfirmed(true);
    setShowLocationCard(false);

    // Lock marker drag
    if (pinMarkerRef.current) {
      pinMarkerRef.current.setLngLat(tempLocation);
      pinMarkerRef.current.setDraggable(false);
    }

    // Fly to location
    mapRef.current?.flyTo({ center: tempLocation, zoom: 20, essential: true });
  }, [tempLocation]);

  // handleChangeLocation
  const handleChangeLocation = useCallback(() => {
    setIsLocationConfirmed(false);
    setShowLocationCard(true);
    // tempLocation ko null na karo, marker wahi location pe rahe
    // setTempLocation(null); <-- REMOVE this

    // Unlock marker drag
    if (pinMarkerRef.current) {
      pinMarkerRef.current.setDraggable(true);
    }

    // Add map click listener to move marker
    if (mapRef.current) {
      const map = mapRef.current;

      const onClickMoveMarker = (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
        const { lng, lat } = e.lngLat;
        setTempLocation([lng, lat]);
      };

      map.on("click", onClickMoveMarker);

      // Clean up old listener if user confirms again
      const cleanup = () => {
        map.off("click", onClickMoveMarker);
      };
      return cleanup;
    }
  }, []);


  // Sync pin marker when tempLocation changes
  useEffect(() => {
    if (!mapRef.current || !tempLocation) return;

    if (!pinMarkerRef.current) {
      const el = createPinElement();
      pinMarkerRef.current = new mapboxgl.Marker({ element: el, draggable: !isLocationConfirmed })
        .setLngLat(tempLocation)
        .addTo(mapRef.current);

      if (!isLocationConfirmed) {
        pinMarkerRef.current.on("drag", (ev) => {
          const p = (ev.target as any).getLngLat();
          setTempLocation([p.lng, p.lat]);
        });
      }
    } else {
      pinMarkerRef.current.setLngLat(tempLocation);
      pinMarkerRef.current.setDraggable(!isLocationConfirmed);
    }
  }, [tempLocation, isLocationConfirmed]);

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/empty-v9", // Empty style
      center,
      zoom: 19,
      preserveDrawingBuffer: true,
    });

    mapRef.current = map;

    map.on("load", () => {
      // Google Satellite tiles
      if (!map.getSource("google-satellite")) {
        map.addSource("google-satellite", {
          type: "raster",
          tiles: [
            `https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}&key=AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao`
          ],
          tileSize: 256,
        });
      }

      if (!map.getLayer("google-satellite-layer")) {
        map.addLayer({
          id: "google-satellite-layer",
          type: "raster",
          source: "google-satellite",
          minzoom: 0,
          maxzoom: 24,
        });
      }

      // Add MapboxDraw
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
          snap: true,
          snapOptions: { snapPx: 15, snapToMidPoints: true },
    } as any);

      drawRef.current = draw;
      map.addControl(draw);

      // Polygon edges source + layer
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


      // Map events
         // initial map center -> set temp/pin
    const mapCenter = map.getCenter();
    const lngLat: [number, number] = (center[0] === 0 && center[1] === 0) ? [mapCenter.lng, mapCenter.lat] : center;
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
      try {
        map.remove();
      } catch (err) {}
      mapRef.current = null;
      drawRef.current = null;
    };
  }, [handleDrawChange, updateLabelPositions, pushHistory, updateEdgeLabels, updateShapesData]);

  // Sync pin marker when tempLocation changes (single source of truth)


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


  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // remove old marker only if we'll recreate (avoid flicker)
    if (!tempLocation) return;

    if (!pinMarkerRef.current) {
      const el = createPinElement();
      const marker = new mapboxgl.Marker({ element: el, draggable: !isLocationConfirmed })
        .setLngLat(tempLocation)
        .addTo(map);
      if (!isLocationConfirmed) {
        marker.on("drag", (ev) => {
          const p = (ev.target as any).getLngLat();
          setTempLocation([p.lng, p.lat]);
        });
      }
      pinMarkerRef.current = marker;
    } else {
      pinMarkerRef.current.setLngLat(tempLocation);
      pinMarkerRef.current.setDraggable(!isLocationConfirmed);
    }
  }, [tempLocation, isLocationConfirmed]);

  const drawPolygon = useCallback(() => {
    if (!drawRef.current) return;
    drawRef.current.changeMode("draw_polygon");
  }, []);

  const drawLine = useCallback(() => {
    if (!drawRef.current) return;
    drawRef.current.changeMode("draw_line_string");

  }, []);
  return {
    mapRef,
    mapContainerRef,
    drawRef,
    selectedFeature,
    setSelectedFeature,
    // color apply etc.
    applyColorToSelectedFeature: (label: { name: string; color: string }) => {
      if (!drawRef.current || !selectedFeature) return;
      const feature = drawRef.current.get(selectedFeature);
      if (!feature) return;
      feature.properties = { ...feature.properties, customColor: label.color, label: label.name };
      drawRef.current.add(feature);
      updateShapesData();
      updateEdgeLabels(labelsVisible);
      if (drawRef.current.getMode() === "simple_select") {
        drawRef.current.changeMode("simple_select");
        setGridVisible(false);
      }
    },
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
    createGridLayer: () => { }, // already defined above if needed
    handleConfirmLocation,
    handleChangeLocation,
    showLocationCard,
    tempLocation,
    isLocationConfirmed,
    pinLocation,
  };
}
