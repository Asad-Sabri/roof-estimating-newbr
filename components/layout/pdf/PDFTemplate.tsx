// layout/pdf/PDFTemplate.tsx
import React from "react";
import logoSrc from "../../../public/logo-latest.png";
import Image from "next/image";
import { useCallback } from "react";
import * as turf from "@turf/turf";

interface PolygonData {
  id: string;
  coordinates: number[][];
  color?: string; // agar pehle se hai
  customColor?: string; // ye add karo
  edges?: { start: number[]; end: number[]; lengthFeet: number }[];
  label?: string; // ye add karo
}
interface LineData {
  label: any;
  id: string;
  coordinates: [number, number][];
  edges?: {
    start: [number, number];
    end: [number, number];
    lengthFeet: number;
  }[];
  customColor?: string; // ye add karo
}

interface ProjectLocation {
  lat: number;
  lng: number;
}

interface PDFTemplateProps {
  mapImage?: string;
  topViewImage?: string;
  data: {
    polygons?: PolygonData[];
    lines?: LineData[];
    projectLocation?: ProjectLocation;
    date?: string;
    userName?: string;
    projectName?: string;
    summary?: string;
  };
}

// Helper function to convert meters to feet and inches
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
const ACCENT_COLOR = "BLACK";

const PDFTemplate: React.FC<PDFTemplateProps> = ({
  mapImage,
  topViewImage,
  data,
}) => {
  const polygons = data.polygons || [];
  const lines = data.lines || [];

  // Get latest project from localStorage
  let latestProject: any = {};
  if (typeof window !== "undefined") {
    const projectsRaw = localStorage.getItem("projects");
    if (projectsRaw) {
      const projects = JSON.parse(projectsRaw);
      if (Array.isArray(projects) && projects.length > 0) {
        latestProject = projects[projects.length - 1];
      }
    }
  }

  const pageStyle = (pageNumber: number): React.CSSProperties => ({
    pageBreakAfter: "always",
    padding: "20px 40px",
    fontFamily: "Arial, sans-serif",
    position: "relative",
    minHeight: "1000px",
    color: "#111",
    backgroundColor: PAGE_BG_COLOR,
  });

  const headerCardStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: CARD_HEADER_BG_COLOR,
    padding: "10px 20px",
    borderRadius: "6px",
    marginBottom: "20px",
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
    padding: "10px 15px",
    borderBottom: "1px solid #ccc",
    borderTopLeftRadius: "6px",
    borderTopRightRadius: "6px",
  };

  const cardContentStyle: React.CSSProperties = {
    padding: "15px",
    fontFamily: "arial",
  };

  const headingStyle: React.CSSProperties = {
    color: HEADER_ACCENT_COLOR,
    fontWeight: 700,
    fontSize: "18px",
    margin: "0 0 20px 0",
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
      {/* Page 1: Cover + Project Details + Summary */}
      <PageWrapper page={1}>
        <div
          style={{
            ...headerCardStyle,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 16px",
            borderRadius: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <Image src={logoSrc} alt="Logo" height={150} width={150} />
          </div>

          <div style={{ textAlign: "right", color: "#fff" }}>
            <p style={{ margin: 0, fontSize: "14px" }}>
              Prepared For: <strong>Superior Pro Roofs</strong>
            </p>
            <p style={{ margin: 0, fontSize: "14px" }}>
              Date:{" "}
              <strong>
                {latestProject.createdAt
                  ? new Date(latestProject.createdAt).toLocaleDateString()
                  : "N/A"}
              </strong>
            </p>
          </div>
        </div>

        <h2
          style={{
            textAlign: "center",
            marginBottom: "30px",
            color: ACCENT_COLOR,
            fontSize: "28px",
            fontWeight: "bold",
          }}
        >
          Roof Measurement Report
        </h2>

        {/* Project Details */}
        <div
          style={{ ...cardContainerStyle, border: `1px solid ${ACCENT_COLOR}` }}
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
              <p style={{ margin: 0, fontWeight: "bold" }}>Total Length</p>
              <p>{latestProject?.totalLength || "0"} ft</p>
            </div>
          </div>
        </div>
      </PageWrapper>

      {/* Page 2: Map */}
      {mapImage && (
        <PageWrapper page={2}>
          <div style={cardContainerStyle}>
            <div style={cardHeaderStyle}>
              <h3 style={headingStyle}>Top View</h3>
            </div>
            <div style={cardContentStyle}>
              <img
                src={mapImage}
                alt="Map Screenshot"
                style={{ width: "100%", borderRadius: 6 }}
              />
            </div>
          </div>
        </PageWrapper>
      )}
      <PageWrapper page={3}>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {/* Polygons */}
          <div style={{ ...cardContainerStyle, flex: 1, minWidth: 300 }}>
            <div style={cardHeaderStyle}>
              <h3 style={headingStyle}>Polygons (Roof Facets)</h3>
            </div>
            <div style={cardContentStyle}>
              {polygons.length === 0 ? (
                <p>No polygons drawn.</p>
              ) : (
                polygons.map((p, idx) => {
                  const edges =
                    (p.coordinates?.[0] || [])
                      .map((coord, i, arr) => {
                        if (i === arr.length - 1) return null; // skip last point
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
                      <strong style={{ color: p.customColor || ACCENT_COLOR }}>
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
          <div style={{ ...cardContainerStyle, flex: 1, minWidth: 300 }}>
            <div style={cardHeaderStyle}>
              <h3 style={headingStyle}>Lines (Measurements)</h3>
            </div>
            <div style={cardContentStyle}>
              {lines.length === 0 ? (
                <p>No lines drawn.</p>
              ) : (
                lines.map((l, idx) => {
                  const edges: number[] = [];
                  if (l.coordinates && l.coordinates.length > 1) {
                    for (let i = 0; i < l.coordinates.length - 1; i++) {
                      const start = l.coordinates[i];
                      const end = l.coordinates[i + 1];
                      const line = turf.lineString([start, end]);
                      edges.push(turf.length(line, { units: "meters" }));
                    }
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
                      <strong style={{ color: l.customColor || ACCENT_COLOR }}>
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
