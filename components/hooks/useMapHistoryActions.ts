// useMapHistoryActions.ts

"use client";

import { useCallback, useEffect, useState } from "react";
import type MapboxDraw from "@mapbox/mapbox-gl-draw";
import type mapboxgl from "mapbox-gl";
import * as turf from "@turf/turf";

interface HistoryState {
    type: "create" | "delete" | "update" | "rotate" | "initial";
    features: any[];
}

export function useMapHistoryActions(
    // mapRef zaroori hai rotation ke liye
    mapRef: React.MutableRefObject<mapboxgl.Map | null>, 
    drawRef: React.MutableRefObject<MapboxDraw | null>,
    updateEdgeLabels: (show?: boolean) => void,
    updateShapesData: () => void,
    currentLabelsVisible: boolean, 
    setLabelsVisible: React.Dispatch<React.SetStateAction<boolean>> 
) {
    const [history, setHistory] = useState<HistoryState[]>([]);
    const [redoStack, setRedoStack] = useState<HistoryState[]>([]);
    const MAX_HISTORY_SIZE = 50;
    
    // --- FIX 2: Initial History Entry (Dependency sirf drawRef.current par rakhi) ---
    // Yeh ensure karega ki map load hone par sirf ek baar initial state save ho.
    useEffect(() => {
        if (!drawRef.current || history.length > 0) return;
        
        const initialFeatures = drawRef.current.getAll().features.map(f => JSON.parse(JSON.stringify(f)));
        // History mein [initial] entry ko daal diya
        setHistory([{ type: "initial", features: initialFeatures }]);
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [drawRef]); // sirf drawRef pe dependency rakhi


    const pushHistory = useCallback((type: HistoryState["type"]) => {
        if (!drawRef.current) return;
        
        const currentFeatures = drawRef.current.getAll().features.map(f => JSON.parse(JSON.stringify(f)));
        
        const newEntry: HistoryState = { type, features: currentFeatures };

        setHistory(prev => {
            // Agar pichli entry aur current entry same hain, toh skip karein (sirf update aur initial ko chhodkar)
            if (prev.length > 0) {
                const lastEntry = prev[prev.length - 1];
                if (JSON.stringify(lastEntry.features) === JSON.stringify(newEntry.features)) {
                    return prev;
                }
            }

            const newHistory = [...prev, newEntry];
            if (newHistory.length > MAX_HISTORY_SIZE) {
                newHistory.shift(); 
            }
            return newHistory;
        });
        // Koi naya action hone par Redo stack ko clear karein
        setRedoStack([]); 
    }, [drawRef]);

    const applyHistoryEntry = useCallback((entry: HistoryState) => {
        if (!drawRef.current) return;
        drawRef.current.deleteAll();
        // features ko add karte waqt ID preserve ho rahi hai, jo Mapbox Draw ke liye zaroori hai.
        entry.features.forEach(f => {
            if (f && f.id) {
                drawRef.current?.add(f); 
            }
        });
        updateShapesData();
        updateEdgeLabels(currentLabelsVisible); 
    }, [drawRef, updateEdgeLabels, updateShapesData, currentLabelsVisible]);


    const undo = useCallback(() => {
        // FIX 3: Agar history mein sirf 1 entry hai (jo initial hai), toh undo nahi ho sakta.
        if (history.length <= 1 || !drawRef.current) return; 

        // 1. Current (last) state ko Redo stack mein daalein
        const currentState = {
            type: "update",
            features: drawRef.current.getAll().features.map(f => JSON.parse(JSON.stringify(f)))
        } as HistoryState; 
        setRedoStack(prev => [...prev, currentState]);

        // 2. Second to last state ko apply karein
        // history.length - 2 par pichli state hai
        const previousState = history[history.length - 2]; 
        applyHistoryEntry(previousState);

        // 3. History se last state ko remove karein
        setHistory(prev => prev.slice(0, prev.length - 1));

    }, [history, drawRef, applyHistoryEntry]);
    
    // ... (Redo, deleteFeature, rotateFeature, rotateLeft, rotateRight, toggleLabels code is correct and remains the same)

    const redo = useCallback(() => {
        if (redoStack.length === 0) return;

        // 1. Redo stack se last state nikalen
        const lastRedo = redoStack[redoStack.length - 1];
        setRedoStack(prev => prev.slice(0, prev.length - 1));

        // 2. Redone state ko History mein wapas daalein
        setHistory(prev => [...prev, lastRedo]);

        // 3. State ko map par apply karein
        applyHistoryEntry(lastRedo);

    }, [redoStack, applyHistoryEntry]);
    
    
    const deleteFeature = useCallback(() => {
        if (!drawRef.current) return;
        const selected = drawRef.current.getSelectedIds();
        if (!selected.length) return;
        
        drawRef.current.delete(selected);
        
        pushHistory("delete");
        updateEdgeLabels(currentLabelsVisible); 
        updateShapesData();
    }, [drawRef, pushHistory, updateEdgeLabels, updateShapesData, currentLabelsVisible]); 
    
    
    const rotateFeature = useCallback((angle: number) => {
        if (!drawRef.current || !mapRef.current) return;
        
        const selected = drawRef.current.getSelected(); 
        if (selected.features.length === 0) return;

        const feature = selected.features[0];
        
        if (feature.geometry.type !== 'Polygon' && feature.geometry.type !== 'LineString') return;
        
        // Pivot point nikalen (center of the feature)
        const center = turf.center(feature); 
        const featureProps = JSON.parse(JSON.stringify(feature.properties)); 
        
        // Feature ko rotate karein
        const rotatedFeature = turf.transformRotate(feature, angle, { pivot: center.geometry.coordinates });
        
        const oldId = feature.id;
        
        // Old feature ko delete karein aur naye ko add karein
        drawRef.current.delete(oldId);
        
        const newFeatureId = drawRef.current.add({
            ...rotatedFeature,
            // Original properties ko wapas add karein (area, label, customColor, isDeduction)
            properties: { ...featureProps } 
        })[0];
        
        // Re-select the feature to continue editing/rotating
        drawRef.current.changeMode('simple_select', { featureIds: [newFeatureId] }); 
        
        pushHistory("rotate");
        updateShapesData();
        updateEdgeLabels(currentLabelsVisible);

    }, [drawRef, mapRef, pushHistory, updateShapesData, updateEdgeLabels, currentLabelsVisible]);


    const rotateLeft = useCallback(() => rotateFeature(-5), [rotateFeature]);
    const rotateRight = useCallback(() => rotateFeature(5), [rotateFeature]);
    
    const toggleLabels = useCallback(() => { 
        setLabelsVisible(prev => {
            const newState = !prev;
            updateEdgeLabels(newState); 
            return newState;
        });
    }, [updateEdgeLabels, setLabelsVisible]); 

    return {
        toggleLabels,
        undo,
        redo,
        deleteFeature,
        rotateLeft,
        rotateRight,
        pushHistory,
    };
}