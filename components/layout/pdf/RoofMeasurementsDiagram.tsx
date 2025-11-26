// components/layout/pdf/RoofMeasurementsDiagram.tsx

import * as React from 'react';
import { LINE_COLORS, LineData, PolygonData, scaleCoordinatesToSVG } from './constants';
import { GAFSummary } from './processRoofData';

const SVG_WIDTH = 750;
const SVG_HEIGHT = 450;

interface RoofMeasurementsDiagramProps {
    linesData: LineData[];
    polygonsData: PolygonData[];
    summary: GAFSummary;
}

export const RoofMeasurementsDiagram: React.FC<RoofMeasurementsDiagramProps> = ({
    linesData,
    polygonsData,
    summary,
}) => {
    const { scaledLines, scaledPolygons } = scaleCoordinatesToSVG(
        linesData,
        polygonsData,
        SVG_WIDTH,
        SVG_HEIGHT
    );

    const linearSummary = Object.entries(summary).filter(([key]) =>
        Object.keys(LINE_COLORS).includes(key)
    ) as [keyof GAFSummary, number][];

    return (
        <div className="roof-diagram-container" style={{ padding: '20px' }}>
            {/* Header */}
            <div style={{ textAlign: 'right', fontSize: '12px', marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>Lengths in feet</span>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px' }}>
                    <div>Flash: {summary.valleys.toFixed(0)}</div>
                    <div>Step: {summary.hips.toFixed(0)}</div>
                    <div>Drip: {(summary.eaves + summary.rakes).toFixed(0)}</div>
                </div>
            </div>

            {/* SVG */}
            <div style={{ border: '1px solid #ccc', margin: '0 auto', width: SVG_WIDTH }}>
                <svg width={SVG_WIDTH} height={SVG_HEIGHT} viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}>
                    {/* Polygons */}
                    {scaledPolygons.map((polygon, index) => (
                        <polygon
                            key={`poly-${index}`}
                            points={polygon.points}
                            stroke={polygon.stroke}
                            strokeWidth={polygon.strokeWidth || 2}
                            fill={polygon.fill}
                        />
                    ))}

                    {/* Lines */}
                    {scaledLines.map((line, index) => (
                        <g key={`line-${index}`}>
                            <polyline
                                points={line.points}
                                stroke={line.color} // ✅ use scaled color
                                strokeWidth="3"
                                fill="none"
                            />
                            <text
                                x={line.midPoint.x}
                                y={line.midPoint.y - 5}
                                fill="black"
                                fontSize="12"
                                fontWeight="bold"
                                textAnchor="middle"
                            >
                                {line.length}
                            </text>
                        </g>
                    ))}
                </svg>
            </div>

            {/* Legend */}
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
                                {value.toFixed(0)} ft
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
