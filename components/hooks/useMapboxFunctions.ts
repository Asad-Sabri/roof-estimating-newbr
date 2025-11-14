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
    console.log("🟢 Hook Initialized: useMapboxFunctions started.");
    
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
        console.log(`➡️ pushHistory called. Type: ${type}`);
        const allFeatures = drawRef.current.getAll();
        setHistory((prev) => [...prev, { type, features: allFeatures.features }]);
        setRedoStack([]);
    };

    // --- Update Shape State (Edges + Measurements) ---
    const updateShapesData = useCallback(() => {
        console.log("⚙️ updateShapesData called: Processing feature data for display.");
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

    // --- Label Positions (Map 'render' event par chalta hai) ---
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
                // Calculate midpoint in geospatial coordinates
                const midpoint = turf.midpoint(turf.point(start), turf.point(end));
                
                // Convert midpoint to screen coordinates
                const pos = map.project(midpoint.geometry.coordinates as [number, number]);
                
                // Set label position on screen (This is what makes it dynamic)
                el.style.left = pos.x + "px";
                el.style.top = pos.y + "px";
            }
        });
    }, []);

    
    // --- Label Content and Visibility (State change par chalta hai) ---
    const updateEdgeLabels = useCallback(
        (showLabels: boolean = labelsVisible) => {
            console.log(`🏷️ updateEdgeLabels called. Visibility: ${showLabels ? 'Visible' : 'Hidden'}`);
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
                            color: #000; /* FIXED: Hamesha Black */
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

            // Content update ke baad ek baar position set karein
            updateLabelPositions(); 
        },
        [labelsVisible, updateLabelPositions]
    );

    // --- Draw Event Handler (Create/Update) ---
    const handleDrawChange = useCallback((e: any) => {
        console.log(`🗺️ Mapbox Draw Event: ${e.type} occurred.`);
        if (!drawRef.current) return;
        if (e.type === "draw.create" || e.type === "draw.update") {
            pushHistory(e.type === "draw.create" ? "create" : "update");
            const latestFeature = e.features[0];
            if (latestFeature?.id) {
                console.log(`   Feature ID: ${latestFeature.id} is now selected/updated.`);
                setSelectedFeature(String(latestFeature.id));
                updateEdgeLabels(true);
                updateShapesData();
            }
        }
    }, [updateEdgeLabels, updateShapesData]);

    // --- Map Initialization Effect (Only Draw events) ---
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        console.log("🌎 Map Initializing: Creating new Mapbox instance.");
        
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
                    id: "gl-draw-polygon-stroke",
                    type: "line",
                    filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
                    layout: { "line-cap": "round", "line-join": "round" },
                    // Stroke Color (Customizable)
                    paint: { "line-color": ["coalesce", ["get", "customColor"], "#FFD700"], "line-width": 4 },
                },
                {
                    id: "gl-draw-line",
                    type: "line",
                    filter: ["all", ["==", "$type", "LineString"], ["!=", "mode", "static"]],
                    layout: { "line-cap": "round", "line-join": "round" },
                    // Line Color (Customizable)
                    paint: { "line-color": ["coalesce", ["get", "customColor"], "#FFD700"], "line-width": 4 },
                },
                {
                    id: "gl-draw-polygon-midpoint",
                    type: "circle",
                    filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
                    paint: {
                        "circle-radius": 5,
                        "circle-color": ["coalesce", ["get", "customColor"], "#FFD700"], 
                        "circle-opacity": 1,
                    },
                },
                {
                    id: "gl-draw-polygon-vertex-active",
                    type: "circle",
                    filter: ["all", ["==", "$type", "Point"], ["==", "meta", "vertex"]],
                    paint: {
                        "circle-radius": 5,
                        "circle-color": ["coalesce", ["get", "customColor"], "#FFD700"], // Vertex Fill Color
                        "circle-stroke-color": ["coalesce", ["get", "customColor"], "#FFD700"], // Vertex Stroke Color bhi match karega
                        "circle-stroke-width": 1,
                    },
                },
            ],
        });


        drawRef.current = draw;
        map.addControl(draw);
        console.log("   Mapbox Draw added to map.");

        map.on("load", () => {
            console.log("✅ Map Loaded: Checking for saved location.");
            const savedAddress = localStorage.getItem("projectLocation");
            if (savedAddress) {
                const addr = JSON.parse(savedAddress);
                if (addr.lng && addr.lat) {
                    map.setCenter([addr.lng, addr.lat]);
                    map.setZoom(18);
                    console.log(`   Map centered on saved location: [${addr.lng}, ${addr.lat}]`);
                }
            }
        });

        map.on("draw.create", handleDrawChange);
        map.on("draw.update", handleDrawChange);
        // ❌ map.on("render", updateLabelPositions); <-- Hata diya gaya

        return () => {
             console.log("🗑️ Map Cleanup: Draw and Selection listeners are being cleaned.");
             // ✅ map.off("render", updateLabelPositions); <-- Hata diya gaya
        };
    }, [handleDrawChange, updateEdgeLabels]); 
    // updateLabelPositions ab is effect ki dependency nahi hai, kyunki uske liye naya effect hai.

    // --- FIX: Dynamic Label Positioning Listener ---
    // Yeh effect sirf map ready hone par run hoga aur hamesha 'render' event par positions update karega.
    useEffect(() => {
        if (!mapRef.current) return;
        
        const map = mapRef.current;
        
        // 🟢 FIX: Render listener hamesha active rakhein map zoom/pan ko handle karne ke liye
        map.on("render", updateLabelPositions);
        console.log("🟢 Render Listener Added: Dynamic label positioning active.");

        return () => {
            // Cleanup: Hook unmount hone par listener remove kar dein
            map.off("render", updateLabelPositions);
            console.log("🗑️ Render Listener Removed.");
        };
    }, [updateLabelPositions]); // Dependency updateLabelPositions, jo useCallback hai.


    // --- Exposed Function: Apply Color ---
    const applyColorToSelectedFeature = useCallback(
        (color: string) => {
            if (!drawRef.current || !selectedFeature) {
                console.warn("🎨 Action: applyColorToSelectedFeature failed. No feature selected.");
                return;
            }

            console.log(`🎨 Action: applyColorToSelectedFeature called. Applying color ${color} to Feature ID: ${selectedFeature}`);
            
            drawRef.current.setFeatureProperty(selectedFeature, "customColor", color);

            // Re-render data 
            updateShapesData();
            // Labels content update
            updateEdgeLabels(labelsVisible); 
        },
        [selectedFeature, updateEdgeLabels, labelsVisible, updateShapesData]
    );

    // --- Selection Change Listener Effect (Sets selectedFeature state) ---
    useEffect(() => {
        if (!mapRef.current) return;

        const map = mapRef.current;

        const handleSelectionChange = (e: any) => {
            if (e.features.length > 0) {
                const featureId = e.features[0].id;
                setSelectedFeature(featureId); 
                console.log(`📌 draw.selectionchange: Feature ${featureId} selected.`);
                
            } else {
                setSelectedFeature(null);
                console.log("📌 draw.selectionchange: Deselected all features.");
            }
        };

        map.on("draw.selectionchange", handleSelectionChange);

        return () => {
            map.off("draw.selectionchange", handleSelectionChange);
        };
    }, []);


    // --- Default Color Application Effect (Triggers after state change) ---
    useEffect(() => {
        if (selectedFeature) {
            const defaultColor = "#FFD700"; 
            
            console.log(`✨ Applying default color ${defaultColor} to new selection ID: ${selectedFeature}`);
            
            applyColorToSelectedFeature(defaultColor);
        }
    }, [selectedFeature, applyColorToSelectedFeature]);


    // --- Exposed Functions ---

    const drawPolygon = () => {
        console.log("🔨 Action: drawPolygon called. Mode changed to draw_polygon.");
        drawRef.current?.changeMode("draw_polygon");
    }
    
    const drawLine = () => {
        console.log("🔨 Action: drawLine called. Mode changed to draw_line_string.");
        drawRef.current?.changeMode("draw_line_string");
    }

    const deleteFeature = () => {
        if (!drawRef.current) return;
        const selected = drawRef.current.getSelectedIds();
        if (!selected.length) {
            console.warn("⚠️ Action: deleteFeature called, but no feature was selected.");
            return;
        }
        console.log(`🗑️ Action: deleteFeature called. Deleting IDs: ${selected.join(', ')}`);
        drawRef.current.delete(selected);
        pushHistory("delete");
        updateEdgeLabels();
        updateShapesData();
        setSelectedFeature(null);
    };

    const undo = () => {
        if (!drawRef.current || !history.length) {
            console.warn("⏪ Action: undo called, but history is empty.");
            return;
        }
        console.log("⏪ Action: undo called. Reverting to previous state.");
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
             console.warn("⏩ Action: redo called, but redoStack is empty.");
            return;
        }
        console.log("⏩ Action: redo called. Applying next state.");
        const lastRedo = redoStack[redoStack.length - 1];
        setRedoStack((prev) => prev.slice(0, -1));
        setHistory((prev) => [...prev, lastRedo]);
        drawRef.current.deleteAll();
        lastRedo.features.forEach((f) => drawRef.current?.add(f));
        updateEdgeLabels();
        updateShapesData();
    };

    const rotateLeft = () => {
        console.log("🔄 Action: rotateLeft called. Rotating map left 15 degrees.");
        mapRef.current?.rotateTo((mapRef.current.getBearing() || 0) - 15);
    }
    
    const rotateRight = () => {
        console.log("🔄 Action: rotateRight called. Rotating map right 15 degrees.");
        mapRef.current?.rotateTo((mapRef.current.getBearing() || 0) + 15);
    }

    const toggleLabels = () => {
        const newState = !labelsVisible;
        console.log(`👁️ Action: toggleLabels called. New state: ${newState ? 'Visible' : 'Hidden'}`);
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
        polygonsData,
        linesData,
        toFeetInches,
    };
}