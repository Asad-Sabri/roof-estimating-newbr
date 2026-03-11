"use client";

import {
  Globe,
  Phone,
  Mail,
  BadgeCheck,
} from "lucide-react";

export type EstimateRecord = {
  id?: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
  totalArea?: number;
  roofSteepness?: string;
  buildingType?: string;
  currentRoofType?: string;
  roofLayers?: string;
  desiredRoofType?: string;
  projectTimeline?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  estimates?: Array<{
    type: string;
    minPrice: number;
    maxPrice: number;
    enabled?: boolean;
  }>;
  createdAt?: string;
};

export type CompanyProfile = {
  companyName: string;
  licenseNumber?: string;
  phone?: string;
  email?: string;
  website?: string;
  addressLine?: string;
  disclaimer?: string;
  contactPersonName?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  followUpText?: string;
  whatsIncluded?: string[];
};

const WHATS_INCLUDED_LEFT = [
  "Tear-off and proper disposal of existing roofing materials.",
  "Flashings, pipe boots, vents, and necessary sealants.",
  "Jobsite protection, magnet sweep, and daily cleanup.",
  "Final walk-through with project specialist.",
];
const WHATS_INCLUDED_RIGHT = [
  "Install ice & water shield and synthetic underlayment.",
  "Starter, field, and ridge materials per selected system.",
  "Manufacturer and workmanship warranty (per selection).",
  "Permit and inspection coordination where applicable.",
];

function currency(n: number | undefined) {
  if (!n && n !== 0) return "—";
  return `$${Math.round(n).toLocaleString()}`;
}

interface EstimateReportContentProps {
  estimate: EstimateRecord;
  company: CompanyProfile;
  mapUrl?: string;
  /** For PDF: hide interactive elements (e.g. mailto link as span) */
  forPdf?: boolean;
}

