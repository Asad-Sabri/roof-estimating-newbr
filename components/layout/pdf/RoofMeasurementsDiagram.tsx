import * as React from "react";
import {
  LINE_COLORS,
  LineData,
  PolygonData,
  scaleCoordinatesToSVG,
} from "./constants";
import { GAFSummary } from "./processRoofData";

const SVG_WIDTH = 750;
const SVG_HEIGHT = 450;

interface RoofMeasurementsDiagramProps {
  linesData: LineData[];
  polygonsData: PolygonData[];
  summary: GAFSummary;
  // NEW PROP ADDED: Control to show/hide lengths and detailed legend
  showLengths?: boolean;
}

export const RoofMeasurementsDiagram: React.FC<
  RoofMeasurementsDiagramProps
> = ({
  linesData,
  polygonsData,
  summary,
  showLengths = true, // Default to true for Full Report compatibility
}) => {
  const { scaledLines, scaledPolygons } = scaleCoordinatesToSVG(
    linesData,
    polygonsData,
    SVG_WIDTH,
    SVG_HEIGHT
  );

  // Legend data only includes lines (Ridge, Hip, etc.)
  const linearSummary = Object.entries(summary).filter(([key]) =>
    Object.keys(LINE_COLORS).includes(key)
  ) as [keyof GAFSummary, number][];

  // Calculate combined linear feet for the summary table
  const flashLength = summary.valleys || 0;
  const stepLength = summary.hips || 0;
  const dripLength = (summary.eaves || 0) + (summary.rakes || 0);

  return (
    <div className="roof-diagram-container" style={{ fontFamily: 'Arial' }}>
      
      {/* 1. Lengths in feet Header aur Summary ko right side mein adjust karna */}
      {showLengths && (
        <div 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-end', // Right align all content
            marginBottom: '0', // Margin removed for tighter spacing
            marginTop: '-40px',
            
          }}
        >
          {/* Header */}
            <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#333', marginRight: '40px',  }}>Lengths in feet</span>
          
          {/* Values container */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'end',
              textAlign: 'right',
              gap: '10px', // Increased gap for clarity
              fontSize: '12px',
            }}
          >
            <div style={{ fontWeight: 'bold' }}>Flash: {flashLength.toFixed(0)} ft</div>
            <div style={{ fontWeight: 'bold' }}>Step: {stepLength.toFixed(0)} ft</div>
            <div style={{ fontWeight: 'bold' }}>Drip: {dripLength.toFixed(0)} ft</div>
          </div>
        </div>
      )}
      
      {/* SVG (Drawing) - Iske upper ab kam space hogi */}
      <div style={{ width: SVG_WIDTH }}>
        <svg
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          style={{ backgroundColor: '#fff', border: '1px solid #ddd' }}
        >
          {/* Polygons */}
          {scaledPolygons.map((polygon, idx) => (
            <g key={`poly-${idx}`}>
              <polygon
                points={polygon.points}
                stroke={polygon.stroke}
                strokeWidth={2}
                fill={polygon.fill}
              />

              {/* Polygon edge labels sirf tab show hon jab showLengths true ho */}
              {showLengths &&
                polygon.edgeLabels.map((edge, i) => (
                  <text
                    key={`poly-edge-${i}`}
                    x={edge.x}
                    y={edge.y - 1}
                    fill="black"
                    fontSize="8"
                    textAnchor="middle"
                  >
                    {edge.length}
                  </text>
                ))}
            </g>
          ))}

          {/* Lines */}
          {scaledLines.map((line, idx) => (
            <g key={`line-${idx}`}>
              <polyline
                points={line.points}
                stroke={line.color}
                strokeWidth={2}
                fill="none"
              />

              {/* Line edge labels sirf tab show hon jab showLengths true ho */}
              {showLengths &&
                line.edgeLabels.map((edge, i) => (
                  <text
                    key={`line-edge-${i}`}
                    x={edge.x}
                    y={edge.y + 3}
                    fill="black"
                    fontSize="8"
                    textAnchor="middle"
                  >
                    {edge.length}
                  </text>
                ))}
            </g>
          ))}
        </svg>
      </div>

      {/* Original Detailed Legend */}
      {showLengths && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
          }}
        >
          {linearSummary.map(([key, value]) => (
            <div key={key} style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: "15px",
                  height: "15px",
                  backgroundColor: LINE_COLORS[key],
                  marginRight: "8px",
                  border: "1px solid #555",
                }}
              ></div>
              <div style={{ lineHeight: "1.2" }}>
                <div style={{ fontWeight: "bold", fontSize: "12px" }}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </div>
                <div style={{ fontSize: "14px", marginTop: "2px" }}>
                  {value.toFixed(0)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};