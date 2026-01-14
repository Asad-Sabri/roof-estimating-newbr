"use client";

import Image from "next/image";
import { StepProps } from "../types";

export default function Step5Layers({ data, onInputChange }: StepProps) {
  const options = [
    {
      value: "1",
      label: "1 Layer",
      image:
        "https://litespeedconstruction.com/wp-content/uploads/2020/09/86BD1AC9-DE36-4336-B6F9-4A1DA0417EF0-2048x1536.jpeg",
      hasImage: true,
    },
    {
      value: "2",
      label: "2 Layers",
      image:
        "https://sundownexteriors.com/wp-content/uploads/2022/02/two-layers-roof-shingles.jpg",
      hasImage: true,
    },
    {
      value: "3",
      label: "3 Layers",
      image:
        "https://safeharborinspections.com/wp-content/uploads/2021/02/roof-shigle-layers-1100x619.png",
      hasImage: true,
    },
    {
      value: "I do not know",
      label: "I do not know",
      image: "",
      hasImage: false,
    },
  ];

  return (
    <div className="space-y-6">
      <p className="text-gray-600">How many layers currently on your roof?</p>
      <div className="grid grid-cols-2 gap-4">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onInputChange("roofLayers", option.value)}
            className={`p-6 border-2 rounded-lg text-center transition-all overflow-hidden ${
              data.roofLayers === option.value
                ? ""
                : "border-gray-200 hover:border-gray-300"
            }`}
            style={data.roofLayers === option.value ? { borderColor: "#959595", backgroundColor: "rgba(149, 149, 149, 0.1)" } : {}}
          >
            {option.hasImage ? (
              <div className="w-full h-40 rounded mb-3 overflow-hidden bg-gray-100">
                <Image
                  src={option.image}
                  alt={option.label}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-full h-40 rounded mb-3 overflow-hidden bg-gray-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            )}
            <div className="font-semibold text-gray-900 text-lg">
              {option.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
