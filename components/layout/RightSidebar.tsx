"use client";

import React, { useState } from "react";
import {
  Ruler,
  Landmark,
  Shuffle,
  Triangle,
  Square,
  Zap,
  Circle,
} from "lucide-react";
// Assuming this path for the context hook
import { useMapContext } from "../hooks/mapContext";

export default function RightSidebar() {
  // useMapContext se zaroori functions aur state nikalna
  const { selectedFeature, applyColorToSelectedFeature } = useMapContext();
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  const labels = [
  { name: "Ridge", color: "#FF0000", icon: <Ruler /> },        // Bright Red
  { name: "Hip", color: "#FFA500", icon: <Landmark /> },        // Orange
  { name: "Valley", color: "#800080", icon: <Shuffle /> },      // Purple
  { name: "Rake", color: "#0000FF", icon: <Triangle /> },       // Blue
  { name: "Eave", color: "#008000", icon: <Square /> },         // Green
  { name: "Flashing", color: "#008080", icon: <Zap /> },        // Teal
  { name: "Step Flashing", color: "#393939ff", icon: <Circle /> } // Dark Orange
];


  const handleClick = (label: { name: any; color?: string; icon?: React.JSX.Element; }) => {
    if (!selectedFeature) return;
    setActiveLabel(label.name);
    applyColorToSelectedFeature(label); // Pass full label object now
  };

  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 bg-[#0a1f44]/90 p-3 rounded-2xl shadow-lg border border-white/10 z-40">
      <h3 className="text-white text-sm text-center font-semibold mb-1">
        Labels
      </h3>
      {labels.map((l) => {
        const isActive = activeLabel === l.name;
        return (
          <button
            key={l.name}
            onClick={() => handleClick(l)}
            className={`flex flex-col items-center transition-all opacity-90 ${
              isActive ? "scale-105" : ""
            }`}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all"
              style={{
                borderColor: l.color,
                backgroundColor: isActive ? l.color : "transparent",
              }}
            >
              {React.cloneElement(l.icon, {
                className: "w-5 h-5",
                color: "white",
              })}
            </div>
            <span
              className={`text-[10px] mt-1 ${
                isActive ? "text-white" : "text-gray-300"
              }`}
            >
              {l.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
