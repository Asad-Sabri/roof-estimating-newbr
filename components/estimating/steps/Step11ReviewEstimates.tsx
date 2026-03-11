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
      // Only the selected estimate goes in the report
      const selectedIndex = data.selectedEstimateIndex ?? 0;
      const selectedEstimates = data.estimates && data.estimates[selectedIndex]
        ? [data.estimates[selectedIndex]]
        : (data.estimates && data.estimates.length ? [data.estimates[0]] : []);
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
        estimates: selectedEstimates,
      };
      const pdfBlob = await generateEstimateReportPdfFromHtml({ estimate: estimateRecord, mapUrl });
      await sendPdfsAPI(pdfBlob, email);
      toast.success("Report sent to your email!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Could not send report. Please try again.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const estimates = data.estimates || [];
  const selectedIndex = data.selectedEstimateIndex ?? (estimates.length ? 0 : null);

  const handleSelectEstimate = (index: number) => {
    onInputChange("selectedEstimateIndex", index);
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-600 mb-6">
        Select one estimate. Only your selection will appear in the report and be saved.
      </p>
      <div className="space-y-4">
        {estimates.map((estimate, index) => {
          const isSelected = selectedIndex === index;
          return (
            <div
              key={index}
              role="button"
              tabIndex={0}
              onClick={() => handleSelectEstimate(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelectEstimate(index);
                }
              }}
              className={`border-2 rounded-lg p-6 transition-all cursor-pointer ${
                isSelected ? "border-[#8b0e0f] bg-red-50/30" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className={`mt-1 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                      isSelected ? "border-[#8b0e0f] bg-[#8b0e0f]" : "border-gray-400"
                    }`}
                  >
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {estimate.type}
                    </h3>
                    <p className="text-2xl font-bold" style={{ color: "#8b0e0f" }}>
                      ${estimate.minPrice?.toLocaleString() ?? 0} - $
                      {estimate.maxPrice?.toLocaleString() ?? 0}*
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      *Preliminary estimate. Final pricing subject to inspection.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
      </div>
    </div>
  );
}
