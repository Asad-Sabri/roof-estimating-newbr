// PDFTemplate.tsx

import React from "react";
import logoSrc from "../../../public/logo-latest.png";
import Image from "next/image";
import * as turf from "@turf/turf";
import { GAFSummary } from "./processRoofData";
import ReportPageHeader from "./ReportPageHeader";
import CardTitleHeader from "./CardTitleHeader";
import { RoofMeasurementsDiagram } from "./RoofMeasurementsDiagram";
import { LineData, PolygonData } from "./constants";

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
}

const PDFTemplate: React.FC<PDFTemplateProps> = ({
  mapImage,
  topViewImage,
  polygonDiagramImage,
  data,
}) => {
  const polygons = data.polygons || [];
  const lines = data.lines || [];

  const latestProject = data;

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
            {title}
          </p>

          {isCoverPage && (
            <>
              <p style={{ margin: 0, fontSize: "14px" }}>
                Prepared For: <strong>Superior Pro Roofs</strong>
              </p>
              <p style={{ margin: 0, fontSize: "14px" }}>
                Date: <strong>{new Date().toLocaleDateString()}</strong>
              </p>
            </>
          )}
        </div>
      </div>
    );
  };

  const pageStyle = (pageNumber: number): React.CSSProperties => ({
    pageBreakAfter: "always",
    padding: "20px 0px",
    fontFamily: "Arial, sans-serif",
    position: "relative",
    minHeight: "1000px",
    color: "#111",
  });

  const headerCardStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: CARD_HEADER_BG_COLOR,
    padding: "10px 20px",
    borderRadius: "6px",
    marginBottom: "60px",
    border: "1px solid #ccc",
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

  const cardContentStyle: React.CSSProperties = {
    padding: "15px",
    fontFamily: "Arial",
  };

  const headingStyle: React.CSSProperties = {
    color: HEADER_ACCENT_COLOR,
    fontWeight: 700,
    fontSize: "18px",
    margin: "0",
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
          Roof Measurement Report
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
              <p style={{ margin: 0, fontWeight: "bold" }}>Parapet Area</p>
              <p>98.77 sq ft</p>
            </div>
            <div style={{ minWidth: 200, textAlign: "center" }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>Total Length</p>
              <p>{latestProject?.totalLength || "0"} ft</p>
            </div>
          </div>
        </div>
      </PageWrapper>

      {/* Page 2: Map/Top View */}
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
      {/* Page 3: Polygons & Lines */}

      <PageWrapper page={3}>
        <CustomReportPageHeader
          title="Measurement Diagram"
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
            <CardTitleHeader title="Diagram" />
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
          title="Roof Measurements Diagram"
          isCoverPage={false}
          titleFontSize="20px"
        />

        <h1 style={{ marginBottom: "10px", textAlign: "center" }}>
          Roof Measurements
        </h1>

        <RoofMeasurementsDiagram
          linesData={data.lines}
          polygonsData={data.polygons}
          summary={data.gafSummary}
        />
      </PageWrapper>

      <PageWrapper page={5}>
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
                        style={{ color: p.customColor || CARD_HEADER_BG_COLOR }}
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
                  const edges: number[] = [];
                  for (let i = 0; i < l.coordinates.length - 1; i++) {
                    const start = l.coordinates[i];
                    const end = l.coordinates[i + 1];
                    edges.push(
                      turf.length(turf.lineString([start, end]), {
                        units: "meters",
                      })
                    );
                  }

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
                        style={{ color: l.customColor || CARD_HEADER_BG_COLOR }}
                      >
                        Line #{idx + 1} {l.label ? `(${l.label})` : ""}
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
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
};

export default PDFTemplate;
