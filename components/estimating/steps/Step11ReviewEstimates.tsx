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

      {/* Email Me & Text Me Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <button
          onClick={() => {
            // Email functionality - will be connected to backend later
            const emailBody = `Dear ${data.firstName || "Customer"},\n\nThank you for requesting an estimate. Here are your preliminary estimates:\n\n${estimates.filter(e => e.enabled !== false).map(e => `${e.type}: $${e.minPrice.toLocaleString()} - $${e.maxPrice.toLocaleString()}`).join("\n")}\n\nBest regards,\nSuperior Pro Roofing Systems`;
            window.location.href = `mailto:${data.email || ""}?subject=Preliminary Roof Estimate&body=${encodeURIComponent(emailBody)}`;
          }}
          className="flex-2 px-6 py-3 border-2 border-gray-300 text-red-700  rounded-lg font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Email Me / Text Me
        </button>
        {/* <button
          onClick={() => {
            // Text functionality - will be connected to backend later
            if (data.phone) {
              const textMessage = `Thank you for requesting an estimate from Superior Pro Roofing Systems. Your preliminary estimates are available. Please check your email for details.`;
              window.location.href = `sms:${data.phone.replace(/\D/g, "")}?body=${encodeURIComponent(textMessage)}`;
            } else {
              alert("Phone number is required to send text message.");
            }
          }}
          className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Text Me My Estimate
        </button> */}
      </div>
    </div>
  );
}
