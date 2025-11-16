"use client";

import { Pencil, Minus, Trash2, RotateCcw, RotateCw, Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
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
  } = useMapContext();

  const [activeButton, setActiveButton] = useState<string | null>(null);

  const handleClick = (name: string, action: () => void) => {
    action();
    setActiveButton(name);
  };

  const buttons = [
    { name: "Draw", icon: <Pencil className="w-5 h-5" />, action: drawPolygon },
    { name: "Line", icon: <Minus className="w-5 h-5" />, action: drawLine },
    { name: "Delete", icon: <Trash2 className="w-5 h-5" />, action: deleteFeature },
    { name: "Undo", icon: <RotateCcw className="w-5 h-5" />, action: undo },
    { name: "Redo", icon: <RotateCw className="w-5 h-5" />, action: redo },
    { name: "Rotate L", icon: <RotateCcw className="w-5 h-5" />, action: rotateLeft },
    { name: "Rotate R", icon: <RotateCw className="w-5 h-5" />, action: rotateRight },
    {
      name: labelsVisible ? "Hide Labels" : "Show Labels",
      icon: labelsVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />,
      action: toggleLabels,
    },
  ];

  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 bg-[#0a1f44]/90 p-3 rounded-2xl shadow-xl border border-white/10 z-30">
      {buttons.map((btn, idx) => (
        <React.Fragment key={btn.name}>
          <button
            onClick={() => handleClick(btn.name, btn.action)}
            className={`flex flex-col items-center transition-all ${
              activeButton === btn.name ? "scale-105 bg-white/20 rounded-lg py-1" : "text-white"
            }`}
          >
            {btn.icon}
            <span className="text-xs  text-gray-200">{btn.name}</span>
          </button>
          {(idx === 2 || idx === 4 || idx === 6) && <div className="h-px bg-gray-600 my-1"></div>}
        </React.Fragment>
      ))}
    </div>
  );
}
