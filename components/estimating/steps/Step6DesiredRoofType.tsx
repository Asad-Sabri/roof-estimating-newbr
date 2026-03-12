"use client";

import Image from "next/image";
import { StepProps } from "../types";
import { ROOF_TYPE_CATEGORIES, getEstimatingSystemsForCategory } from "@/lib/roofTypeSystemMatrix";

export default function Step6DesiredRoofType({
  data,
  onInputChange,
}: StepProps) {
  const category = (data.desiredRoofTypeCategory || "") as "" | "flat" | "steep" | "tile" | "metal";
  const options = getEstimatingSystemsForCategory(category);

  return (
    <div className="space-y-6">
      <p className="text-gray-600">What type of roof would you like?</p>
      <div className="mb-4">
        <label className="block text-sm font-medium text-black mb-2">Roof type (category)</label>
        <select
          value={category}
          onChange={(e) => {
            const cat = e.target.value as "flat" | "steep" | "tile" | "metal";
            onInputChange("desiredRoofTypeCategory", cat || undefined);
            const compatible = getEstimatingSystemsForCategory(cat);
            const currentInCompatible = compatible.some((s) => s.value === data.desiredRoofType);
            if (!currentInCompatible) onInputChange("desiredRoofType", undefined);
          }}
          className="w-full max-w-xs border border-gray-300 text-black rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-[#8b0e0f] outline-none"
        >
          <option value="" className="text-black">Select roof type first</option>
          {ROOF_TYPE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>
      {!category ? (
        <p className="text-gray-500 text-sm">Select a roof type above to see compatible systems.</p>
      ) : (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onInputChange("desiredRoofType", option.value)}
            className={`p-4 border-2 rounded-lg text-center transition-all overflow-hidden ${
              data.desiredRoofType === option.value
                ? ""
                : "border-gray-200 hover:border-gray-300"
            }`}
            style={data.desiredRoofType === option.value ? { borderColor: "#959595", backgroundColor: "rgba(149, 149, 149, 0.1)" } : {}}
          >
            <div className="w-full h-36 rounded mb-2 overflow-hidden bg-gray-100">
              {option.image && (
                <Image
                  src={option.image}
                  alt={option.label}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              )}
            </div>
            <div className="font-semibold text-sm text-gray-900">
              {option.label}
            </div>
          </button>
        ))}
      </div>
      )}
    </div>
  );
}
