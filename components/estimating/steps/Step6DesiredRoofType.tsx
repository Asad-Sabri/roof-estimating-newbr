"use client";

import Image from "next/image";
import { StepProps } from "../types";

export default function Step6DesiredRoofType({
  data,
  onInputChange,
}: StepProps) {
  // Same roof material images as Step 5 for consistency
  const options = [
    {
      value: "Asphalt",
      label: "Asphalt",
      image:
        "https://app.roofr.com/images/instant-estimates/materials/asphalt.jpg",
    },
    {
      value: "Metal",
      label: "Metal",
      image:
        "https://app.roofr.com/images/instant-estimates/materials/metal.jpg",
    },
    {
      value: "Tile",
      label: "Tile",
      image:
        "https://app.roofr.com/images/instant-estimates/materials/tile.jpg",
    },
  ];

  return (
    <div className="space-y-6">
      <p className="text-gray-600">What type of roof would you like?</p>
      <div className="grid grid-cols-3 gap-4">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onInputChange("desiredRoofType", option.value)}
            className={`p-4 border-2 rounded-lg text-center transition-all overflow-hidden ${
              data.desiredRoofType === option.value
                ? "border-green-600 bg-green-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="w-full h-44 rounded mb-3 overflow-hidden bg-gray-100">
              <Image
                src={option.image}
                alt={option.label}
                width={400}
                height={300}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            <div className="font-semibold text-gray-900">{option.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
