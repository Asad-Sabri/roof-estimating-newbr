// components/layout/pdf/PDFTemplate.tsx (UPDATED)

import React from "react";
import logoSrc from "../../../public/logo-latest.png";
import { GAFSummary } from "./processRoofData";
import { RoofMeasurementsDiagram } from "./RoofMeasurementsDiagram";
import { LineData, PolygonData, LINE_COLORS } from "./constants";
import { calculateCombinedSummary } from "./calculateCombinedSummary";
import {
  calculateMaterialQuantities,
  MaterialQuantities,
} from "./calculateMaterials";
import { GAFSummaryPage } from "./GAFSummaryPage";
import { CustomerSalesEstimatePage } from "./CustomerSalesEstimatePage";
import {
  BASE_RATE_PER_SQ_FT,
  RATE_PER_LINEAR_FOOT_TRIM,
  MINIMUM_JOB_FEE,
  CARD_HEADER_BG_COLOR,
  ACCENT_COLOR,
  RED_DISCLAIMER_COLOR, // Added
  PageWrapper,
  CardTitleHeader,
  cardContentStyle,
  cardContainerStyle,
  headingStyle,
} from "./PDFTemplateStyles"; // cardHeaderStyle is removed from imports as it's merged with CardTitleHeader/CoverPageHeader

interface AngledImages {
  north: string;
  south: string;
  east: string;
  west: string;
}

interface ProjectLocation {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  propertyType?: string;
  roofType?: string;
  address?: string;
  totalArea?: string;
  totalLength?: string;
  gafSummary: GAFSummary;
  polygons: PolygonData[];
  lines: LineData[];
  // Assuming these are part of Customer Selections
  selectedStyle?: string;
  selectedColor?: string;
}

interface PDFTemplateProps {
  mapImage: string;
  topViewImage: string;
  polygonDiagramImage: string;
  data: ProjectLocation;
  preparedFor?: string;
  reportType: "full" | "owner";
  angledImages: AngledImages;
}

