// components/layout/pdf/PDFTemplate.tsx (Updated)

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
  PageWrapper,
  CardTitleHeader,
  cardContentStyle,
  cardContainerStyle,
  cardHeaderStyle,
  headingStyle,
} from "./PDFTemplateStyles";

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
}> = ({ title, isCoverPage, titleFontSize = "16px", isFullReport, customerName }) => {
  const finalHeaderStyle: React.CSSProperties = {
    backgroundColor: CARD_HEADER_BG_COLOR,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 25px",
    borderRadius: "8px",
    marginBottom: "20px",
  };

  const reportMainTitle = isFullReport
    ? "FULL ROOF MEASUREMENT REPORT"
    : "CUSTOMER REPORT"; // Client's requested title

  const headerText = isCoverPage ? reportMainTitle : title;

  return (
    <div style={finalHeaderStyle}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <img src={logoSrc.src} alt="Logo" style={{ height: 100, width: 150 }} />
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
            <p style={{ margin: 0, fontSize: "14px" }}>
              {/* FIX: Prepared For: Customer Report mein Customer ka Naam, Full Report mein Company ka naam (Default logic) */}
              Prepared For: <strong>{isFullReport ? "Superior Pro Roofs" : customerName || "Superior Pro Roofs"}</strong>
            </p>
            <p style={{ margin: 0, fontSize: "14px" }}>
              Date: <strong>{new Date().toLocaleDateString()}</strong>
            </p>

            {!isFullReport && (
              <p
                style={{
                  margin: "5px 0 0 0",
                  fontSize: "12px",
                  color: "#FFDDDD",
                  fontStyle: "italic",
                }}
              >
                * For informational purposes only
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

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
  };

  const thStyle: React.CSSProperties = {
    textAlign: "left",
    padding: "8px",
    border: "1px solid #ccc",
    backgroundColor: CARD_HEADER_BG_COLOR,
    color: "#fff",
    borderTopLeftRadius: "6px",
    borderTopRightRadius: "6px",
  };

  const tdStyle: React.CSSProperties = {
    padding: "8px",
    border: "1px solid #ccc",
    verticalAlign: "middle",
  };

  const categoryHeaderStyle: React.CSSProperties = {
    ...tdStyle,
    backgroundColor: "#E0E0E0",
    color: "#333",
    fontWeight: "bold",
    fontSize: "13px",
  };

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={{ ...thStyle, width: "40%", textAlign: "left", borderTopRightRadius: 0, borderBottom: "none" }}>
            Roofing Materials
          </th>
          {WASTAGES.map((w, index) => (
            <th
              key={w}
              style={{ ...thStyle, width: "15%", textAlign: "center", borderTopLeftRadius: index === 0 ? 0 : "6px", borderBottom: "none" }}
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
    style: "GAF Timberline HDZ",
    color: "Shakewood",
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

  const customerName = `${data.firstName || ''} ${data.lastName || ''}`.trim();

  return (
    <>
      {/* Page 1: Cover Page / Project Details */}
      <PageWrapper page={++pageCounter}>
        <CustomReportPageHeader
          title={isFullReport ? "Full Roof Measurement Report" : "Customer Report"} // FIX: Title set to Customer Report
          isCoverPage={true}
          isFullReport={isFullReport}
          customerName={customerName} // FIX: Passing customer name
        />

        <h2
          style={{
            textAlign: "center",
            marginBottom: "30px",
            color: "black",
            fontSize: "28px",
            fontWeight: "bold",
          }}
        >
          {isFullReport
            ? "Full Roof Measurement Report"
            : "Customer Report"}
        </h2>

        <div
          style={{ ...cardContainerStyle, border: `2px solid ${ACCENT_COLOR}` }}
        >
          <div style={cardHeaderStyle}>
            <h3 style={headingStyle}>Project Details</h3>
          </div>
          <div
            style={{
              ...cardContentStyle,
              display: "flex",
              flexWrap: "wrap",
              gap: 30,
            }}
          >
            <div style={{ minWidth: 200 }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>First Name:</p>
              <p>{latestProject.firstName || "N/A"}</p>
            </div>
            <div style={{ minWidth: 200 }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>Last Name:</p>
              <p>{latestProject.lastName || "N/A"}</p>
            </div>
            <div style={{ minWidth: 200 }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>Email:</p>
              <p>{latestProject.email || "N/A"}</p>
            </div>
            <div style={{ minWidth: 200 }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>Mobile:</p>
              <p>{latestProject.mobile || "N/A"}</p>
            </div>
            <div style={{ minWidth: 200 }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>Property Type:</p>
              <p>{latestProject.propertyType || "N/A"}</p>
            </div>
            <div style={{ minWidth: 200 }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>Roof Type:</p>
              <p>{latestProject.roofType || "N/A"}</p>
            </div>
            <div style={{ minWidth: 200 }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>Address:</p>
              <p>{latestProject.address || "N/A"}</p>
            </div>
          </div>
        </div>

        <div
          style={{ ...cardContainerStyle, border: `1px solid ${ACCENT_COLOR}` }}
        >
          <div style={cardHeaderStyle}>
            <h3 style={headingStyle}>Area Summary</h3>
          </div>
          <div
            style={{
              ...cardContentStyle,
              display: "flex",
              justifyContent: "space-around",
              gap: 16,
            }}
          >
            <div style={{ minWidth: 200, textAlign: "center" }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>Total Area</p>
              <p>{latestProject?.totalArea || "0"} sq ft</p>
            </div>
            <div style={{ minWidth: 200, textAlign: "center" }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>Deduction Area</p>
              <p>
                {latestProject.polygons
                  ?.filter((p: any) => p.isDeduction)
                  .reduce((sum: number, p: any) => sum + (p.area || 0), 0)
                  .toFixed(2) || "0"}{" "}
                sq ft
              </p>
            </div>
            <div style={{ minWidth: 200, textAlign: "center" }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>Total Length</p>
              <p>{latestProject?.totalLength || "0"} ft</p>
            </div>
          </div>
        </div>
      </PageWrapper>

      {/* Page 3: Top View */}
      <PageWrapper page={++pageCounter}>
        <CustomReportPageHeader
          title="Top View"
          isCoverPage={false}
          titleFontSize="20px"
          isFullReport={isFullReport}
          customerName={customerName}
        />
        {mapImage && (
          <div style={{ border: `1px solid ${ACCENT_COLOR}`, borderRadius: 6 }}>
            <div style={cardContentStyle}>
              <img
                src={mapImage}
                alt="Map Screenshot"
                style={{ width: "100%", borderRadius: 6 }}
                crossOrigin="anonymous"
              />
            </div>
          </div>
        )}
      </PageWrapper>

      {/* Page 4: Side Views */}
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
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 15,
            marginTop: 15,
            paddingBottom: "20px",
          }}
        >
          {Object.entries(angledImages).map(([direction, src]) => (
            <div
              key={direction}
              style={{ position: "relative", marginBottom: "10px" }}
            >
              <img
                src={src}
                alt={`${direction} View`}
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: 6,
                  border: `1px solid #ccc`,
                }}
                crossOrigin="anonymous"
              />
              <h4
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  margin: 0,
                  padding: "0 5px 15px 5px",
                  backgroundColor: "black",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  borderTopLeftRadius: 6,
                }}
              >
                {direction}
              </h4>
            </div>
          ))}
        </div>
      </PageWrapper>

      {/* Page 5: Measurement Diagram Image and Key */}
      <PageWrapper page={++pageCounter}>
        <CustomReportPageHeader
          title={isFullReport ? "Measurement Diagram" : "Roof Facet Diagram"}
          isCoverPage={false}
          titleFontSize="20px"
          isFullReport={isFullReport}
          customerName={customerName}
        />

        {/* DIAGRAM SECTION (HEIGHT REDUCED) */}
        {polygonDiagramImage && (
          <div
            style={{
              backgroundColor: `${ACCENT_COLOR}`,
              borderRadius: 6,
              margin: "10px 0 20px 0",
            }}
          >
            <div style={cardContentStyle}>
              <img
                src={polygonDiagramImage}
                alt="Polygon Diagram"
                style={{
                  width: "100%",
                  height: isFullReport ? "450px" : "auto",
                  objectFit: "contain",
                  borderRadius: 6,
                }}
              />
            </div>
          </div>
        )}

        {isFullReport && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "20px",
              marginTop: "10px",
            }}
          >
            {/* CARD 1: Contents */}
            <div
              style={{
                width: "48%",
                border: "1px solid #ccc",
                borderRadius: "6px",
                padding: "10px",
                backgroundColor: "#f9f9f9",
              }}
            >
              <CardTitleHeader title="Contents" />
              <div
                style={{
                  ...cardContentStyle,
                  fontSize: "14px",
                  lineHeight: "1.8",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Overview</span> <span>1</span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Top View</span> <span>2</span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Side Views</span> <span>3</span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Lengths</span> <span>4</span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Pitches</span> <span>5</span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Areas</span> <span>6</span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Summary</span> <span>7</span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Materials</span> <span>8</span>
                </div>
              </div>
            </div>

            {/* CARD 2: Measurements (Dynamic Data) */}
            <div
              style={{
                width: "48%",
                border: "1px solid #ccc",
                borderRadius: "6px",
                padding: "10px",
                backgroundColor: "#f9f9f9",
              }}
            >
              <CardTitleHeader title="Measurements" />
              <div
                style={{
                  ...cardContentStyle,
                  fontSize: "14px",
                  lineHeight: "1.8",
                }}
              >
                {/* Roof Area */}
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>**Roof Area**</span> <span>**{roofArea} sq ft**</span>
                </div>
                {/* Roof Facets */}
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Roof Facets</span> <span>{roofFacets}</span>
                </div>
                {/* Ridges/Hips */}
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Ridges/Hips</span> <span>{ridgesHips} ft</span>
                </div>
                {/* Valleys */}
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Valleys</span> <span>{valleys} ft</span>
                </div>
                {/* Rakes */}
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Rakes</span> <span>{rakes} ft</span>
                </div>
                {/* Eaves */}
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Eaves</span> <span>{eaves} ft</span>
                </div>
                {/* Bends */}
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Bends</span> <span>{bends} ft</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </PageWrapper>

      {/* Page 7: Detailed Measurements & Full Summary (Only for Full Report) */}
        <PageWrapper page={++pageCounter}>
          <CustomReportPageHeader
            title="Measurement Lenghts Summary"
            isCoverPage={false}
            titleFontSize="20px"
            isFullReport={isFullReport}
            customerName={customerName}
          />

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
              padding: "10px",
              border: "1px solid #ccc",
              backgroundColor: "#f8f8f8",
            }}
          >
            {[
              { label: "Ridge", value: combinedSummary.ridges },
              { label: "Hip", value: combinedSummary.hips },
              { label: "Valley", value: combinedSummary.valleys },
              { label: "Rake", value: combinedSummary.rakes },
              { label: "Eave", value: combinedSummary.eaves },
              { label: "Flashing", value: combinedSummary.flashings },
              { label: "Step Flashing", value: combinedSummary.stepFlashings },
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
                    color: LINE_COLORS[item.label.toLowerCase()] || "#000",
                  }}
                >
                  {item.label}
                </div>
                <div>{item.value?.toFixed(0) || 0} ft</div>
              </div>
            ))}
          </div>
        </PageWrapper>

      {/* Page 8: MATERIAL REPORT (NEW PAGE) */}
      {isFullReport && (
        <PageWrapper page={++pageCounter}>
          <CustomReportPageHeader
            title="Roofing Materials Estimate"
            isCoverPage={false}
            titleFontSize="20px"
            isFullReport={isFullReport}
            customerName={customerName}
          />

          <div
            style={{
              ...cardContainerStyle,
              border: `1px solid ${ACCENT_COLOR}`,
              marginBottom: "10px",
            }}
          >
            <div style={cardHeaderStyle}>
              <h3 style={headingStyle}>
                Material Quantities (Based on Net Area:{" "}
                {totalNetAreaSqFt.toFixed(2)} sq ft)
              </h3>
            </div>
            <div style={cardContentStyle}>
              <MaterialReportTable materials={materialQuantities} />
            </div>
          </div>

          <div
            style={{
              padding: "10px",
              fontSize: "10px",
              color: "#555",
              marginTop: "20px",
            }}
          >
            <h4
              style={{
                margin: "0 0 5px 0",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              Notes:
            </h4>
            <p style={{ margin: "5px 0" }}>
              1. These quantities are estimates based on provided measurements.
              Always confirm quantities before ordering materials.
            </p>
            <p style={{ margin: "5px 0" }}>
              2. Material coverage assumptions (Shingles, Starter, etc.) can
              vary by product and manufacturer.
            </p>
            <p style={{ margin: "5px 0" }}>
              3. Waste calculation is applied to the base quantity and rounded
              up (ceiling function) to ensure sufficient units are ordered.
            </p>
          </div>
        </PageWrapper>
      )}

      {/* Page 9: GAF SUMMARY PAGE */}
      {isFullReport && (
        <GAFSummaryPage
          data={{
            ...data,
            gafSummary: updatedGAFSummary,
            email: data.email,
            address: data.address,
          }}
          PageWrapper={PageWrapper}
          CustomReportPageHeader={(props) => <CustomReportPageHeader {...props} customerName={customerName} />}
          pageCounter={pageCounter}
        />
      )}

      {/* Page 2: CUSTOMER SALES ESTIMATE (isFullReport) */}
      {/* Note: CustomerSalesEstimatePage ke andar CTA ko clickable banana hoga, agar woh is component ke andar defined hai. */}
      {isFullReport && (
        <CustomerSalesEstimatePage
          data={{
            ...data,
            ...DYNAMIC_SALES_DATA,
          }}
          PageWrapper={PageWrapper}
          CustomReportPageHeader={(props) => <CustomReportPageHeader {...props} customerName={customerName} />}
          pageCounter={pageCounter}
        />
      )}
    </>
  );
};

export default PDFTemplate;