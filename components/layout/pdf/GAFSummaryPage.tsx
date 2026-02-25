// components/layout/pdf/GAFSummaryPage.tsx

import React from "react";
// Assumed imports from your PDFTemplate
import { GAFSummary } from "./processRoofData";
import { PolygonData } from "./constants";
import { cardContainerStyle, CardTitleHeader, CARD_HEADER_BG_COLOR } from "./PDFTemplateStyles";

// --- STYLE CONSTANTS ---
const HEADER_ACCENT_COLOR = "#f3f3f3";
const ACCENT_COLOR = "#f3f3f3";
const HEADER_FONT_SIZE = "18px";
const cardContentStyle: React.CSSProperties = {
  padding: "15px",
  fontFamily: "Arial",
};

// --- INTERFACES ---
interface SummaryData {
  polygons: PolygonData[];
  gafSummary: GAFSummary; // Contains calculated lengths (eaves, ridges, etc.)
  email?: string;
  address?: string;
  totalArea?: string; // Total area in sq ft
  totalLength?: string;
}

interface GAFSummaryPageProps {
  data: SummaryData;
  PageWrapper: React.FC<{ page: number; children: React.ReactNode }>;
  CustomReportPageHeader: React.FC<{
    title: string;
    isCoverPage: boolean;
    titleFontSize?: string;
    isFullReport: boolean;
  }>;
  pageCounter: number;
}

// --- HELPER FUNCTIONS ---

// Pitch ko group karna (e.g., 3/12, 4/12, etc.)
const groupAreasByPitch = (polygons: PolygonData[]) => {
  const pitchMap = new Map<string, number>();

  // Total area nikalna
  const totalArea = polygons.reduce((sum, p) => sum + (p.area || 0), 0);

  polygons.forEach((p) => {
    if (p.pitch && p.area) {
      const pitchLabel = p.pitch.toString() + " / 12"; // Assuming p.pitch is just the numerator (e.g., 3)
      const currentArea = pitchMap.get(pitchLabel) || 0;
      pitchMap.set(pitchLabel, currentArea + p.area);
    }
  });

  const groupedData = Array.from(pitchMap.entries()).map(([pitch, area]) => ({
    pitch,
    area: area,
    percent: totalArea > 0 ? (area / totalArea) * 100 : 0,
  }));

  // Agar koi pitch nahi hai toh 'N/A' ka group bana sakte hain
  if (totalArea === 0 && polygons.length > 0) {
    return [{ pitch: "N/A", area: 0, percent: 100 }];
  }

  return groupedData;
};

// --- CORE COMPONENTS ---

