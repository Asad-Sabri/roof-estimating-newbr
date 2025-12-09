import * as React from "react";
import {
  LINE_COLORS,
  LineData,
  PolygonData,
  scaleCoordinatesToSVG,
} from "./constants";
import { GAFSummary } from "./processRoofData";

// Hardcoded viewbox dimensions (Inko ab component ke andar define kiya hai)
// const SVG_WIDTH = 750;
// const SVG_HEIGHT = 450;

// Inner ViewBox dimensions (yeh coordinates scale karne ke liye use honge)
const VIEWBOX_WIDTH = 750;
const VIEWBOX_HEIGHT = 450;


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
    // Ab yeh viewbox values use honge scaling ke liye
    VIEWBOX_WIDTH,
    VIEWBOX_HEIGHT
  );

  // Legend data only includes lines (Ridge, Hip, etc.)
  const linearSummary = Object.entries(summary).filter(([key]) =>
    Object.keys(LINE_COLORS).includes(key)
  ) as [keyof GAFSummary, number][];

  // Calculate combined linear feet for the summary table
  const flashLength = summary.valleys || 0;
  const stepLength = summary.hips || 0;
  const dripLength = (summary.eaves || 0) + (summary.rakes || 0);

  // Main container ko flexible banaya gaya hai
  return (
    <div 
      className="roof-diagram-container" 
      style={{ 
        fontFamily: 'Arial', 
        width: '100%', // Yeh sabse zaruri hai
        maxWidth: `${VIEWBOX_WIDTH}px`, // Optional: Agar aap ek max width chahte hain
        margin: '0 auto', // Center alignment, agar maxWidth set ho
      }}
    >
      
      {/* 1. Lengths in feet Header aur Summary ko right side mein adjust karna */}
      {showLengths && (
        <div 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-end', 
            marginBottom: '40px', 
            marginTop: '-10px',
            // Is div ko `width: 100%` se container ki tarah spread karna
            width: '100%', 
            // Relative positioning hata kar container ke flow me rakha hai
          }}
        >
          {/* Header */}
            <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#333', marginBottom: "10px"}}>Lengths in feet</span>
          
          {/* Values container */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'end',
              textAlign: 'right',
              gap: '10px',
              fontSize: '12px',
            }}
          >
            <div><span style={{ fontWeight: 'bold' }}>Flash:</span> {flashLength.toFixed(0)} ft</div>
            <div><span style={{ fontWeight: 'bold' }}>Step:</span> {stepLength.toFixed(0)} ft</div>
            <div><span style={{ fontWeight: 'bold' }}>Drip:</span> {dripLength.toFixed(0)} ft</div>
          </div>
        </div>
      )}
      
      {/* SVG (Drawing) - Ab yeh container ki width lega */}
      <div 
        style={{ 
          width: '100%', // Important: 100% width parent container se lega
          paddingBottom: `${(VIEWBOX_HEIGHT / VIEWBOX_WIDTH) * 100}%`, // Aspect ratio maintain karne ke liye padding-bottom trick
          position: 'relative', // Padding-bottom trick ke liye zaruri
        }}
      >
        <svg
          // width aur height properties hata di hain ya '100%' set kiye hain
          // width aur height ko relative set kiya hai position absolute se
          width="100%"
          height="100%"
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} // ViewBox set kiya hai
          // PreserveAspectRatio: Scale up/down karte waqt aspect ratio maintain karta hai
          preserveAspectRatio="xMidYMid meet" 
          style={{ 
            backgroundColor: '#fff', 
            border: '1px solid #ddd',
            position: 'absolute', // Padding-bottom trick ke liye
            top: 0,
            left: 0,
            
          }}
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
                    fontSize="12"
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
                    fontSize="12"
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
            gap: "15px", // Gap thoda kam kiya hai
            flexWrap: 'wrap', // Choti screens par wrap ho jayega
            marginTop: '15px', // Upar se space
          }}
        >
          {linearSummary.map(([key, value]) => (
            <div key={key} style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: "12px", // Legend box chota kiya hai
                  height: "12px",
                  backgroundColor: LINE_COLORS[key],
                  marginRight: "6px",
                  border: "1px solid #555",
                }}
              ></div>
              <div style={{ lineHeight: "1.2" }}>
                <div style={{ fontWeight: "bold", fontSize: "11px" }}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </div>
                <div style={{ fontSize: "13px", marginTop: "2px" }}>
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