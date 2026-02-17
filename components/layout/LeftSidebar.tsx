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
    rotateMapCCW,
    rotateMapCW,
    toggleLabels,
    labelsVisible,
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
        if (drawRef.current) drawRef.current.changeMode("simple_select");
      } else {
        setActiveButton(name);
        if (name === "Draw") drawPolygon();
        if (name === "Line") drawLine();
        if (name === "Deduction") drawDeductionPolygon();
      }
    },
    [activeButton, drawPolygon, drawLine, drawDeductionPolygon, drawRef]
  );

  const handleGridToggle = useCallback(() => {
    toggleGrid(!contextGridVisible);
  }, [toggleGrid, contextGridVisible]);

  const handleClick = (name: string, action?: () => void) => {
    if (name === "Draw") return handleDrawToggle("Draw");
    if (name === "Line") return handleDrawToggle("Line");
    if (name === "Deduction Area") return handleDrawToggle("Deduction");

    if (typeof action === "function") {
      action();
      if (drawRef.current) drawRef.current.changeMode("simple_select");
      setActiveButton(null);
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
            contextGridVisible ? "text-green-600" : "text-[#8b0e0f]"
          }`}
        />
      ),
      action: handleGridToggle,
    },

    {
      name: "Delete",
      icon: <Trash2 className="w-5 h-5" />,
      action: deleteFeature,
    },

    { name: "Undo", icon: <RotateCcw className="w-5 h-5" />, action: undo },
    { name: "Redo", icon: <RotateCw className="w-5 h-5" />, action: redo },

    // ⭐ Updated Rotation Buttons (MAP ONLY)
    {
      name: "Rotate L",
      icon: <RotateCcw className="w-5 h-5" />,
      action: rotateMapCCW,
    },
    {
      name: "Rotate R",
      icon: <RotateCw className="w-5 h-5" />,
      action: rotateMapCW,
    },
    {
      name: labelsVisible ? "Hide Labels" : "Show Labels", // Name update hota hai
      icon: labelsVisible ? (
        <EyeOff className="w-5 h-5" />
      ) : (
        <Eye className="w-5 h-5" />
      ),
      action: toggleLabels, // Yahan sirf toggleLabels function call kiya gaya hai
    },
  ];

  return (
    <div className="absolute left-4 mt-5 top-1/2 -translate-y-1/2 flex flex-col gap-3 bg-white p-3 rounded-2xl shadow-xl border border-gray-200 z-30">
      {buttons.map((btn, idx) => {
        const toggleBtns = ["Draw", "Line", "Deduction Area"];
        const modeName = btn.name === "Deduction Area" ? "Deduction" : btn.name;
        const isActive =
          toggleBtns.includes(btn.name) && activeButton === modeName;

        return (
          <React.Fragment key={btn.name}>
            <button
              type="button"
              onClick={() => handleClick(btn.name, btn.action)}
              className={`flex flex-col items-center transition-all ${
                isActive
                  ? "scale-105 rounded-lg py-1 text-white"
                  : "text-gray-700 hover:bg-gray-100 [&_svg]:text-[#8b0e0f]"
              }`}
              style={isActive ? { backgroundColor: "#8b0e0f" } : {}}
            >
              {btn.icon}
              <span className={`text-xs ${isActive ? "text-white" : "text-gray-600"}`}>{btn.name}</span>
            </button>

            {(idx === 2 || idx === 4 || idx === 6 || idx === 8) && (
              <div className="h-px bg-gray-200 my-1"></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
