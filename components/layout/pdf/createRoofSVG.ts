import * as turf from "@turf/turf";

interface LineData {
    id: string;
    type: string;
    coordinates: [number, number][];
    properties: {
        label?: string;
        lengthFeet?: number;
        color?: string;
    };
}

interface PolygonData {
    id: string;
    type: string;
    coordinates: [number, number][][];
    properties: {
        label?: string;
        color?: string;
    };
}

const PADDING = 50;

const COLOR_MAP: { [key: string]: string } = {
    Ridge: "#FF6B35",
    Hip: "#008000",
    Valley: "#0000FF",
    Eave: "#800080",
    Rake: "#0066CC",
    Flashing: "#FF00FF",
    StepFlashing: "#9932CC",
    Parapet: "#666666",
    Step: "#FF00FF",
    Polygon: "#4A90D9",
    Default: "#4A90D9",
    Deduction: "#808080",
};

const formatLength = (length: number): string => `${length.toFixed(2)}  `;

export const createRoofSVG = (
    polygons: PolygonData[],
    lines: LineData[],
    width = 800,
    height = 600,
    rotationAngleDeg = 0
): string => {

    const features = [
        ...polygons.map(p => turf.polygon(p.coordinates)),
        ...lines.map(l => turf.lineString(l.coordinates)),
    ].filter(Boolean);

    if (!features.length) {
        return `
        <svg width="${width}" height="${height}">
            <text x="${width / 2}" y="${height / 2}" text-anchor="middle"
            style="font-size:20px;fill:#aaa;font-family:Arial">
                No Roof Diagram Data
            </text>
        </svg>`;
    }

    const bbox = turf.bbox(turf.featureCollection(features as Parameters<typeof turf.featureCollection>[0]));
    const [minX, minY, maxX, maxY] = bbox;

    const dataWidth = maxX - minX;
    const dataHeight = maxY - minY;

    if (dataWidth === 0 && dataHeight === 0) return "";

    const targetW = width - PADDING * 2;
    const targetH = height - PADDING * 2;

    const scale = Math.min(
        targetW / (dataWidth || 1),
        targetH / (dataHeight || 1)
    );

    if (!isFinite(scale)) return "";

    const transform = (coord: [number, number]): [number, number] => {
        const x = (coord[0] - minX) * scale + PADDING;
        const flippedY =
            height - PADDING - (coord[1] - minY) * scale;
        return [x, flippedY];
    };

    // Calculate the center point for rotation
    const diagramCenterX = width / 2;
    const diagramCenterY = height / 2;
    
    // Reverse the Mapbox rotation: rotate by -angle around the center
    const rotationTransform = `rotate(${-rotationAngleDeg}, ${diagramCenterX}, ${diagramCenterY})`;

    let svg = `
    <svg width="${width}" height="${height}"
    viewBox="0 0 ${width} ${height}"
    xmlns="http://www.w3.org/2000/svg"
    style="background:white">
        <g transform="${rotationTransform}">
    `;

    // 🔶 DRAW POLYGONS (with correct color logic)
    polygons.forEach(poly => {
        const rawLabel = poly.properties?.label || "polygon";
        const normLabel = rawLabel.trim().toLowerCase();

        const strokeColor =
            poly.properties?.color ||
            COLOR_MAP[normLabel.charAt(0).toUpperCase() + normLabel.slice(1)] ||
            COLOR_MAP.Polygon;

        const coords = poly.coordinates[0];
        const points = coords
            .map(c => transform(c).join(","))
            .join(" ");

        svg += `
        <polygon 
            points="${points}"
            style="
                fill:${strokeColor};
                fill-opacity:0.2;
                stroke:${strokeColor};
                stroke-width:2;
                stroke-linejoin:round;
                stroke-linecap:round;
            "
        />
    `;
    });

    // 🔶 DRAW LINES + LABELS
    lines.forEach(line => {
        const rawLabel = line.properties?.label || "Default";
        const normLabel =
            rawLabel.charAt(0).toUpperCase() +
            rawLabel.slice(1).toLowerCase();

        const strokeColor =
            line.properties?.color ||
            COLOR_MAP[normLabel] ||
            COLOR_MAP.Default;

        const points = line.coordinates
            .map(c => transform(c).join(","))
            .join(" ");

        svg += `
        <polyline 
            points="${points}"
            style="fill:none;stroke:${strokeColor};stroke-width:2;stroke-linecap:round;"
        />`;

        if (line.properties?.lengthFeet && line.coordinates.length > 1) {
            const midIndex = Math.floor(line.coordinates.length / 2);
            const [midX, midY] = transform(line.coordinates[midIndex]);

            const text = formatLength(line.properties.lengthFeet);
            const boxW = text.length * 7;
            svg += `
                <rect x="${midX - boxW / 2 - 5}" y="${midY - 10}"
                    width="${boxW + 10}" height="20"
                    rx="3" ry="3"
                    style="fill:white;stroke:#aaa;stroke-width:0.5;"
                />
                <text x="${midX}" y="${midY}"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    style="font-size:12px;font-family:Arial;font-weight:bold;fill:${strokeColor}">
                    ${text}
                </text>`;
        }
    });

    svg += `</g></svg>`; // Close the rotation group and the SVG tag
    return svg;
};