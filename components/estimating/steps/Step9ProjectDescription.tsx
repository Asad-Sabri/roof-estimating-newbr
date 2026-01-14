"use client";

import { StepProps } from "../types";

export default function Step9ProjectDescription({
  data,
  onInputChange,
}: StepProps) {
  return (
    <div className="space-y-6">
      <p className="text-gray-600">Tell us about your project (optional)</p>
      <div>
        <textarea
          value={data.projectDescription || ""}
          onChange={(e) => onInputChange("projectDescription", e.target.value)}
          placeholder="Any additional details about your roofing project..."
          rows={6}
          className="w-full px-4 pt-5 pb-70 text-black border border-gray-300 rounded-lg focus:outline-none"
          onFocus={(e) => e.currentTarget.style.boxShadow = "0 0 0 2px #8b0e0f"}
          onBlur={(e) => e.currentTarget.style.boxShadow = ""}
        />
      </div>
    </div>
  );
}