// 1. TOP PITCH AND WASTE TABLE
const PitchAndWasteTable: React.FC<{
  polygons: PolygonData[];
  totalNetAreaSqFt: number;
}> = ({ polygons, totalNetAreaSqFt }) => {
  const pitchData = groupAreasByPitch(polygons);
  const totalArea = pitchData.reduce((sum, item) => sum + item.area, 0);
  const WASTAGES = [0, 0.08, 0.11, 0.13, 0.15, 0.18, 0.23];
  const SQUARE_FEET_PER_SQUARE = 100;

  // --- Waste/Area Calculation ---
  const calculatedAreas = WASTAGES.map((w) => totalNetAreaSqFt * (1 + w));
  const calculatedSquares = calculatedAreas.map((area) =>
    Math.ceil(area / SQUARE_FEET_PER_SQUARE)
  );

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "12px",
    marginTop: "15px",
    backgroundColor: "#fff",
    border: "1px solid #ccc",
  };

  const thStyle: React.CSSProperties = {
    textAlign: "center",
    padding: "8px",
    border: "1px solid #ccc",
    backgroundColor: CARD_HEADER_BG_COLOR,
    color: "#fff",
  };

  const tdStyle: React.CSSProperties = {
    padding: "8px",
    border: "1px solid #ccc",
    textAlign: "center",
    verticalAlign: "middle",
  };

  return (
    <div style={{ marginBottom: "30px" }}>
      {/* 1. Pitch Distribution Table */}
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Summary</th>
            {pitchData.map((p, index) => (
              <th key={index} style={thStyle}>
                Pitch {p.pitch.split("/")[0].trim()}
              </th>
            ))}
            {/* Grand Total Area (Net Area) */}
            <th style={thStyle}>Area</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ ...tdStyle, textAlign: "left", fontWeight: "bold" }}>
              Pitch (e.g., 3 / 12)
            </td>
            {pitchData.map((p, index) => (
              <td key={index} style={tdStyle}>
                {p.pitch}
              </td>
            ))}
            <td style={tdStyle}>{totalArea.toFixed(0)}</td>
          </tr>
          <tr>
            <td style={{ ...tdStyle, textAlign: "left", fontWeight: "bold" }}>
              Area (sq ft)
            </td>
            {pitchData.map((p, index) => (
              <td key={index} style={tdStyle}>
                {p.area.toFixed(0)}
              </td>
            ))}
            <td style={tdStyle}>{totalNetAreaSqFt.toFixed(0)}</td>
          </tr>
          <tr>
            <td style={{ ...tdStyle, textAlign: "left", fontWeight: "bold" }}>
              Percent (%)
            </td>
            {pitchData.map((p, index) => (
              <td key={index} style={tdStyle}>
                {p.percent.toFixed(0)}%
              </td>
            ))}
            <td style={tdStyle}>100%</td>
          </tr>
        </tbody>
      </table>

      {/* 2. Waste and Squares Table */}
      <table style={{ ...tableStyle, marginTop: "20px" }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: "15%" }}>Waste %</th>
            {WASTAGES.map((w, index) => (
              <th key={index} style={thStyle}>
                {w * 100}%
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ ...tdStyle, textAlign: "left", fontWeight: "bold" }}>
              Area (sq ft)
            </td>
            {calculatedAreas.map((area, index) => (
              <td key={index} style={tdStyle}>
                {area.toFixed(0)}
              </td>
            ))}
          </tr>
          <tr>
            <td style={{ ...tdStyle, textAlign: "left", fontWeight: "bold" }}>
              Squares (100 sq ft)
            </td>
            {calculatedSquares.map((sq, index) => (
              <td key={index} style={tdStyle}>
                {sq}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// 2. BOTTOM MEASUREMENTS SUMMARY
const MeasurementsSummary: React.FC<{
  summary: GAFSummary;
  totalArea: string;
  totalLength: string;
}> = ({ summary, totalArea, totalLength }) => {
  // Total Drip Edge = Eaves + Rakes
  const dripEdge = summary.eaves + summary.rakes;
  // Leak Barrier = Eaves + Valleys (Example assumption)
  const leakBarrier = summary.eaves + summary.valleys;
  // Ridge Cap = Ridges + Hips (Example assumption)
  const ridgeCap = summary.ridges + summary.hips;
  // Starter = Eaves + Rakes (Example assumption)
  const starter = summary.eaves + summary.rakes;

  const summaryItems = [
    {
      label: "Roof Area",
      value: parseFloat(totalArea).toFixed(0),
      unit: "sq ft",
    },
    { label: "Roof Facets", value: summary?.facetCount || 0 }, // Assuming Facet Count is available
    {
      label: "Pitch",
      value: summary?.dominantPitch ? `${summary?.dominantPitch} / 12` : "N/A",
    }, // Assuming dominantPitch is calculated
    { label: "Bends", value: summary.bends, unit: "ft" },
    { label: "Eaves", value: summary.eaves, unit: "ft" },
    { label: "Hips", value: summary.hips, unit: "ft" },
    { label: "Rakes", value: summary.rakes, unit: "ft" },
    { label: "Ridges", value: summary.ridges, unit: "ft" },
    { label: "Valleys", value: summary.valleys, unit: "ft" },
    { label: "Flash", value: summary.flashings, unit: "ft" },
    { label: "Step", value: summary.stepFlashings, unit: "ft" },
    // Calculated Items
    { label: "Drip Edge", value: dripEdge, unit: "ft" },
    { label: "Leak Barrier", value: leakBarrier, unit: "ft" },
    { label: "Ridge Cap", value: ridgeCap, unit: "ft" },
    { label: "Starter", value: starter, unit: "ft" },
  ];

  const itemStyle: React.CSSProperties = {
    padding: "10px 0",
    borderBottom: "1px dashed #ddd",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "20px",
      }}
    >
      {summaryItems.map((item, index) => (
        <div key={index} style={itemStyle}>
          <span style={{ fontWeight: "bold" }}>{item.label}:</span>
          <span>
            {item.value
              ? typeof item.value === "number"
                ? item.value.toFixed(0)
                : item.value
              : 0}{" "}
            {item.unit}
          </span>
        </div>
      ))}
    </div>
  );
};

// 3. MAIN GAF SUMMARY PAGE
export const GAFSummaryPage: React.FC<GAFSummaryPageProps> = ({
  data,
  PageWrapper,
  CustomReportPageHeader,
  pageCounter,
}) => {
  // Page Counter ko update karein kyunki yeh component abhi render ho raha hai
  const currentPage = ++pageCounter;

  // Ensure totalArea is treated as a number for calculation
  const totalNetAreaSqFt = parseFloat(data.totalArea || "0");

  return (
    <PageWrapper page={currentPage}>
      <CustomReportPageHeader
        title="Detail Summary"
        isCoverPage={false}
        titleFontSize="20px"
        isFullReport={true} // Assuming this page is only for Full Report
      />

      {/* Header/Prepared For Section */}
      {/* <div style={{ 
                backgroundColor: ACCENT_COLOR, 
                padding: "10px 15px", 
                border: "1px solid #ccc",
                borderRadius: "4px",
                marginBottom: "20px"
            }}>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: "bold" }}>
                    Prepared For: 
                    <span style={{ fontWeight: 'normal' }}>
                        {data.email || 'N/A'} | {data.address || 'N/A'}
                    </span>
                </p>
            </div> */}

      {/* 1. Pitch and Waste Table */}
      <h3
        style={{
          margin: "10px 0",
          fontSize: HEADER_FONT_SIZE,
          fontWeight: "bold",
        }}
      >
        Area Distribution and Waste Calculation
      </h3>
      <PitchAndWasteTable
        polygons={data.polygons}
        totalNetAreaSqFt={totalNetAreaSqFt}
      />
      <div style={cardContainerStyle}>
      <CardTitleHeader title="Roof Line and Area Summary" />
        <div style={{ border: "1px solid #ccc", borderRadius: "4px" }}>
          <div style={cardContentStyle}>
            <MeasurementsSummary
              summary={data.gafSummary}
              totalArea={data.totalArea || "0"}
              totalLength={data.totalLength || "0"}
            />
          </div>
        </div>
      </div>

      <div style={{  fontSize: "10px", color: "#555" }}>
        <h4
          style={{
            margin: "0",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          Note:
        </h4>
        <p style={{ margin: "5px 0" }}>
          * Roof Facets, Bends, and Pitch values require corresponding data to
          be set correctly in your drawing properties (e.g., each polygon should
          have a `pitch` property).
        </p>
        <p style={{ margin: "5px 0" }}>
          * Calculated materials (Drip Edge, Leak Barrier, Ridge Cap, Starter)
          are based on the combined length of relevant components (e.g., Drip
          Edge = Eaves + Rakes).
        </p>
      </div>
    </PageWrapper>
  );
};