export function EstimateReportContent({
  estimate,
  company,
  mapUrl = "",
  forPdf = false,
}: EstimateReportContentProps) {
  const customerName =
    estimate.firstName && estimate.lastName
      ? `${estimate.firstName} ${estimate.lastName}`
      : estimate.name || "Customer";

  const allEstimates = (estimate.estimates || []).filter((e) => e.enabled !== false);
  const desired = (estimate.desiredRoofType || "").toLowerCase();
  const highlight =
    allEstimates.find(
      (e) =>
        e.type.toLowerCase().includes(desired) ||
        desired.includes((e.type.toLowerCase().split(" ")[0] || "").trim())
    ) ||
    allEstimates.find((e) => e.type.toLowerCase().includes("tile")) ||
    allEstimates[0];

  const roofDetailsRows: [string, string][] = [
    ["Building", estimate.buildingType || "N/A"],
    ["Steepness", estimate.roofSteepness || "N/A"],
    ["Current Roof", estimate.currentRoofType || "Not specified"],
    ["Desired Roof", estimate.desiredRoofType || "N/A"],
    ["Layers", estimate.roofLayers || "N/A"],
    [
      "Total Area",
      estimate.totalArea != null
        ? `${Math.round(estimate.totalArea).toLocaleString()} sq ft`
        : "N/A",
    ],
  ];

  const textSize = forPdf ? "text-[11px] sm:text-xs" : "text-sm";
  const headingSize = forPdf ? "text-base sm:text-lg" : "text-lg sm:text-xl";
  const subHeadingSize = forPdf ? "text-sm sm:text-base" : "text-xl sm:text-2xl";

  return (
    <div
      className={`estimate-report-content rounded-xl overflow-visible ${forPdf ? "text-[11px]" : ""}`}
      style={{
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
      }}
    >
      {/* Company header - inline colors so html2canvas does not hit lab() */}
      <div
        className="px-3 sm:px-4 lg:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 flex-wrap"
        style={{ borderBottom: "1px solid #e5e7eb" }}
      >
        <div className="min-w-0 flex-1">
          <h1 className={`${headingSize} font-bold break-words`} style={{ color: "#065f46" }}>
            {company.companyName}
          </h1>
          {company.addressLine && (
            <p className={`${textSize} mt-0.5 break-words`} style={{ color: "#4b5563" }}>{company.addressLine}</p>
          )}
        </div>
        <div className={`${textSize} flex flex-col gap-0.5 sm:gap-1 shrink-0`} style={{ color: "#4b5563" }}>
          {company.licenseNumber && (
            <span className="inline-flex items-center gap-1.5">
              <BadgeCheck className="w-4 h-4 shrink-0" style={{ color: "#059669" }} />
              {company.licenseNumber}
            </span>
          )}
          {company.phone && (
            <span className="inline-flex items-center gap-1.5">
              <Phone className="w-4 h-4 shrink-0" />
              {company.phone}
            </span>
          )}
          {company.email && (
            <span className="inline-flex items-center gap-1.5">
              <Mail className="w-4 h-4 shrink-0" />
              {company.email}
            </span>
          )}
          {company.website && (
            <span className="inline-flex items-center gap-1.5">
              <Globe className="w-4 h-4 shrink-0" />
              {company.website}
            </span>
          )}
          {(company.contactPersonName || company.contactPersonPhone || company.contactPersonEmail) && (
            <div className="pt-1 mt-0.5" style={{ borderTop: "1px solid #e5e7eb" }}>
              <span className={`${textSize} font-medium`} style={{ color: "#374151" }}>Contact person</span>
              {company.contactPersonName && (
                <span className="block mt-0.5">{company.contactPersonName}</span>
              )}
              {company.contactPersonPhone && (
                <span className="inline-flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  {company.contactPersonPhone}
                </span>
              )}
              {company.contactPersonEmail && (
                <span className="inline-flex items-center gap-1.5 mt-0.5 block">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  {company.contactPersonEmail}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preliminary / Customer */}
      <div className="px-3 sm:px-4 lg:px-6 pt-4 pb-3">
        <p className={`${textSize} uppercase tracking-wider`} style={{ color: "#6b7280" }}>PRELIMINARY</p>
        <h2 className={`${subHeadingSize} font-extrabold mt-0.5`} style={{ color: "#8b0e0f" }}>
          Roofing Estimate For: <span style={{ color: "#111827" }} className="break-words">{customerName}</span>
        </h2>
        {estimate.address && (
          <p className={`${textSize} mt-0.5 break-words`} style={{ color: "#374151" }}>{estimate.address}</p>
        )}
      </div>

      {/* Map + Roof Details */}
      <div className="px-3 sm:px-4 lg:px-6 pb-4 grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <div className="rounded-lg overflow-hidden min-w-0" style={{ border: "1px solid #e5e7eb", background: "#f9fafb" }}>
          <p className={`px-3 py-1.5 ${textSize} font-semibold uppercase tracking-wider`} style={{ color: "#6b7280", borderBottom: "1px solid #e5e7eb", background: "#f3f4f6" }}>
            Property Location
          </p>
          {mapUrl ? (
            <div className="relative w-full aspect-video min-h-[160px] sm:min-h-[200px]">
              <img
                src={mapUrl}
                alt="Property location map"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-video min-h-[160px] sm:min-h-[200px] flex flex-col items-center justify-center gap-2 px-3" style={{ background: "#f3f4f6" }}>
              <span className={`${textSize} text-center`} style={{ color: "#6b7280" }}>
                Map preview not available
              </span>
              {estimate.address && !forPdf && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(estimate.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${textSize} font-medium text-[#8b0e0f] hover:underline`}
                >
                  View address on map
                </a>
              )}
            </div>
          )}
        </div>

        <div className="rounded-xl overflow-x-auto overflow-y-visible min-w-0" style={{ border: "1px solid #e5e7eb" }}>
          <div className={`px-3 py-2 text-white font-semibold ${textSize}`} style={{ backgroundColor: "#8b0e0f" }}>
            Roof Details
          </div>
          <div className="overflow-x-auto min-w-0">
            <table className="w-full min-w-0 table-fixed" cellPadding={0} cellSpacing={0} style={{ tableLayout: "fixed" }}>
              <tbody>
                {roofDetailsRows.map(([label, value]) => (
                  <tr key={label} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td className={`py-2 px-3 w-[38%] ${textSize} break-words`} style={{ color: "#6b7280" }}>{label}</td>
                    <td className={`py-2 px-3 font-medium break-words ${textSize}`} style={{ color: "#111827" }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Preliminary estimate + All Pricing Options */}
      <div className="px-3 sm:px-4 lg:px-6 pb-4 grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-xl overflow-hidden min-w-0" style={{ border: "1px solid #e5e7eb" }}>
          <div className={`px-3 py-2 text-white font-semibold ${textSize}`} style={{ backgroundColor: "#8b0e0f" }}>
            Preliminary Roof Estimate
          </div>
          <div className="px-3 py-4 text-center">
            {highlight ? (
              <>
                <div className={forPdf ? "text-lg font-bold" : "text-xl sm:text-2xl font-bold"} style={{ color: "#8b0e0f" }}>
                  {currency(highlight.minPrice)}
                </div>
                <div className={`${textSize} mt-0.5`} style={{ color: "#6b7280" }}>to</div>
                <div className={forPdf ? "text-base font-bold" : "text-lg sm:text-xl font-bold"} style={{ color: "#8b0e0f" }}>
                  {currency(highlight.maxPrice)}
                </div>
                <p className={`${textSize} mt-1 break-words`} style={{ color: "#4b5563" }}>{highlight.type}</p>
                <p className={`${textSize} mt-2`} style={{ color: "#6b7280" }}>
                  *Preliminary estimate. Subject to on-site inspection.
                </p>
              </>
            ) : (
              <p className={textSize} style={{ color: "#6b7280" }}>No estimate data</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl overflow-x-auto overflow-y-visible min-w-0" style={{ border: "1px solid #e5e7eb" }}>
          <div className={`px-3 py-2 font-semibold text-white ${textSize}`} style={{ backgroundColor: "#8b0e0f" }}>
            All Pricing Options
          </div>
          <div className="overflow-x-auto min-w-0">
            <table className="w-full min-w-0 table-fixed" cellPadding={0} cellSpacing={0} style={{ tableLayout: "fixed" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  <th className={`py-2 px-3 text-left font-semibold w-[55%] ${textSize}`} style={{ color: "#374151" }}>Option</th>
                  <th className={`py-2 px-3 text-right font-semibold ${textSize}`} style={{ color: "#374151" }}>Price Range</th>
                </tr>
              </thead>
              <tbody>
                {allEstimates.length === 0 ? (
                  <tr>
                    <td colSpan={2} className={`py-4 px-3 text-center ${textSize}`} style={{ color: "#6b7280" }}>
                      No options available.
                    </td>
                  </tr>
                ) : (
                  allEstimates.map((o, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: "1px solid #f3f4f6",
                        ...(o === highlight ? { background: "rgba(254, 242, 242, 0.5)" } : {}),
                      }}
                    >
                      <td className={`py-2 px-3 font-medium break-words ${textSize}`} style={{ color: "#111827" }}>{o.type}</td>
                      <td className={`py-2 px-3 text-right font-semibold whitespace-nowrap ${textSize}`} style={{ color: "#8b0e0f" }}>
                        {currency(o.minPrice)} – {currency(o.maxPrice)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* What's Included - second page in PDF (class used by html2pdf pagebreak) */}
      <div
        className={forPdf ? "page-break-before pt-6 px-3 sm:px-4 lg:px-6 pb-4" : "pt-4 sm:pt-6 px-3 sm:px-4 lg:px-6 pb-4"}
        style={forPdf ? { pageBreakBefore: "always", marginTop: "1rem" } : undefined}
      >
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
          <div className={`px-3 py-2 font-semibold ${textSize}`} style={{ background: "#f9fafb", color: "#111827", borderBottom: "1px solid #e5e7eb" }}>
            What&apos;s Included
          </div>
          <div className={`px-3 py-3 sm:px-4 sm:py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 ${textSize}`} style={{ color: "#374151" }}>
            {company.whatsIncluded && company.whatsIncluded.length > 0 ? (
              <>
                <ul className="list-disc list-inside space-y-1">
                  {company.whatsIncluded.slice(0, Math.ceil(company.whatsIncluded.length / 2)).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <ul className="list-disc list-inside space-y-1">
                  {company.whatsIncluded.slice(Math.ceil(company.whatsIncluded.length / 2)).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <ul className="list-disc list-inside space-y-1">
                  {WHATS_INCLUDED_LEFT.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <ul className="list-disc list-inside space-y-1">
                  {WHATS_INCLUDED_RIGHT.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Next Steps + Disclaimer - inline colors to avoid lab() for html2canvas */}
      <div className="px-3 sm:px-4 lg:px-6 pb-6">
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid #bfdbfe", background: "rgba(239, 246, 255, 0.8)" }}
        >
          <div className="px-3 sm:px-4 py-3">
            <h3 className={`font-bold ${textSize}`} style={{ color: "#111827" }}>Next Steps</h3>
            <p className={`${textSize} mt-0.5`} style={{ color: "#374151" }}>
              Schedule your on-site inspection to confirm scope, finalize selections, and lock in final pricing.
            </p>
          </div>
          <div className="px-3 sm:px-4 pb-3">
            {forPdf ? (
              <span
                className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-white font-medium ${textSize}`}
                style={{ backgroundColor: "#8b0e0f" }}
              >
                Schedule Inspection
              </span>
            ) : (
              <a
                href={`mailto:${company.email}?subject=Schedule%20Inspection&body=Hello%2C%20I%27d%20like%20to%20schedule%20an%20inspection%20for%20${encodeURIComponent(estimate.address || "")}`}
                className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-white font-medium ${textSize} transition`}
                style={{ backgroundColor: "#8b0e0f" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#6d0b0c")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#8b0e0f")}
              >
                Schedule Inspection
              </a>
            )}
          </div>
          {company.followUpText && (
            <div className="px-3 sm:px-4 pb-3 pt-1.5" style={{ borderTop: "1px solid #bfdbfe" }}>
              <p className={`${textSize} whitespace-pre-line leading-snug`} style={{ color: "#374151" }}>
                {company.followUpText
                  .replace("[Person XXX]", company.contactPersonName || "[Person XXX]")
                  .replace("[Phone XXX-XXX-XXXX]", company.contactPersonPhone || "[Phone XXX-XXX-XXXX]")
                  .replace("[Email GM@SuperiorRoofingCali.com]", company.contactPersonEmail || "[Email GM@SuperiorRoofingCali.com]")}
              </p>
            </div>
          )}
        </div>
        <p className={`${textSize} mt-3 leading-relaxed`} style={{ color: "#6b7280" }}>{company.disclaimer}</p>
      </div>
    </div>
  );
}
