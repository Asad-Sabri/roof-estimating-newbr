"use client";

import React, { useState } from "react";
import { Ruler, Landmark, Shuffle, Triangle, Square, Zap, Circle } from "lucide-react";
import { useMapContext } from "../hooks/mapContext";

export default function RightSidebar() {
  const { selectedFeature, applyColorToSelectedFeature } = useMapContext();
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  const labels = [
    { name: "Ridge", color: "#e74c3c", icon: <Ruler /> },
    { name: "Hip", color: "#f39c12", icon: <Landmark /> },
    { name: "Valley", color: "#8e44ad", icon: <Shuffle /> },
    { name: "Rake", color: "#2980b9", icon: <Triangle /> },
    { name: "Eave", color: "#27ae60", icon: <Square /> },
    { name: "Flashing", color: "#16a085", icon: <Zap /> },
    { name: "Step Flashing", color: "#d35400", icon: <Circle /> },
  ];

  const handleClick = (label: { name: string; color: string }) => {
    if (!selectedFeature) return;
    setActiveLabel(label.name);
    applyColorToSelectedFeature(label.color);
  };

  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 bg-[#0a1f44]/90 p-3 rounded-2xl shadow-lg border border-white/10 z-40">
      <h3 className="text-white text-sm text-center font-semibold mb-1">Labels</h3>
      {labels.map((l) => {
        const isActive = activeLabel === l.name;
        return (
          <button key={l.name} onClick={() => handleClick(l)}
            className={`flex flex-col items-center transition-all opacity-90 ${isActive ? "scale-105" : ""}`}>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all"
              style={{ borderColor: l.color, backgroundColor: isActive ? l.color : "transparent" }}
            >
              {React.cloneElement(l.icon, { className: "w-5 h-5", color: "white" })}
            </div>
            <span className={`text-[10px] mt-1 ${isActive ? "text-white" : "text-gray-300"}`}>{l.name}</span>
          </button>
        );
      })}
    </div>
  );
}
