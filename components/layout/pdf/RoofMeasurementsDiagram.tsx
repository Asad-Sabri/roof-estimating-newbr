import * as React from 'react';
import { LINE_COLORS, LineData, PolygonData, scaleCoordinatesToSVG } from './constants';
import { GAFSummary } from './processRoofData';

const SVG_WIDTH = 750;
const SVG_HEIGHT = 450;

interface RoofMeasurementsDiagramProps {
    linesData: LineData[];
    polygonsData: PolygonData[];
    summary: GAFSummary;
    // NEW PROP ADDED: Control to show/hide lengths and detailed legend
    showLengths?: boolean; 
}

export const RoofMeasurementsDiagram: React.FC<RoofMeasurementsDiagramProps> = ({
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

    return (
        <div className="roof-diagram-container" style={{ padding: '20px' }}>
            
            {/* Lengths in feet header (Optional, only show if showLengths is true) */}
            {/*
            {showLengths && (
                <div style={{ textAlign: 'right', fontSize: '12px', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 'bold' }}>Lengths in feet</span>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px' }}>
                        <div>Flash: {summary.valleys.toFixed(0)}</div>
                        <div>Step: {summary.hips.toFixed(0)}</div>
                        <div>Drip: {(summary.eaves + summary.rakes).toFixed(0)}</div>
                    </div>
                </div>
            )}
            */}

            <div style={{ border: '1px solid #ccc', margin: '0 auto', width: SVG_WIDTH }}>
                <svg width={SVG_WIDTH} height={SVG_HEIGHT} viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}>
                    
                    {/* Polygons */}
                    {scaledPolygons.map((polygon, idx) => (
                        <g key={`poly-${idx}`}>
                            <polygon
                                points={polygon.points}
                                stroke={polygon.stroke}
                                strokeWidth={polygon.strokeWidth}
                                fill={polygon.fill}
                            />
                            
                            {/* FIX 1: Polygon edge labels sirf tab show hon jab showLengths true ho */}
                            {showLengths && polygon.edgeLabels.map((edge, i) => (
                                <text
                                    key={`poly-edge-${i}`}
                                    x={edge.x}
                                    y={edge.y - 5}
                                    fill="black"
                                    fontSize="12"
                                    fontWeight="bold"
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
                                strokeWidth={3}
                                fill="none"
                            />
                            
                            {/* FIX 2: Line edge labels sirf tab show hon jab showLengths true ho */}
                            {showLengths && line.edgeLabels.map((edge, i) => (
                                <text
                                    key={`line-edge-${i}`}
                                    x={edge.x}
                                    y={edge.y - 5}
                                    fill="black"
                                    fontSize="12"
                                    fontWeight="bold"
                                    textAnchor="middle"
                                >
                                    {edge.length}
                                </text>
                            ))}
                        </g>
                    ))}
                </svg>
            </div>

            {/* FIX 3: Legend sirf tab show ho jab showLengths true ho (kyunki ismein feet values hain) */}
            {showLengths && (
                <div
                    style={{
                        marginTop: '15px',
                        borderTop: '1px solid #ccc',
                        paddingTop: '10px',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '30px',
                    }}
                >
                    {linearSummary.map(([key, value]) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center' }}>
                            <div
                                style={{
                                    width: '15px',
                                    height: '15px',
                                    backgroundColor: LINE_COLORS[key],
                                    marginRight: '8px',
                                    border: '1px solid #555',
                                }}
                            ></div>
                            <div style={{ lineHeight: '1.2' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                </div>
                                <div style={{ fontSize: '14px', marginTop: '2px' }}>
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