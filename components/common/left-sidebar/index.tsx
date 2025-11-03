"use client";
import React, { useState } from "react";
import {
  Ruler,
  Square,
  Zap,
  Triangle,
  Circle,
  Shuffle,
  Landmark,
} from "lucide-react";

interface RoofLabel {
  name: string;
  color: string;
  icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
}

interface LeftSidebarProps {
  onSelectLabel?: (label: RoofLabel) => void; // ✅ parent ko label bhejne ke liye
}

const roofLabels: RoofLabel[] = [
  { name: "Ridge", color: "#e74c3c", icon: <Ruler className="" /> },
  { name: "Hip", color: "#f39c12", icon: <Landmark className="" /> },
  { name: "Valley", color: "#8e44ad", icon: <Shuffle className="" /> },
  { name: "Rake", color: "#2980b9", icon: <Triangle className="" /> },
  { name: "Eave", color: "#27ae60", icon: <Square className="" /> },
  { name: "Flashing", color: "#16a085", icon: <Zap className="" /> },
  { name: "Step Flashing", color: "#d35400", icon: <Circle className="" /> },
  { name: "Transition", color: "#2c3e50", icon: <Triangle className="" /> },
];

const LeftSidebar: React.FC<LeftSidebarProps> = ({ onSelectLabel }) => {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const handleSelect = (label: RoofLabel) => {
    setSelectedLabel(label.name);
    if (onSelectLabel) onSelectLabel(label); // ✅ parent ko bhejna
  };

  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 bg-[#0a1f44]/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-white/10 z-30">
      <h3 className="text-white text-sm text-center font-semibold mb-1">
        Labels
      </h3>

      {roofLabels.map((label) => {
        const isSelected = selectedLabel === label.name;
        return (
          <button
            key={label.name}
            onClick={() => handleSelect(label)}
            className={`flex flex-col items-center transition-all duration-200 ${
              isSelected ? "scale-110" : "opacity-90"
            }`}
          >
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-full border-2 ${
                isSelected ? "bg-white/10" : ""
              }`}
              style={{
                borderColor: label.color,
              }}
            >
              {React.cloneElement(label.icon, {
                className: "w-5 h-5",
                color: isSelected ? label.color : "white",
              })}
            </div>
            <span
              className={`text-[10px] mt-1 ${
                isSelected ? "text-white font-semibold" : "text-gray-300"
              }`}
            >
              {label.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default LeftSidebar;
