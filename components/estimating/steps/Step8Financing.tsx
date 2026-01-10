"use client";

import { StepProps } from "../types";

export default function Step8Financing({ data, onInputChange }: StepProps) {
  const options = ["Yes", "No", "Maybe"];

  return (
    <div className="space-y-6">
      <p className="text-gray-600">Are you interested in financing options?</p>
      <div className="grid grid-cols-3 gap-4">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onInputChange("financingInterest", option)}
            className={`p-4 border-2 rounded-lg text-center transition-all ${
              data.financingInterest === option
                ? "border-green-600 bg-green-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="font-semibold text-gray-900">{option}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
