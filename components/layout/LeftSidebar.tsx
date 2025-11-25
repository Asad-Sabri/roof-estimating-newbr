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
  XOctagon, 
  Grid,
  Check,
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
    labelsVisible, // ⭐ FIX 5: labelsVisible state ab available hai
    toggleGrid,
    gridVisible: contextGridVisible,
    drawRef,
    drawDeductionPolygon,
  } = useMapContext();

  const [activeButton, setActiveButton] = useState<string | null>(null);

  const handleDrawToggle = useCallback(
    (name: "Draw" | "Line" | "Deduction") => {
      const isActive = activeButton === name;

      if (isActive) {
        setActiveButton(null);
        if (drawRef.current) {
          drawRef.current.changeMode("simple_select");
        }
      } else {
        setActiveButton(name);
        if (name === "Draw") {
          drawPolygon();
        } else if (name === "Line") {
          drawLine();
        } else if (name === "Deduction") {
          drawDeductionPolygon();
        }
      }
    },
    [activeButton, drawPolygon, drawLine, drawDeductionPolygon, drawRef] 
  );
  
  const handleGridToggle = useCallback(() => {
    toggleGrid(!contextGridVisible);
  }, [toggleGrid, contextGridVisible]);

  const handleClick = (name: string, action?: () => void) => {
    
    if (name === "Draw") {
      handleDrawToggle("Draw");
      return;
    }
    if (name === "Line") {
      handleDrawToggle("Line");
      return;
    }
    if (name === "Deduction Area") {
      handleDrawToggle("Deduction");
      return;
    }

    if (typeof action === "function") {
      action(); 
      if (drawRef.current) {
        drawRef.current.changeMode("simple_select");
      } 
      if (["Draw", "Line", "Deduction"].includes(activeButton || "")) {
        setActiveButton(null);
      }
    } else {
      console.warn(`⚠ Action not found for button: ${name}`);
    }
  };
  
  const buttons: { name: string; icon: JSX.Element; action?: () => void }[] = [
    { name: "Draw", icon: <Pencil className="w-5 h-5" /> },
    { name: "Line", icon: <Minus className="w-5 h-5" /> },
    {
      name: "Deduction Area", 
      icon: <XOctagon className="w-5 h-5" />, 
    },
    {
      name: "Toggle Grid",
      icon: (
        <Grid
          className={`w-5 h-5 ${
            contextGridVisible ? "text-green-400" : "text-white"
          }`}
        />
      ),
      action: handleGridToggle,
    },
    {
      name: "Delete",
      icon: <Trash2 className="w-5 h-5" />,
      action: () => {
        deleteFeature(); 
        if (drawRef.current) {
          drawRef.current.changeMode("simple_select");
        }
        setActiveButton(null);
      },
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
  ];

  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 bg-[#0a1f44]/90 p-3 rounded-2xl shadow-xl border border-white/10 z-30">
      {buttons.map((btn, idx) => {
        const isToggableButton = ["Draw", "Line", "Deduction Area"].includes(
          btn.name
        ); 
        const modeName = btn.name === "Deduction Area" ? "Deduction" : btn.name; 
        const isCurrentlyActive = isToggableButton && activeButton === modeName;

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

            {(idx === 4 ||
              idx === 6 ||
              idx === 8) && (
              <div className="h-px bg-gray-600 my-1"></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}