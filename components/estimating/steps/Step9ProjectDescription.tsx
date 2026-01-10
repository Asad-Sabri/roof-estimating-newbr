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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
