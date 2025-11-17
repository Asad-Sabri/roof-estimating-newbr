"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import * as turf from "@turf/turf";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
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
  const [polygonsData, setPolygonsData] = useState<any[]>([]);
  const [linesData, setLinesData] = useState<any[]>([]);

  const updateShapesData = useCallback(() => {
    if (!drawRef.current) return;
    const allFeatures = drawRef.current.getAll().features;
    const edgeFeatures: any[] = [];
    allFeatures.forEach((feature) => {
      if (feature.geometry.type !== "Polygon") return;
      const coords = feature.geometry.coordinates[0];
      coords.forEach((c, i) => {
        if (!coords[i + 1]) return;
        edgeFeatures.push({
          type: "Feature",
          properties: {
            color: feature.properties?.customColor || "#FFD700",
          },
          geometry: {
            type: "LineString",
            coordinates: [coords[i], coords[i + 1]],
          }
        });
      });
    });

    const source = mapRef.current?.getSource("polygon-edges") as any;
    if (source) {
      source.setData({
        type: "FeatureCollection",
        features: edgeFeatures
      });
    }
    const newPolygons = allFeatures.filter(f => f.geometry.type === "Polygon");
    setPolygonsData(newPolygons);
  }, []);

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
        updateShapesData();
      }
    }
  }, [updateEdgeLabels, updateShapesData]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [-122.4194, 37.7749],
      zoom: 16,
    });
    
    mapRef.current = map;

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      styles: [
        {
          id: "gl-draw-polygon-fill",
          type: "fill",
          filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
          paint: {
            "fill-color": "#000000",
            "fill-opacity": 0,
          },},{
            id: "gl-draw-polygon-stroke",
            type: "line",
            filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
            paint: {
                "line-color": "#FFD700",
                "line-width": 4,
            },
        },{
          id: "gl-draw-line",
          type: "line",
          filter: ["all", ["==", "$type", "LineString"], ["!=", "mode", "static"]],
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": ["coalesce", ["get", "customColor"], "#FFD700"], "line-width": 4 },
        },{
          id: "gl-draw-polygon-midpoint",
          type: "circle",
          filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
          paint: {
            "circle-radius": 5,
            "circle-color": ["coalesce", ["get", "customColor"], "#FFD700"],
            "circle-opacity": 1,
          },
        },{
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
    });

    drawRef.current = draw;
    map.addControl(draw);
    map.on("load", () => {
      map.addSource("polygon-edges", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] }
      });
      map.addLayer({
        id: "polygon-edges-layer",
        type: "line",
        source: "polygon-edges",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-width": 4,
          "line-color": ["get", "color"] 
        }
      });
    });
    map.on("draw.create", handleDrawChange);
    map.on("draw.update", handleDrawChange);
  }, [handleDrawChange, updateEdgeLabels]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    map.on("render", updateLabelPositions);
    return () => {
      map.off("render", updateLabelPositions);
    };
  }, [updateLabelPositions]);

  const applyColorToSelectedFeature = useCallback(
    (color: string) => {
      if (!drawRef.current || !selectedFeature) {
        return;
      }
      drawRef.current.setFeatureProperty(selectedFeature, "customColor", color);
      const currentMode = drawRef.current.getMode();
      if (currentMode !== 'simple_select') {
        drawRef.current.changeMode('simple_select', { featureIds: [selectedFeature] });
      } else {
        const feature = drawRef.current.get(selectedFeature);
        if (feature) {
          drawRef.current.add(feature);
        }
      }
      updateShapesData();
      updateEdgeLabels(labelsVisible);
    },
    [selectedFeature, updateEdgeLabels, labelsVisible, updateShapesData]
  );

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const handleSelectionChange = (e: any) => {
      if (e.features.length > 0) {
        const featureId = e.features[0].id;
        setSelectedFeature(featureId);
      } else {
        setSelectedFeature(null);
      }
    };

    map.on("draw.selectionchange", handleSelectionChange);
    return () => {
      map.off("draw.selectionchange", handleSelectionChange);
    };
  }, []);

  useEffect(() => {
    if (selectedFeature) {
      const defaultColor = "#FFD700";
      applyColorToSelectedFeature(defaultColor);
    }
  }, [selectedFeature, applyColorToSelectedFeature]);

  const drawPolygon = () => {
    drawRef.current?.changeMode("draw_polygon");
  }

  const drawLine = () => {
    drawRef.current?.changeMode("draw_line_string");
  }

  const deleteFeature = () => {
    if (!drawRef.current) return;
    const selected = drawRef.current.getSelectedIds();
    if (!selected.length) {
      return;
    }
    drawRef.current.delete(selected);
    pushHistory("delete");
    updateEdgeLabels();
    updateShapesData();
    setSelectedFeature(null);
  };

  const undo = () => {
    if (!drawRef.current || !history.length) {
      return;
    }
    const lastAction = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, lastAction]);
    drawRef.current.deleteAll();
    const previous = history[history.length - 2];
    if (previous) previous.features.forEach((f) => drawRef.current?.add(f));
    updateEdgeLabels();
    updateShapesData();
  };

  const redo = () => {
    if (!drawRef.current || !redoStack.length) {
      return;
    }
    const lastRedo = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setHistory((prev) => [...prev, lastRedo]);
    drawRef.current.deleteAll();
    lastRedo.features.forEach((f) => drawRef.current?.add(f));
    updateEdgeLabels();
    updateShapesData();
  };

  const rotateLeft = () => {
    mapRef.current?.rotateTo((mapRef.current.getBearing() || 0) - 15);
  }

  const rotateRight = () => {
    mapRef.current?.rotateTo((mapRef.current.getBearing() || 0) + 15);
  }

  const toggleLabels = () => {
    const newState = !labelsVisible;
    setLabelsVisible((prev) => !prev);
    updateEdgeLabels(!labelsVisible);
  };

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

  return {
    mapContainerRef,drawPolygon,drawLine,deleteFeature,undo,redo,rotateLeft,rotateRight,toggleLabels,labelsVisible,selectedFeature,setSelectedFeature,applyColorToSelectedFeature,polygonsData,linesData,toFeetInches,
  };
}