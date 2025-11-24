// components/hooks/useMapHistoryActions.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type MapboxDraw from "@mapbox/mapbox-gl-draw";

interface HistoryState {
    type: "create" | "delete" | "update";
    features: any[];
}

export function useMapHistoryActions(
    mapRef: React.MutableRefObject<mapboxgl.Map | null>, 
    drawRef: React.MutableRefObject<MapboxDraw | null>,
    updateEdgeLabels: (show?: boolean) => void,
    updateShapesData: () => void
) {
    const [history, setHistory] = useState<HistoryState[]>([]);
    const [redoStack, setRedoStack] = useState<HistoryState[]>([]);
    const [labelsVisible, setLabelsVisible] = useState(true);
    const [showGrid, setShowGrid] = useState(false);
    
    const pushHistory = useCallback((type: HistoryState["type"]) => {
        if (!drawRef.current) return;
        const allFeatures = drawRef.current.getAll();
        setHistory(prev => [...prev, { type, features: allFeatures.features }]);
        setRedoStack([]);
    }, [drawRef]);

    const deleteFeature = useCallback(() => {
        if (!drawRef.current) return;
        const selected = drawRef.current.getSelectedIds();
        if (!selected.length) return;
        drawRef.current.delete(selected);
        pushHistory("delete");
        updateEdgeLabels(false);
        updateShapesData();
    }, [drawRef, pushHistory, updateEdgeLabels, updateShapesData]);

    const undo = useCallback(() => {
        if (!drawRef.current || !history.length) return;
        const lastAction = history[history.length - 1];
        setHistory(prev => prev.slice(0, -1));
        setRedoStack(prev => [...prev, lastAction]);

        drawRef.current.deleteAll();
        const previous = history[history.length - 2];
        if (previous) previous.features.forEach((f: any) => drawRef.current?.add(f));
        updateEdgeLabels();
        updateShapesData();
    }, [drawRef, history, updateEdgeLabels, updateShapesData]);

    const redo = useCallback(() => {
        if (!drawRef.current || !redoStack.length) return;
        const lastRedo = redoStack[redoStack.length - 1];
        setRedoStack(prev => prev.slice(0, -1));
        setHistory(prev => [...prev, lastRedo]);

        drawRef.current.deleteAll();
        lastRedo.features.forEach((f: any) => drawRef.current?.add(f));
        updateEdgeLabels();
        updateShapesData();
    }, [drawRef, redoStack, updateEdgeLabels, updateShapesData]);

    const rotateLeft = useCallback(() => {
        const map = (drawRef.current as any)?.map as mapboxgl.Map | undefined;
        if (!map) return;
        map.rotateTo((map.getBearing() || 0) - 15);
    }, [drawRef]);

    const rotateRight = useCallback(() => {
        const map = (drawRef.current as any)?.map as mapboxgl.Map | undefined;
        if (!map) return;
        map.rotateTo((map.getBearing() || 0) + 15);
    }, [drawRef]);

    const toggleLabels = useCallback(() => {
        setLabelsVisible(prev => {
            const next = !prev;
            updateEdgeLabels(next);
            return next;
        });
    }, [updateEdgeLabels]);

    const toggleGrid = () => {
    setShowGrid(v => !v);
    };
    return {
        history,
        redoStack,
        labelsVisible,
        setLabelsVisible,
        pushHistory,
        deleteFeature,
        undo,
        redo,
        rotateLeft,
        rotateRight,
        toggleLabels,
    };
}
