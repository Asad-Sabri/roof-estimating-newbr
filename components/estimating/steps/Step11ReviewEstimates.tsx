"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { StepProps } from "../types";
import { generateEstimateReportPdfFromHtml } from "@/utils/estimateReportPdfFromHtml";
import { sendPdfsAPI } from "@/services/emailAPI";

export default function Step11ReviewEstimates({
  data,
  onInputChange,
}: StepProps) {
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleSendReportToEmail = async () => {
    const email = (data.email || "").trim();
    if (!email) {
      toast.error("Please go back and enter your email to receive the report.");
      return;
    }
    setIsSendingEmail(true);
    try {
      toast.info("Sending report to your email...");
      const coords = data.coordinates;
      const mapUrl =
        coords && process.env.NEXT_PUBLIC_MAPBOX_TOKEN
          ? `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/pin-l+ff0000(${coords.lng},${coords.lat})/${coords.lng},${coords.lat},20/640x360@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
          : "";
      const estimateRecord = {
        address: data.address,
        totalArea: data.totalArea,
        roofSteepness: data.roofSteepness,
        buildingType: data.buildingType,
        currentRoofType: data.currentRoofType,
        roofLayers: data.roofLayers,
        desiredRoofType: data.desiredRoofType,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        estimates: data.estimates,
      };
      const pdfBlob = await generateEstimateReportPdfFromHtml({ estimate: estimateRecord, mapUrl });
      await sendPdfsAPI(pdfBlob, email);
      toast.success("Report sent to your email!");
    } catch (err: any) {
      console.error("Email report failed:", err);
      const msg = err?.response?.data?.message || err?.message || "Could not send report. Please try again.";
      toast.error(msg);
    } finally {
      setIsSendingEmail(false);
    }
  };

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

      {/* Click email to send report */}
      {data.email?.trim() && (
        <p className="text-sm text-gray-600 mt-4">
          Send instant estimate report to{" "}
          <button
            type="button"
            onClick={handleSendReportToEmail}
            disabled={isSendingEmail}
            className="text-[#8b0e0f] font-semibold underline hover:no-underline focus:outline-none disabled:opacity-50"
          >
            {data.email.trim()}
          </button>
          {isSendingEmail && " — Sending..."}
        </p>
      )}

      {/* Send report to my email */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <button
          type="button"
          onClick={handleSendReportToEmail}
          disabled={isSendingEmail}
          className="flex-2 px-6 py-3 border-2 border-gray-300 text-red-700 rounded-lg font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          {isSendingEmail ? "Sending..." : "Send report to my email"}
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
