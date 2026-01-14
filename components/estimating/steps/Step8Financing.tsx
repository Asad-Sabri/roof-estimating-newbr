"use client";

import { StepProps } from "../types";

export default function Step8Financing({ data, onInputChange }: StepProps) {
  const options = ["Yes", "No", "Maybe"];

  return (
    <div className="space-y-6">
      <p className="text-gray-600">Are you interested in financing options?</p>
      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onInputChange("financingInterest", option)}
            className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
              data.financingInterest === option
                ? ""
                : "border-gray-200 hover:border-gray-300"
            }`}
            style={data.financingInterest === option ? { borderColor: "#959595", backgroundColor: "rgba(149, 149, 149, 0.1)" } : {}}
          >
            <div className="font-semibold text-gray-900">{option}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
