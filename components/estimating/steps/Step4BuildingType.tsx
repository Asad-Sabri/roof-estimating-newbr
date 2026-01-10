"use client";

import Image from "next/image";
import { StepProps } from "../types";

export default function Step4BuildingType({ data, onInputChange }: StepProps) {
  const options = [
    {
      value: "Residential",
      label: "Residential",
      image: "https://app.roofr.com/images/estimator/residential.jpeg",
    },
    {
      value: "Commercial",
      label: "Commercial",
      image: "https://app.roofr.com/images/estimator/commercial.jpeg",
    },
  ];

  return (
    <div className="space-y-6">
      <p className="text-gray-600">What type of building is this?</p>
      <div className="grid grid-cols-2 gap-4">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onInputChange("buildingType", option.value)}
            className={`p-6 border-2 rounded-lg text-center transition-all overflow-hidden ${
              data.buildingType === option.value
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
            <div className="font-semibold text-gray-900 text-lg">
              {option.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
