// layout/pdf/PDFTemplate.tsx
import React from "react";
import logoSrc from "../../../public/logo-latest.png";
import Image from "next/image";

interface PolygonData {
  id: string;
  color: string;
  edges: string[];
  coordinates?: [number, number][];
}
interface LineData {
  id: string;
  color: string;
  coordinates: [number, number][];
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
  const userName = data.userName || "N/A";
  const projectName = data.projectName;
  const summary = data.summary || "";

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
        <div style={headerCardStyle}>
          <Image src={logoSrc} alt="Logo" height={100} width={100} />
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0 }}>
              Prepared For: <strong>Superior Pro Roofs</strong>
            </p>
            <p style={{ margin: 0 }}>
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
              alignItems: "center",
              flexWrap: "wrap",
              gap: "30px",
            }}
          >
            <div style={{ minWidth: "200px" }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>First Name:</p>
              <p>{latestProject.firstName || "N/A"}</p>
            </div>
            <div style={{ minWidth: "200px" }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>Last Name:</p>
              <p>{latestProject.lastName || "N/A"}</p>
            </div>
            <div style={{ minWidth: "200px" }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>Email:</p>
              <p>{latestProject.email || "N/A"}</p>
            </div>
            <div style={{ minWidth: "200px" }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>Mobile:</p>
              <p>{latestProject.mobile || "N/A"}</p>
            </div>
            <div style={{ minWidth: "200px" }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>Property Type:</p>
              <p>{latestProject.propertyType || "N/A"}</p>
            </div>
            <div style={{ minWidth: "200px" }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>Roof Type:</p>
              <p>{latestProject.roofType || "N/A"}</p>
            </div>
            <div style={{ minWidth: "200px" }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>Address:</p>
              <p>{latestProject.address || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Project Summary Card */}
        <div
          style={{ ...cardContainerStyle, border: `1px solid ${ACCENT_COLOR}` }}
        >
          <div style={cardHeaderStyle}>
            <h3 style={headingStyle}>Project Summary</h3>
          </div>
          <div style={{ ...cardContentStyle, display: "flex", gap: "20px" }}>
            <div style={{ minWidth: "200px" }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>Total Area</p>
              <p>4,952 sq ft</p>
            </div>
            <div style={{ minWidth: "200px" }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>Predominant Pitch</p>
              <p>15/12</p>
            </div>
            <div style={{ minWidth: "200px" }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>Total Length</p>
              <p>205 ft</p>
            </div>
          </div>
        </div>
      </PageWrapper>

      {/* Page 2: Project Map */}
      {mapImage && (
        <PageWrapper page={2}>
          <div style={cardContainerStyle}>
            <div style={cardHeaderStyle}>
              <h3 style={headingStyle}>Project Map</h3>
            </div>
            <div style={cardContentStyle}>
              <img
                src={mapImage}
                alt="Map Screenshot"
                style={{ width: "100%", borderRadius: "6px" }}
              />
            </div>
          </div>
        </PageWrapper>
      )}

      {/* Page 3: Polygons + Lines */}
      <PageWrapper page={3}>
        <div style={{ display: "flex", gap: "20px" }}>
          {/* Polygons card */}
          <div style={{ ...cardContainerStyle, flex: 1 }}>
            <div style={cardHeaderStyle}>
              <h3 style={headingStyle}>Polygons (Roof Facets)</h3>
            </div>
            <div style={cardContentStyle}>
              {polygons.length === 0 ? (
                <p>No polygons drawn.</p>
              ) : (
                polygons.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    style={{
                      marginBottom: "12px",
                      borderBottom: "1px dotted #ccc",
                    }}
                  >
                    <strong style={{ color: ACCENT_COLOR }}>
                      Facet {idx + 1} (Color: {p.color})
                    </strong>
                    <ul
                      style={{
                        paddingLeft: "20px",
                        margin: "4px 0",
                        fontSize: "14px",
                      }}
                    >
                      {(p.edges || []).map((e, i) => (
                        <li key={i}>
                          Edge {i + 1}: {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Lines card */}
          <div style={{ ...cardContainerStyle, flex: 1 }}>
            <div style={cardHeaderStyle}>
              <h3 style={headingStyle}>Lines (Measurements)</h3>
            </div>
            <div style={cardContentStyle}>
              {lines.length === 0 ? (
                <p>No lines drawn.</p>
              ) : (
                lines.map((l, idx) => (
                  <div
                    key={l.id || idx}
                    style={{
                      marginBottom: "12px",
                      borderBottom: "1px dotted #ccc",
                    }}
                  >
                    <strong style={{ color: ACCENT_COLOR }}>
                      Line {idx + 1} (Color: {l.color})
                    </strong>
                    <ul
                      style={{
                        paddingLeft: "20px",
                        margin: "4px 0",
                        fontSize: "14px",
                      }}
                    >
                      {l.coordinates.map((c, i) => (
                        <li key={i}>
                          Point {i + 1}: {c[0].toFixed(6)}, {c[1].toFixed(6)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </PageWrapper>

      {/* Page 4: Top View */}
      <PageWrapper page={4}>
        <div style={cardContainerStyle}>
          <div style={cardHeaderStyle}>
            <h3 style={headingStyle}>Top View Diagram</h3>
          </div>
          <div style={cardContentStyle}>
            {topViewImage ? (
              <img
                src={topViewImage}
                alt="Top View"
                style={{ width: "100%", borderRadius: "6px" }}
              />
            ) : (
              <p>No top view available.</p>
            )}
          </div>
        </div>
      </PageWrapper>

      {/* Page 5: Edge Lengths */}
      <PageWrapper page={5}>
        <div style={cardContainerStyle}>
          <div style={cardHeaderStyle}>
            <h3 style={headingStyle}>Edge Lengths Detail</h3>
          </div>
          <div style={{ ...cardContentStyle }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: CARD_HEADER_BG_COLOR }}>
                  <th
                    style={{
                      padding: "8px 8px 18px 8px",
                      textAlign: "left",
                      borderBottom: "1px solid #ccc",
                      color: "#f3f3f3",
                    }}
                  >
                    Type
                  </th>
                  <th
                    style={{
                      padding: "8px 8px 18px 8px",
                      textAlign: "right",
                      borderBottom: "1px solid #ccc",
                      color: "#f3f3f3",
                    }}
                  >
                    Length (ft)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    style={{ padding: "8px", borderBottom: "1px dotted #ccc" }}
                  >
                    Eaves
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      textAlign: "right",
                      borderBottom: "1px dotted #ccc",
                    }}
                  >
                    342
                  </td>
                </tr>
                <tr style={{ backgroundColor: "#fafafa" }}>
                  <td
                    style={{ padding: "8px", borderBottom: "1px dotted #ccc" }}
                  >
                    Rakes
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      textAlign: "right",
                      borderBottom: "1px dotted #ccc",
                    }}
                  >
                    119
                  </td>
                </tr>
                <tr>
                  <td
                    style={{ padding: "8px", borderBottom: "1px dotted #ccc" }}
                  >
                    Hips
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      textAlign: "right",
                      borderBottom: "1px dotted #ccc",
                    }}
                  >
                    99
                  </td>
                </tr>
                <tr style={{ backgroundColor: "#fafafa" }}>
                  <td
                    style={{ padding: "8px", borderBottom: "1px dotted #ccc" }}
                  >
                    Ridges
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      textAlign: "right",
                      borderBottom: "1px dotted #ccc",
                    }}
                  >
                    106
                  </td>
                </tr>
                <tr>
                  <td
                    style={{ padding: "8px", borderBottom: "1px dotted #ccc" }}
                  >
                    Valleys
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      textAlign: "right",
                      borderBottom: "1px dotted #ccc",
                    }}
                  >
                    55
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </PageWrapper>
    </>
  );
};

export default PDFTemplate;
