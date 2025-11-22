// LeftSidebar.tsx

"use client";

import {
  Pencil,
  Minus,
  Trash2,
  RotateCcw,
  RotateCw,
  Eye,
  EyeOff,
  Check,
  Grid,
} from "lucide-react";
import React, { JSX, useState, useCallback } from "react";
import { useMapContext } from "../hooks/mapContext";

export default function LeftSidebar() {
  const {
    drawPolygon,
    drawLine,
    deleteFeature,
    undo,
    redo,
    rotateLeft,
    rotateRight,
    toggleLabels,
    labelsVisible,
    toggleGrid,
    gridVisible: contextGridVisible, 
    drawRef,
  } = useMapContext();

  const [activeButton, setActiveButton] = useState<string | null>(null);

  const handleDrawToggle = useCallback(
    (name: "Draw" | "Line") => {
      const isActive = activeButton === name;

      if (isActive) {
        // 1. Drawing band karna
        setActiveButton(null);
        if (drawRef.current) {
            drawRef.current.changeMode('simple_select');
        }
        // ❌ REMOVED: Grid toggle here (Grid state ko maintain rakhega)

      } else {
        // 1. Drawing shuru karna
        setActiveButton(name);
        if (name === "Draw") {
          drawPolygon();
        } else {
          drawLine();
        }
        // ❌ REMOVED: Grid toggle here (Grid state ko maintain rakhega)
      }
    },
    [activeButton, drawPolygon, drawLine, drawRef] // ✅ toggleGrid removed from dependencies
  );

  const handleGridToggle = useCallback(() => {
      // ✅ Grid ko sirf yeh button control karega
      toggleGrid(!contextGridVisible);
  }, [toggleGrid, contextGridVisible]);


  const handleClick = (name: string, action?: () => void) => {
    
    if (name === "Draw" || name === "Line") {
      handleDrawToggle(name);
      return;
    }
    
    if (name === "Toggle Grid") {
        handleGridToggle();
        return;
    }

    if (typeof action === "function") {
      action();
      
      // Doosre actions par Draw mode se bahar nikalna
      if (drawRef.current) {
          drawRef.current.changeMode('simple_select');
      }
      
      // Draw/Line button ka active state remove karein agar koi aur action chala hai
      if (activeButton === "Draw" || activeButton === "Line") {
         setActiveButton(null);
      }
      
      // ... (other active button logic unchanged)
    } else {
      console.warn(`⚠ Action not found for button: ${name}`);
    }
  };

  const buttons: { name: string; icon: JSX.Element; action?: () => void }[] = [
    { name: "Draw", icon: <Pencil className="w-5 h-5" /> },
    { name: "Line", icon: <Minus className="w-5 h-5" /> },
    {
        name: "Toggle Grid",
        icon: <Grid className={`w-5 h-5 ${contextGridVisible ? 'text-green-400' : 'text-white'}`} />,
        action: handleGridToggle,
    }, 
    {
      name: "Delete",
      icon: <Trash2 className="w-5 h-5" />,
      action: deleteFeature,
    },
    
    { name: "Undo", icon: <RotateCcw className="w-5 h-5" />, action: undo },
    { name: "Redo", icon: <RotateCw className="w-5 h-5" />, action: redo },
    {
      name: "Rotate L",
      icon: <RotateCcw className="w-5 h-5" />,
      action: rotateLeft,
    },
    {
      name: "Rotate R",
      icon: <RotateCw className="w-5 h-5" />,
      action: rotateRight,
    },
    {
      name: labelsVisible ? "Hide Labels" : "Show Labels",
      icon: labelsVisible ? (
        <EyeOff className="w-5 h-5" />
      ) : (
        <Eye className="w-5 h-5" />
      ),
      action: toggleLabels,
    },
    {
      name: "Parapet Wall",
      icon: <Check className="w-5 h-5" />,
      action: rotateRight, 
    },
  ];

  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 bg-[#0a1f44]/90 p-3 rounded-2xl shadow-xl border border-white/10 z-30">
      {buttons.map((btn, idx) => {
          const isToggableButton = ["Draw", "Line"].includes(btn.name);
          const isCurrentlyActive = isToggableButton && activeButton === btn.name;

          return (
            <React.Fragment key={btn.name}>
              <button
                type="button"
                onClick={() => handleClick(btn.name, btn.action)}
                className={`flex flex-col items-center transition-all ${
                    isCurrentlyActive
                      ? "scale-105 bg-white/20 rounded-lg py-1 text-white"
                      : "text-white"
                }`}
              >
                {btn.icon}
                <span className="text-xs text-gray-200">{btn.name}</span>
              </button>

              {(idx === 3 || idx === 5 || idx === 7) && ( 
                <div className="h-px bg-gray-600 my-1"></div>
              )}
            </React.Fragment>
          );
      })}
    </div>
  );
}