const CustomReportPageHeader: React.FC<{
  title: string;
  isCoverPage: boolean;
  titleFontSize?: string;
  isFullReport: boolean;
  customerName: string;
}> = ({
  title,
  isCoverPage,
  titleFontSize = "16px",
  isFullReport,
  customerName,
}) => {
  const finalHeaderStyle: React.CSSProperties = {
    backgroundColor: CARD_HEADER_BG_COLOR,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    // padding: "15px 25px", // Adjusted padding
    padding: "15px 10px 10px 10px", // Adjusted padding
    borderRadius: "8px", // Added border radius
    margin: "5px 0 20px 0",
  };

  const reportMainTitle = isFullReport
    ? "FULL ROOF MEASUREMENT REPORT" // Changed to Admin Report as per instruction
    : "CUSTOMER ESTIMATE REPORT";

  const headerText = isCoverPage ? reportMainTitle : title;

  return (
    <div style={finalHeaderStyle}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src={logoSrc.src}
          alt="Logo"
          style={{ height: 100, width: "auto" }}
        />{" "}
        {/* Adjusted Logo Size */}
      </div>

      <div style={{ textAlign: "right", color: "#fff" }}>
        <p
          style={{
            margin: 0,
            fontSize: titleFontSize,
            fontWeight: "bold",
            marginBottom: isCoverPage ? "5px" : "0",
          }}
        >
          {headerText}
        </p>

        {isCoverPage && (
          <>
            <p style={{ margin: 0, fontSize: "12px" }}>
              Prepared For:{" "}
              <strong>
                {isFullReport
                  ? "Superior Pro Roofs"
                  : customerName || "Superior Pro Roofs"}
              </strong>
            </p>
            <p style={{ margin: 0, fontSize: "12px" }}>
              Date: <strong>{new Date().toLocaleDateString()}</strong>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

// MaterialReportTable remains the same for Admin Report, but updated with better styles
const MaterialReportTable: React.FC<{ materials: MaterialQuantities }> = ({
  materials,
}) => {
  const WASTAGES = ["0%", "8%", "13%", "18%"];

  const tableData = [
    {
      category: "Suggested Shingle Products",
      items: [
        {
          name: "Shingle Bundles (e.g., Timberline HDZ)",
          unit: "bundle",
          quantities: materials.shingles,
        },
      ],
    },
    {
      category: "Roof Deck Protection",
      items: [
        {
          name: "Deck Protection (e.g., Deck-Armor)",
          unit: "roll",
          quantities: materials.underlayment,
        },
      ],
    },
    {
      category: "Starter",
      items: [
        {
          name: "Starter Strip (e.g., WeatherBlocker)",
          unit: "bundle",
          quantities: materials.starter,
        },
      ],
    },
    {
      category: "Ridge Cap",
      items: [
        {
          name: "Ridge Cap (e.g., Seal-A-Ridge)",
          unit: "bundle",
          quantities: materials.ridgeCap,
        },
      ],
    },
    {
      category: "Leak Barrier",
      items: [
        {
          name: "Leak Barrier (e.g., StormGuard)",
          unit: "roll",
          quantities: materials.leakBarrier,
        },
      ],
    },
    {
      category: "Drip Edge",
      items: [
        {
          name: "Drip Edge 10 ft piece",
          unit: "piece",
          quantities: materials.dripEdge,
        },
      ],
    },
  ];

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "12px",
    marginTop: "15px",
    backgroundColor: "#fff",
    borderRadius: "6px",
    overflow: "hidden", // Ensures border-radius works on table edges
  };

  const thStyle: React.CSSProperties = {
    textAlign: "left",
    padding: "10px", // Increased padding
    border: "1px solid #ddd", // Lighter border
    backgroundColor: CARD_HEADER_BG_COLOR,
    color: "#fff",
    fontWeight: "bold",
    // Removed border-radius here, managed by table style
  };

  const tdStyle: React.CSSProperties = {
    padding: "10px",
    border: "1px solid #eee", // Very light border
    verticalAlign: "middle",
  };

  const categoryHeaderStyle: React.CSSProperties = {
    ...tdStyle,
    backgroundColor: "#EFEFEF", // Lighter background
    color: "#333",
    fontWeight: "bold",
    fontSize: "13px",
  };

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th
            style={{
              ...thStyle,
              width: "40%",
              textAlign: "left",
              borderTopLeftRadius: "6px",
            }}
          >
            Roofing Materials
          </th>
          {WASTAGES.map((w, index) => (
            <th
              key={w}
              style={{
                ...thStyle,
                width: "15%",
                textAlign: "center",
                borderTopRightRadius: index === WASTAGES.length - 1 ? "6px" : 0,
              }}
            >
              Waste {w}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tableData.map((categoryData, catIndex) => (
          <React.Fragment key={catIndex}>
            <tr>
              <td colSpan={5} style={categoryHeaderStyle}>
                {categoryData.category}
              </td>
            </tr>
            {categoryData.items.map((item) => (
              <tr key={item.name}>
                <td style={tdStyle}>
                  {item.name}{" "}
                  <span style={{ color: "#777" }}>({item.unit})</span>
                </td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  {item.quantities.q0}
                </td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  {item.quantities.q8}
                </td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  {item.quantities.q13}
                </td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  {item.quantities.q18}
                </td>
              </tr>
            ))}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
};

const PDFTemplate: React.FC<PDFTemplateProps> = ({
  mapImage,
  topViewImage,
  polygonDiagramImage,
  data,
  reportType,
  angledImages,
}) => {
  const isFullReport = reportType === "full";

  const latestProject = data;
  const combinedSummary = calculateCombinedSummary(data.lines, data.polygons);

  const totalNetAreaSqFt = parseFloat(latestProject.totalArea || "0");
  const totalLinealFeet = parseFloat(latestProject.totalLength || "0");

  const facetCount = data.polygons?.length || 0;
  const dominantPitch = data.polygons.reduce(
    (max, p) => ((p.area || 0) > (max.area || 0) ? p : max),
    { area: 0, pitch: "N/A" as any }
  ).pitch;

  const updatedGAFSummary = {
    ...data.gafSummary,
    facetCount: facetCount,
    dominantPitch: dominantPitch,
  };

  const areaCost = totalNetAreaSqFt * BASE_RATE_PER_SQ_FT;
  const complexityCost = totalLinealFeet * RATE_PER_LINEAR_FOOT_TRIM;

  let estimatePrice = areaCost + complexityCost;

  if (estimatePrice < MINIMUM_JOB_FEE) {
    estimatePrice = MINIMUM_JOB_FEE;
  }

  const materialQuantities: MaterialQuantities = calculateMaterialQuantities(
    data.gafSummary,
    totalNetAreaSqFt
  );

  let pageCounter = 0;

  const DYNAMIC_SALES_DATA = {
    estimatePrice: Math.round(estimatePrice / 10) * 10,
    taxRebatePercentage: 0.2,
    salesPersonName: "Kenny Wilson",
    salesPersonMobile: "678-846-2809",
    salesPersonEmail: "kenny@roofrightnow.com",
    pitch: updatedGAFSummary.dominantPitch,
    complexity: "moderate",
    stories: "1",
    style: data.selectedStyle || "GAF Timberline HDZ", // Using selected data
    color: data.selectedColor || "Shakewood", // Using selected data
  };

  const roofArea = data.totalArea
    ? parseFloat(data.totalArea).toFixed(0)
    : "N/A";

  const roofFacets = data.polygons?.length || 0;
  const summary = data.gafSummary || {};
  const ridgesHips = ((summary.ridges || 0) + (summary.hips || 0)).toFixed(0);
  const valleys = (summary.valleys || 0).toFixed(0);
  const rakes = (summary.rakes || 0).toFixed(0);
  const eaves = (summary.eaves || 0).toFixed(0);
  const bends = (summary.bends || 0).toFixed(0);

  const customerName = `${data.firstName || ""} ${data.lastName || ""}`.trim();

  // --- CUSTOMER REPORT TEMPLATE ---

  const CustomerReportTemplate: React.FC<{
    roofArea: string;
    customerSelections: { style: string; color: string };
  }> = ({ roofArea, customerSelections }) => (
    <>
      <PageWrapper page={++pageCounter}>
        <CustomReportPageHeader
          title="Customer Estimate Report"
          isCoverPage={true}
          isFullReport={false}
          customerName={customerName}
        />

        <div style={{ ...cardContainerStyle, marginBottom: "40px" }}>
          <CardTitleHeader title="Preliminary Estimate Summary" />
          <div
            style={{
              ...cardContentStyle,
              textAlign: "center",
              padding: "30px 25px",
            }}
          >
            <h3 style={{ margin: 0, color: "#333", fontSize: "16px" }}>
              Estimated Total Roofing Area
            </h3>
            <p
              style={{
                margin: "10px 0 20px 0",
                fontSize: "36px",
                fontWeight: "bold",
                color: CARD_HEADER_BG_COLOR,
              }}
            >
              {roofArea} SQ FT
            </p>
          </div>
        </div>

        <div style={cardContainerStyle}>
          <CardTitleHeader title="Your Selections" />
          <div style={cardContentStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <span style={{ fontWeight: "bold" }}>Shingle Style:</span>
              <span>{customerSelections.style}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
              }}
            >
              <span style={{ fontWeight: "bold" }}>Color:</span>
              <span>{customerSelections.color}</span>
            </div>
          </div>
        </div>

        {/* Disclaimer Card */}
        <div style={cardContainerStyle}>
          <div
            style={{
              ...cardContentStyle,
              textAlign: "center",
              padding: "15px 25px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                fontWeight: "bold",
                color: RED_DISCLAIMER_COLOR,
              }}
            >
              PRELIMINARY ESTIMATE ONLY – TO BE CONFIRMED AFTER INSPECTION
            </p>
            <p style={{ margin: "5px 0 0 0", fontSize: "10px", color: "#666" }}>
              This estimate is based on aerial measurements and is subject to
              change upon a physical inspection of the property.
            </p>
          </div>
        </div>
      </PageWrapper>
    </>
  );

  // --- MAIN RENDER ---
  return (
    <>
      {/* RENDER CUSTOMER REPORT FIRST IF REPORT TYPE IS 'owner' */}
      {!isFullReport && (
        <CustomerReportTemplate
          roofArea={roofArea}
          customerSelections={{
            style: DYNAMIC_SALES_DATA.style,
            color: DYNAMIC_SALES_DATA.color,
          }}
        />
      )}

      {/* RENDER FULL REPORT PAGES */}
      {isFullReport && (
        <>
          {/* Page 1: Cover Page / Project Details (Admin Report) */}
          <PageWrapper page={++pageCounter}>
            <CustomReportPageHeader
              title="Full Roof Measurement Report"
              isCoverPage={true}
              isFullReport={isFullReport}
              customerName={customerName}
            />

            <div style={cardContainerStyle}>
              {/* <CardTitleHeader title="Color-Coded Roof Diagram" /> */}
              <div>
                {polygonDiagramImage && (
                  <img
                    src={polygonDiagramImage}
                    alt="Polygon Diagram"
                    style={{
                      width: "100%",
                      height: "450px", // Maintained height
                      objectFit: "contain",
                      borderRadius: "6px",
                      border: `1px solid ${ACCENT_COLOR}`,
                    }}
                  />
                )}
              </div>
            </div>

            {/* Measurements and Contents Card in a Flex Row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "20px",
              }}
            >
              {/* CARD 1: Contents (Small Card) */}
              <div style={{ ...cardContainerStyle, width: "48%" }}>
                <CardTitleHeader title="Report Contents" />
                <div style={{ ...cardContentStyle, fontSize: "12px" }}>
                  {[
                    "Overview",
                    "Top View",
                    "Side Views",
                    "Lengths",
                    "Pitches",
                    "Areas",
                    "Summary",
                    "Materials",
                  ].map((item, index) => (
                    <div
                      key={item}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "5px 0",
                        borderBottom: "1px dotted #eee",
                      }}
                    >
                      <span>{item}</span> <span>{index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD 2: Measurements (Dynamic Data) (Small Card) */}
              <div style={{ ...cardContainerStyle, width: "48%" }}>
                <CardTitleHeader title="Summary Measurements" />
                <div style={{ ...cardContentStyle, fontSize: "12px" }}>
                  {[
                    { label: "**Roof Area**", value: roofArea, unit: "sq ft" },
                    { label: "Roof Facets", value: roofFacets, unit: "" },
                    { label: "Ridges/Hips", value: ridgesHips, unit: "ft" },
                    { label: "Valleys", value: valleys, unit: "ft" },
                    { label: "Rakes", value: rakes, unit: "ft" },
                    { label: "Eaves", value: eaves, unit: "ft" },
                    { label: "Bends", value: bends, unit: "ft" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "5px 0",
                        borderBottom: "1px dotted #eee",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: item.label.includes("**")
                            ? "bold"
                            : "normal",
                        }}
                      >
                        {item.label.replace(/\*\*/g, "")}
                      </span>
                      <span>
                        <strong
                          style={{
                            color: item.label.includes("**")
                              ? ACCENT_COLOR
                              : "#333",
                          }}
                        >
                          {item.value}
                        </strong>{" "}
                        {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PageWrapper>

          {/* Page 2: Top View (Card Applied) */}
          <PageWrapper page={++pageCounter}>
            <CustomReportPageHeader
              title="Top View"
              isCoverPage={false}
              titleFontSize="20px"
              isFullReport={isFullReport}
              customerName={customerName}
            />
            {mapImage && (
              <div style={cardContainerStyle}>
                <CardTitleHeader title="Aerial Map View" />
                <div style={cardContentStyle}>
                  <img
                    src={mapImage}
                    alt="Map Screenshot"
                    style={{
                      width: "100%",
                      borderRadius: "6px",
                      display: "block",
                    }}
                    crossOrigin="anonymous"
                  />
                </div>
              </div>
            )}
          </PageWrapper>

          {/* Page 3: Side Views (Card Applied) */}
          <PageWrapper page={++pageCounter}>
            <CustomReportPageHeader
              title="Side Views"
              isCoverPage={false}
              titleFontSize="20px"
              isFullReport={isFullReport}
              customerName={customerName}
            />
            <div
              style={{
                ...cardContainerStyle,
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 15,
                padding: "10px  25px 25px 25px", // Padding inside the main card container
              }}
            >
              {Object.entries(angledImages).map(([direction, src]) => (
                <div
                  key={direction}
                  style={{
                    position: "relative",
                    border: "1px solid #eee",
                    borderRadius: 6,
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={src}
                    alt={`${direction} View`}
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                    }}
                    crossOrigin="anonymous"
                  />
                  <h4
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      margin: 0,
                      padding: "0px 5px 10px 5px",
                      backgroundColor: CARD_HEADER_BG_COLOR,
                      color: "#ffffff",
                      fontSize: "8px",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      borderBottomRightRadius: 6,
                    }}
                  >
                    {direction}
                  </h4>
                </div>
              ))}
            </div>
          </PageWrapper>

          {/* Page 4: Measurement Diagram Image and Key (Card Applied) */}

          {/* Page 5: Measurement Lengths Summary (Card Applied) */}
          <PageWrapper page={++pageCounter}>
            <CustomReportPageHeader
              title="Measurement Lengths Summary"
              isCoverPage={false}
              titleFontSize="20px"
              isFullReport={isFullReport}
              customerName={customerName}
            />

            <div style={cardContainerStyle}>
              <CardTitleHeader title="Detailed Lineal Measurements" />
              <div style={cardContentStyle}>
                <RoofMeasurementsDiagram
                  linesData={data.lines}
                  polygonsData={data.polygons}
                  summary={data.gafSummary}
                  showLengths={true}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-around",
                    padding: "10px 0 0 0",
                    borderTop: "1px solid #eee",
                    marginTop: "10px",
                  }}
                >
                  {[
                    { label: "Ridge", value: combinedSummary.ridges },
                    { label: "Hip", value: combinedSummary.hips },
                    { label: "Valley", value: combinedSummary.valleys },
                    { label: "Rake", value: combinedSummary.rakes },
                    { label: "Eave", value: combinedSummary.eaves },
                    { label: "Flashing", value: combinedSummary.flashings },
                    {
                      label: "Step Flashing",
                      value: combinedSummary.stepFlashings,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        fontSize: "12px",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: "bold",
                          marginBottom: "3px",
                          color:
                            LINE_COLORS[item.label.toLowerCase()] ||
                            CARD_HEADER_BG_COLOR,
                        }}
                      >
                        {item.label}
                      </div>
                      <div>{item.value?.toFixed(0) || 0} ft</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PageWrapper>

          {/* Page 6: MATERIAL REPORT (Card Applied) */}
          <PageWrapper page={++pageCounter}>
            <CustomReportPageHeader
              title="Roofing Materials Estimate"
              isCoverPage={false}
              titleFontSize="20px"
              isFullReport={isFullReport}
              customerName={customerName}
            />

            <div style={cardContainerStyle}>
              <CardTitleHeader
                title={`Material Quantities (Based on Net Area: ${totalNetAreaSqFt.toFixed(
                  2
                )} sq ft)`}
              />
              <div style={cardContentStyle}>
                <MaterialReportTable materials={materialQuantities} />
              </div>
            </div>

            {/* Notes Section (Small Card) */}
            <div style={cardContainerStyle}>
              <CardTitleHeader title="Notes" />
              <div
                style={{
                  ...cardContentStyle,
                  fontSize: "10px",
                  color: "#555",
                }}
              >
                <p style={{ margin: "5px 0" }}>
                  1. These quantities are estimates based on provided
                  measurements. Always confirm quantities before ordering
                  materials.
                </p>
                <p style={{ margin: "5px 0" }}>
                  2. Material coverage assumptions (Shingles, Starter, etc.) can
                  vary by product and manufacturer.
                </p>
                <p style={{ margin: "5px 0" }}>
                  3. Waste calculation is applied to the base quantity and
                  rounded up (ceiling function) to ensure sufficient units are
                  ordered.
                </p>
              </div>
            </div>
          </PageWrapper>

          {/* Remaining Admin Report Pages (GAF Summary and Sales Estimate) */}
          <GAFSummaryPage
            data={{
              ...data,
              gafSummary: updatedGAFSummary,
              email: data.email,
              address: data.address,
            }}
            PageWrapper={PageWrapper}
            CustomReportPageHeader={(props) => (
              <CustomReportPageHeader {...props} customerName={customerName} />
            )}
            pageCounter={pageCounter}
          />

          <CustomerSalesEstimatePage
            data={{
              ...data,
              ...DYNAMIC_SALES_DATA,
            }}
            PageWrapper={PageWrapper}
            CustomReportPageHeader={(props) => (
              <CustomReportPageHeader {...props} customerName={customerName} />
            )}
            pageCounter={pageCounter}
          />
        </>
      )}
    </>
  );
};

export default PDFTemplate;
