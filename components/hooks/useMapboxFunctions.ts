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
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);

  const labelElementsRef = useRef<{ [key: string]: HTMLDivElement }>({});
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [polygonsData, setPolygonsData] = useState<any[]>([]);
  const [linesData, setLinesData] = useState<any[]>([]);
  const [gridVisible, setGridVisible] = useState(false);
  // --------------------------
  // Update shapes, labels, edges
  // --------------------------
  const updateShapesData = useCallback(() => {
    if (!drawRef.current) return;
    const allFeatures = drawRef.current.getAll().features;

    const edgeFeatures: any[] = [];
    allFeatures.forEach((feature) => {
      if (feature.geometry.type === "Polygon") {
        const coords = feature.geometry.coordinates[0];
        coords.forEach((c, i) => {
          if (!coords[i + 1]) return;
          edgeFeatures.push({
            type: "Feature",
            properties: { color: feature.properties?.customColor || "#FFD700" },
            geometry: { type: "LineString", coordinates: [coords[i], coords[i + 1]] },
          });
        });
      } else if (feature.geometry.type === "LineString") {
        const coords = feature.geometry.coordinates;
        for (let i = 0; i < coords.length - 1; i++) {
          edgeFeatures.push({
            type: "Feature",
            properties: { color: feature.properties?.customColor || "#FFD700" },
            geometry: { type: "LineString", coordinates: [coords[i], coords[i + 1]] },
          });
        }
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

  // --------------------------
  // 2) history/actions hook
  // --------------------------
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

  // --------------------------
  // 3) applyColor, draw modes, draw event handler
  // --------------------------
  const applyColorToSelectedFeature = useCallback(
    (color: string) => {
      if (!drawRef.current || !selectedFeature) return;
      const feature = drawRef.current.get(selectedFeature);
      if (!feature) return;
      drawRef.current.setFeatureProperty(selectedFeature, "customColor", color);
      updateShapesData();
      updateEdgeLabels(labelsVisible);
      if (drawRef.current?.getMode() === "simple_select") {
        drawRef.current.changeMode("simple_select");
        setGridVisible(false);
      }
    },
    [selectedFeature, updateShapesData, updateEdgeLabels, labelsVisible]
  );

  const handleDrawChange = useCallback((e: any) => {
    if (!drawRef.current) return;

    e.features.forEach((feature: any) => {
      const currentColor = feature.properties?.customColor || "#FFD700";
      drawRef.current?.setFeatureProperty(feature.id, "customColor", currentColor);
    });

    if (["draw.create", "draw.update"].includes(e.type)) {
      pushHistory(e.type === "draw.create" ? "create" : "update");
      updateShapesData();
      updateEdgeLabels(true);

      // **Remove grid after drawing is complete**
      if (mapRef.current && mapRef.current.getLayer("grid-layer")) {
        mapRef.current.removeLayer("grid-layer");
        mapRef.current.removeSource("grid-layer");
      }
      setGridVisible(false);
    }
  }, [pushHistory, updateShapesData, updateEdgeLabels]);

  // --------------------------
  // 4) initialize map + draw
  // --------------------------
  const savedLocation = localStorage.getItem("projectLocation");
  let center: [number, number] = [-122.4194, 37.7749]; // fallback default

  if (savedLocation) {
    try {
      const coords = JSON.parse(savedLocation);
      if (coords && typeof coords.lat === "number" && typeof coords.lng === "number") {
        center = [coords.lng, coords.lat]; // mapbox expects [lng, lat]
      }
    } catch (err) {
      console.warn("Invalid projectLocation in localStorage", err);
    }
  }

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center, // use correct lng, lat
      zoom: 19,
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
          filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
          paint: { "fill-color": "transparent", "fill-opacity": 0 },
        },
        {
          id: "gl-draw-polygon-stroke",
          type: "line",
          filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
          paint: { "line-color": "#FFD700", "line-width": 4 },
        },
        {
          id: "gl-draw-line",
          type: "line",
          filter: ["all", ["==", "$type", "LineString"], ["!=", "mode", "static"]],
          paint: { "line-color": "#FFD700", "line-width": 4 },
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
            "circle-radius": 5,
            "circle-color": ["coalesce", ["get", "customColor"], "white"],
            "circle-stroke-color": ["coalesce", ["get", "customColor"], "white"],
            "circle-stroke-width": 1,
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
          paint: { "line-width": 4, "line-color": ["get", "color"] },
        });
      }
    });

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
  }, [handleDrawChange, updateLabelPositions, pushHistory, updateEdgeLabels, updateShapesData]);

  // selection change -> setSelectedFeature
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


  const createGridLayer = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const updateGrid = () => {
      const bounds = map.getBounds();
      if (!bounds) return;

      const features: Feature<LineString, GeoJsonProperties>[] = [];

      const latStep = 0.00005; // grid spacing
      const lngStep = 0.00005;

      // vertical lines
      for (let x = bounds.getWest(); x <= bounds.getEast(); x += lngStep) {
        features.push({
          type: "Feature",
          geometry: { type: "LineString", coordinates: [[x, bounds.getSouth()], [x, bounds.getNorth()]] },
          properties: {},
        });
      }

      // horizontal lines
      for (let y = bounds.getSouth(); y <= bounds.getNorth(); y += latStep) {
        features.push({
          type: "Feature",
          geometry: { type: "LineString", coordinates: [[bounds.getWest(), y], [bounds.getEast(), y]] },
          properties: {},
        });
      }

      if (!map.getSource("grid-layer")) {
        map.addSource("grid-layer", { type: "geojson", data: { type: "FeatureCollection", features } });
        map.addLayer({
          id: "grid-layer",
          type: "line",
          source: "grid-layer",
          paint: {
            "line-color": "#333333",  // dark gray
            "line-width": 1.5,
            "line-opacity": 0.7,
          },
        });
      } else {
        (map.getSource("grid-layer") as any).setData({ type: "FeatureCollection", features });
      }
    };

    // Initial grid draw
    updateGrid();

    // Update grid on rotate/move
    // map.on("rotate", updateGrid);
    // map.on("move", updateGrid);

    // Cleanup
    return () => {
      // map.off("rotate", updateGrid);
      // map.off("move", updateGrid);
    };
  }, []);


  const drawPolygon = useCallback(() => {
    if (!drawRef.current) return;
    drawRef.current.changeMode("draw_polygon");
    setGridVisible(true);

    // Map aur bounds check karke grid create karo
    if (mapRef.current && mapRef.current.getBounds()) {
      // createGridLayer();
    }
  }, [createGridLayer]);

  const drawLine = useCallback(() => {
    if (!drawRef.current) return;
    drawRef.current.changeMode("draw_line_string");
    setGridVisible(true);

    if (mapRef.current && mapRef.current.getBounds()) {
      createGridLayer();
    }
  }, [createGridLayer]);

  return {
    mapRef,
    mapContainerRef,
    drawRef,
    drawPolygon,
    drawLine,
    selectedFeature,
    setSelectedFeature,
    applyColorToSelectedFeature,
    polygonsData,
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
    createGridLayer
  };
}
