import React from "react";
import logoSrc from "../../../public/logo-latest.png";
import * as turf from "@turf/turf";
import { GAFSummary } from "./processRoofData";
import { RoofMeasurementsDiagram } from "./RoofMeasurementsDiagram";
import { LineData, PolygonData } from "./constants";
import { LINE_COLORS } from "./constants";
import { calculateCombinedSummary } from "./calculateCombinedSummary";

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

const PDFTemplate: React.FC<PDFTemplateProps> = ({
  mapImage,
  topViewImage,
  polygonDiagramImage,
  data,
  reportType,
  angledImages,
}) => {
  const isFullReport = reportType === "full";

  const polygons = data.polygons || [];
  const lines = data.lines || [];

  const latestProject = data;
  const combinedSummary = calculateCombinedSummary(data.lines, data.polygons);
  const toFeetInches = (meters: number) => {
    const ft = meters * 3.28084;
    const feet = Math.floor(ft);
    const inches = Math.round((ft - feet) * 12);
    if (inches >= 12) return `${feet + 1}'0"`;
    return `${feet}'${inches}"`;
  };

  const PAGE_BG_COLOR = "#f3f3f3";
  const CARD_BG_COLOR = "#f3f3f3";
  const CARD_HEADER_BG_COLOR = "#0f2346";
  const HEADER_ACCENT_COLOR = "#f3f3f3";
  const ACCENT_COLOR = "#f3f3f3";

  const CustomReportPageHeader: React.FC<{
    title: string;
    isCoverPage: boolean;
    titleFontSize?: string;
  }> = ({ title, isCoverPage, titleFontSize = "16px" }) => {
    const finalHeaderStyle = {
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
      : "PROPERTY OWNER REPORT";

    const headerText = isCoverPage ? reportMainTitle : title;

    return (
      <div style={finalHeaderStyle}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={logoSrc.src}
            alt="Logo"
            style={{ height: 100, width: 150 }}
          />
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
                Prepared For: <strong>Superior Pro Roofs</strong>
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

  const cardContentStyle: React.CSSProperties = {
    padding: "15px",
    fontFamily: "Arial",
  };

  const CardTitleHeader: React.FC<{ title: string }> = ({ title }) => (
    <div
      style={{
        padding: "10px 20px",
        backgroundColor: CARD_HEADER_BG_COLOR,
        color: "#fff",
        fontWeight: "bold",
        borderTopLeftRadius: "6px",
        borderTopRightRadius: "6px",
      }}
    >
      {title}
    </div>
  );

  const pageStyle = (pageNumber: number): React.CSSProperties => ({
    pageBreakAfter: "always",
    padding: "20px 0px",
    fontFamily: "Arial, sans-serif",
    position: "relative",
    minHeight: "1000px",
    color: "#111",
  });

  const cardContainerStyle: React.CSSProperties = {
    borderRadius: "6px",
    marginBottom: "25px",
    border: "1px solid #ccc",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  };

  const cardHeaderStyle: React.CSSProperties = {
    backgroundColor: CARD_HEADER_BG_COLOR,
    padding: "10px 20px 30px 20px",
    borderBottom: "1px solid #ccc",
    borderTopLeftRadius: "6px",
    borderTopRightRadius: "6px",
    color: "#fff",
  };

  const headingStyle: React.CSSProperties = {
    color: HEADER_ACCENT_COLOR,
    fontWeight: 700,
    fontSize: "18px",
    margin: "0",
  };

  const footerCardStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: CARD_HEADER_BG_COLOR,
    padding: "5px 12px 20px",
    borderRadius: "4px",
    fontSize: "12px",
    color: "#f3f3f3",
    border: "1px solid #ccc",
  };

  const PageWrapper: React.FC<{ page: number; children: React.ReactNode }> = ({
    page,
    children,
  }) => (
    <div style={pageStyle(page)}>
      {children}
      <div style={footerCardStyle}>{page}</div>
    </div>
  );

  // --- START OF PDF TEMPLATE RETURN ---

  return (
    <>
      {/* Page 1: Cover + Project Details */}
      <PageWrapper page={1}>
        <CustomReportPageHeader
          title="ROOF MEASUREMENT REPORT"
          isCoverPage={true}
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
            : "Property Owner Report"}
        </h2>

        {/* Project Details */}
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

        {/* Project Summary */}
        <div
          style={{ ...cardContainerStyle, border: `1px solid ${ACCENT_COLOR}` }}
        >
          <div style={cardHeaderStyle}>
            <h3 style={headingStyle}>Project Summary</h3>
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
                {latestProject?.polygons
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

      {/* Page 2: Map/Top View (Always visible) */}
      <PageWrapper page={2}>
        <CustomReportPageHeader
          title="Top View"
          isCoverPage={false}
          titleFontSize="20px"
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

      {/* Page 3: Side Views (Always visible) */}
      <PageWrapper page={3}>
        <CustomReportPageHeader
          title="Side Views"
          isCoverPage={false}
          titleFontSize="20px"
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
              style={{
                position: "relative",
                marginBottom: "10px",
              }}
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

      {/* Page 4: Diagram (Black Diagram for Owner, Full Diagram for Full Report) */}
      <PageWrapper page={4}>
        <CustomReportPageHeader
          title={isFullReport ? "Measurement Diagram" : "Roof Facet Diagram"}
          isCoverPage={false}
          titleFontSize="20px"
        />
        {polygonDiagramImage && (
          <div
            style={{
              backgroundColor: `${ACCENT_COLOR}`,
              borderRadius: 6,
              margin: "80px 0",
            }}
          >
            {isFullReport && <CardTitleHeader title="Diagram" />}
            <div style={cardContentStyle}>
              <img
                src={polygonDiagramImage}
                alt="Polygon Diagram"
                style={{ width: "100%", borderRadius: 6 }}
              />
            </div>
          </div>
        )}
      </PageWrapper>

      <PageWrapper page={4}>
        <CustomReportPageHeader
          title={
            isFullReport
              ? "Measurement Diagram & Key"
              : "Roof Facet Diagram & Key"
          }
          isCoverPage={false}
          titleFontSize="20px"
        />

        {/* 1. Dynamic Diagram Component (Colors will show now) */}
        <div
          style={{
            backgroundColor: `${ACCENT_COLOR}`,
            borderRadius: 6,
            margin: "20px 0",
          }}
        >
          {/* CardTitleHeader removed for a cleaner look, use component directly */}
          <div style={cardContentStyle}>
            <RoofMeasurementsDiagram
              linesData={data.lines}
              polygonsData={data.polygons}
              summary={data.gafSummary}
              showLengths={isFullReport} // Full Report mein lengths dikhenge
            />
          </div>
        </div>

        {/* 2. COMBINED LEGEND (Line + Polygon Labels) - Same as before */}
        <div
          style={{
            marginTop: 20,
            padding: 10,
            textAlign: "center",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        >
          {/* 					
					<h3
						style={{
							color: CARD_HEADER_BG_COLOR,
							borderBottom: "1px solid #ccc",
							paddingBottom: 5,
							fontSize: "16px",
							marginBottom: "15px",
							fontWeight: "bold"
						}}
					>
						Label Key
					</h3> */}

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 30,
              padding: "10px 0",
            }}
          >
            {/* --- Line Labels (Ridge, Valley, etc.) --- */}
            {[
              ...new Set(
                lines
                  .map((line) => line.label)
                  .filter((label): label is string => !!label)
              ),
            ].map((label) => {
              const lineItem = lines.find((l) => l.label === label);
              // Use customColor if available, otherwise default LINE_COLORS
              const color =
                lineItem?.customColor ||
                LINE_COLORS[label.toLowerCase()] ||
                "#000";

              return (
                <div
                  key={`line-${label}`}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: "20px",
                      height: "20px",
                      backgroundColor: color,
                      marginRight: "10px",
                      borderRadius: "4px",
                      border: `1px solid ${
                        color === "#000" ? "#ccc" : "transparent"
                      }`,
                    }}
                  ></span>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#111",
                      fontWeight: "bold",
                    }}
                  >
                    {label}
                  </span>
                </div>
              );
            })}

            {/* --- Polygon Labels (Hip, Gable, etc.) --- */}
            {data.polygons
              .filter((p) => p.label)
              .map((p, idx) => (
                <div
                  key={`poly-${p.id || idx}`}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: "20px",
                      height: "20px",
                      backgroundColor: p.customColor || "#000",
                      marginRight: "10px",
                      borderRadius: "4px",
                    }}
                  ></span>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#111",
                      fontWeight: "bold",
                    }}
                  >
                    {p.label}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </PageWrapper>

      {/* FULL REPORT: Detailed Diagram + Full Legend (Page 5) */}
      {isFullReport && (
        <PageWrapper page={5}>
          <CustomReportPageHeader
            title="Roof Measurements Diagram"
            isCoverPage={false}
            titleFontSize="20px"
          />

          {/* Component: All data and lengths visible (default) */}
          <RoofMeasurementsDiagram
            linesData={data.lines}
            polygonsData={data.polygons}
            summary={data.gafSummary}
          />

          {/* FULL REPORT LEGEND (Lengths ke saath) */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              marginBottom: "20px",
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
              {
                label: "Deduction Area",
                value:
                  data.polygons
                    ?.filter((p) => p && p.isDeduction)
                    .reduce((sum, p) => {
                      if (!p.edges) return sum;
                      return (
                        sum +
                        p.edges.reduce(
                          (lSum, e) => lSum + (e.lengthFeet ?? 0),
                          0
                        )
                      );
                    }, 0) ?? 0,
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
      )}

      {/* Page 6: Measurements Overview (Only in Full Report) */}
      {isFullReport && (
        <PageWrapper page={6}>
          <CustomReportPageHeader
            title="Measurements Overview"
            isCoverPage={false}
            titleFontSize="20px"
          />

          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {/* Polygons */}
            <div
              style={{
                flex: 1,
                minWidth: 300,
                border: `1px solid ${ACCENT_COLOR}`,
                borderRadius: 6,
              }}
            >
              <CardTitleHeader title="Polygons (Roof Facets)" />

              <div style={cardContentStyle}>
                {polygons.length === 0 ? (
                  <p>No polygons drawn.</p>
                ) : (
                  polygons.map((p, idx) => {
                    const edges =
                      p.coordinates?.[0]
                        ?.map((coord, i, arr) => {
                          if (i === arr.length - 1) return null;
                          const start = coord as unknown as [number, number];
                          const end = arr[i + 1] as unknown as [number, number];
                          return turf.length(turf.lineString([start, end]), {
                            units: "meters",
                          });
                        })
                        .filter((e): e is number => e !== null) || [];

                    return (
                      <div
                        key={p.id || idx}
                        style={{
                          marginBottom: 12,
                          borderBottom: "1px dotted #ccc",
                          paddingBottom: 8,
                        }}
                      >
                        <strong
                          style={{
                            color: p.customColor || CARD_HEADER_BG_COLOR,
                          }}
                        >
                          Polygon #{idx + 1} {p.label ? `(${p.label})` : ""}
                        </strong>
                        <ul
                          style={{
                            paddingLeft: 20,
                            margin: "8px 0",
                            fontSize: 14,
                          }}
                        >
                          {edges.map((length, i) => (
                            <li key={i} style={{ color: "black" }}>
                              Edge {i + 1}: {toFeetInches(length)}
                            </li>
                          ))}
                        </ul>
                        {p.pitch && (
                          <p
                            style={{
                              margin: 0,
                              fontSize: 14,
                              fontWeight: "bold",
                              color: CARD_HEADER_BG_COLOR,
                            }}
                          >
                            Pitch: {p.pitch} / 12
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Lines */}
            <div
              style={{
                flex: 1,
                minWidth: 300,
                border: `1px solid ${ACCENT_COLOR}`,
                borderRadius: 6,
              }}
            >
              <CardTitleHeader title="Lines (Measurements)" />

              <div style={cardContentStyle}>
                {lines.length === 0 ? (
                  <p>No lines drawn.</p>
                ) : (
                  lines.map((l, idx) => {
                    const totalLengthMeters = l.coordinates.reduce(
                      (sum, coord, i) => {
                        if (i === 0) return sum;
                        const prevCoord = l.coordinates[i - 1];
                        return (
                          sum +
                          turf.length(turf.lineString([prevCoord, coord]), {
                            units: "meters",
                          })
                        );
                      },
                      0
                    );

                    return (
                      <div
                        key={l.id || idx}
                        style={{
                          marginBottom: 12,
                          borderBottom: "1px dotted #ccc",
                          paddingBottom: 8,
                        }}
                      >
                        <strong
                          style={{
                            color: l.customColor || CARD_HEADER_BG_COLOR,
                          }}
                        >
                          Line #{idx + 1} ({l.type || "Measurement"}){" "}
                          {l.label ? `(${l.label})` : ""}
                        </strong>
                        <p
                          style={{
                            margin: "5px 0 0 0",
                            paddingLeft: 20,
                            fontSize: 14,
                            color: CARD_HEADER_BG_COLOR,
                          }}
                        >
                          Total Length: {toFeetInches(totalLengthMeters)}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </PageWrapper>
      )}
    </>
  );
};

export default PDFTemplate;
