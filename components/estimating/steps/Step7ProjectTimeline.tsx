"use client";

import { StepProps } from "../types";

export default function Step7ProjectTimeline({
  data,
  onInputChange,
}: StepProps) {
  const options = ["Now", "In 1-3 months", "No timeline"];

  return (
    <div className="space-y-6">
      <p className="text-gray-600">
        When would you like to start your project?
      </p>
      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onInputChange("projectTimeline", option)}
            className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
              data.projectTimeline === option
                ? ""
                : "border-gray-200 hover:border-gray-300"
            }`}
            style={data.projectTimeline === option ? { borderColor: "#959595", backgroundColor: "rgba(149, 149, 149, 0.1)" } : {}}
          >
            <div className="font-semibold text-gray-900">{option}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
