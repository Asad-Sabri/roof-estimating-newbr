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
    // mapRef: React.MutableRefObject<mapboxgl.Map | null>,
    // drawRef: React.MutableRefObject<MapboxDraw | null>,
    // updateEdgeLabels: (show?: boolean) => void,
    // updateShapesData: () => void,
    // currentLabelsVisible: boolean,
    // setLabelsVisible: React.Dispatch<React.SetStateAction<boolean>>
    // ) {
    mapRef: React.MutableRefObject<mapboxgl.Map | null>,
    drawRef: React.MutableRefObject<MapboxDraw | null>,
    updateEdgeLabels: (show?: boolean) => void,
    updateShapesData: () => void,
    currentLabelsVisible: boolean,

) {
    const [history, setHistory] = useState<HistoryState[]>([]);
    const [redoStack, setRedoStack] = useState<HistoryState[]>([]);
    const [labelsVisible, setLabelsVisible] = useState(true);

    const MAX_HISTORY_SIZE = 50;

    // -----------------------------
    // INITIAL HISTORY ENTRY
    // -----------------------------
    // useEffect(() => {
    //     if (!drawRef.current || history.length > 0) return;

    //     const initialFeatures = drawRef.current
    //         .getAll()
    //         .features.map(f => JSON.parse(JSON.stringify(f)));

    //     setHistory([{ type: "initial", features: initialFeatures }]);

    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [drawRef.current]);


    useEffect(() => {
        if (!drawRef.current || history.length > 0) return;

        const initialFeatures = drawRef.current.getAll().features.map(f => JSON.parse(JSON.stringify(f)));
        // History mein [initial] entry ko daal diya
        setHistory([{ type: "initial", features: initialFeatures }]);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [drawRef]);
    // -----------------------------
    // PUSH HISTORY
    // -----------------------------
    const pushHistory = useCallback((type: HistoryState["type"]) => {
        if (!drawRef.current) return;

        const currentFeatures = drawRef.current
            .getAll()
            .features.map(f => JSON.parse(JSON.stringify(f)));

        const newEntry: HistoryState = { type, features: currentFeatures };

        setHistory(prev => {
            if (prev.length > 0) {
                const lastEntry = prev[prev.length - 1];
                if (
                    JSON.stringify(lastEntry.features) ===
                    JSON.stringify(newEntry.features)
                ) {
                    return prev; // prevent duplicates
                }
            }

            const newHistory = [...prev, newEntry];
            if (newHistory.length > MAX_HISTORY_SIZE) newHistory.shift();
            return newHistory;
        });

        setRedoStack([]); // new action clears redo
    }, [drawRef]);

    // -----------------------------
    // APPLY HISTORY ENTRY
    // -----------------------------
    const applyHistoryEntry = useCallback((entry: HistoryState) => {
        if (!drawRef.current) return;

        drawRef.current.deleteAll();

        entry.features.forEach(f => {
            if (f && f.id) drawRef.current?.add(f);
        });

        // Shapes + labels dono update honge
        updateShapesData();
        updateEdgeLabels(currentLabelsVisible);
    }, [drawRef, updateShapesData, updateEdgeLabels, currentLabelsVisible,]);




    // -----------------------------
    // UNDO
    // -----------------------------
    const undo = useCallback(() => {
        if (history.length <= 1 || !drawRef.current) return;

        const currentState = {
            type: "update",
            features: drawRef.current
                .getAll()
                .features.map(f => JSON.parse(JSON.stringify(f)))
        } as HistoryState;

        setRedoStack(prev => [...prev, currentState]);

        const previousState = history[history.length - 2];
        applyHistoryEntry(previousState);

        setHistory(prev => prev.slice(0, prev.length - 1));
    }, [history, drawRef, applyHistoryEntry]);

    // -----------------------------
    // REDO
    // -----------------------------
    const redo = useCallback(() => {
        if (redoStack.length === 0) return;

        const lastRedo = redoStack[redoStack.length - 1];
        setRedoStack(prev => prev.slice(0, prev.length - 1));

        setHistory(prev => [...prev, lastRedo]);

        applyHistoryEntry(lastRedo);
    }, [redoStack, applyHistoryEntry]);

    // -----------------------------
    // DELETE FEATURE
    // -----------------------------
    const deleteFeature = useCallback(() => {
        if (!drawRef.current) return;
        const selected = drawRef.current.getSelectedIds();
        if (!selected.length) return;

        drawRef.current.delete(selected);

        pushHistory("delete");
        updateShapesData();
        updateEdgeLabels(currentLabelsVisible);
    }, [drawRef, pushHistory, updateShapesData, updateEdgeLabels, currentLabelsVisible]);

    const toggleLabels = useCallback(() => {
        setLabelsVisible(prev => {
            const next = !prev;
            updateEdgeLabels(next);
            return next;
        });
    }, [updateEdgeLabels]);

    

    // -----------------------------
    // RETURN EXPORTS
    // -----------------------------
    return {
        deleteFeature,
        undo,
        redo,
        drawRef,
        toggleLabels,
        pushHistory,
        history,
        redoStack,
        labelsVisible,
        setLabelsVisible,
        // rotateMapCW,
        // rotateMapCCW,
    };
};
