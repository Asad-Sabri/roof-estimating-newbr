"use client";

import { StepProps } from "../types";

export default function Step11ReviewEstimates({
  data,
  onInputChange,
}: StepProps) {
  // Use estimates from data if available, otherwise use default
  const estimates = data.estimates || [
    {
      type: "Roof Repair and Maintenance",
      minPrice: 1951,
      maxPrice: 2156,
      enabled: true,
    },
    {
      type: "Asphalt Roof",
      minPrice: 26008,
      maxPrice: 28746,
      enabled: true,
    },
    {
      type: "Metal Roof",
      minPrice: 65020,
      maxPrice: 71864,
      enabled: true,
    },
    {
      type: "Tile Roof",
      minPrice: 91028,
      maxPrice: 100610,
      enabled: true,
    },
  ];

  const handleToggleEstimate = (index: number) => {
    const updatedEstimates = [...estimates];
    updatedEstimates[index] = {
      ...updatedEstimates[index],
      enabled: !updatedEstimates[index].enabled,
    };
    onInputChange("estimates", updatedEstimates);
  };

  // For now, show all estimates with toggles (Admin functionality would be backend-driven)
  const isAdmin = false; // This would come from auth context in production

  return (
    <div className="space-y-6">
      <p className="text-gray-600 mb-6">Review your estimate:</p>
      {isAdmin && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800 font-semibold">
            Admin Mode: Toggle which estimates appear to customers
          </p>
        </div>
      )}
      <div className="space-y-4">
        {estimates.map((estimate, index) => (
          <div
            key={index}
            className={`border-2 rounded-lg p-6 transition-all ${
              estimate.enabled !== false
                ? "border-gray-200"
                : "border-gray-200 bg-gray-50 opacity-60"
            }`}
            onMouseEnter={(e) => {
              if (estimate.enabled !== false) {
                e.currentTarget.style.borderColor = "#8b0e0f";
              }
            }}
            onMouseLeave={(e) => {
              if (estimate.enabled !== false) {
                e.currentTarget.style.borderColor = "";
              }
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {estimate.type}
                </h3>
                {estimate.enabled !== false && (
                  <>
                    <p className="text-2xl font-bold" style={{ color: "#8b0e0f" }}>
                      ${estimate.minPrice.toLocaleString()} - $
                      {estimate.maxPrice.toLocaleString()}*
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      *Preliminary estimate. Final pricing subject to
                      inspection.
                    </p>
                  </>
                )}
                {estimate.enabled === false && (
                  <p className="text-sm text-gray-500 italic">
                    This estimate is hidden
                  </p>
                )}
              </div>
              {(isAdmin || true) && ( // Always show toggle for now - in production, check admin role
                <label className="flex items-center ml-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={estimate.enabled !== false}
                    onChange={() => handleToggleEstimate(index)}
                    className="h-5 w-5 border-gray-300 rounded"
                    style={{ accentColor: "#8b0e0f" }}
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    {estimate.enabled !== false ? "Show" : "Hide"}
                  </span>
                </label>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
        <p className="text-xs text-gray-600">
          <span className="font-semibold">Note:</span> Only enabled estimates
          will be sent to the customer.
          {!isAdmin && " Admin can toggle estimates on/off."}
        </p>
      </div>
    </div>
  );
}
