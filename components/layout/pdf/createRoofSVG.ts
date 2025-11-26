import * as turf from "@turf/turf";

// Interfaces (ensure same structure as your local data)
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

// SAME COLOR MAP FOR LINES + POLYGONS
const COLOR_MAP: { [key: string]: string } = {
    Ridge: "#FFA500",
    Hip: "#008000",
    Valley: "#0000FF",
    Eave: "#800080",
    Rake: "#FFC0CB",
    Flashing: "#FF00FF",
    StepFlashing: "#FF00FF",
    Parapet: "#666666",
    Step: "#FF00FF",
    Polygon: "#333333",
    Default: "#333333",
};

const formatLength = (length: number): string => `${length.toFixed(2)} ft`;

export const createRoofSVG = (
    polygons: PolygonData[],
    lines: LineData[],
    width = 800,
    height = 600
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

    const bbox = turf.bbox(turf.featureCollection(features));
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

    // 🔥 FINAL SVG STRING
    let svg = `
    <svg width="${width}" height="${height}"
    viewBox="0 0 ${width} ${height}"
    xmlns="http://www.w3.org/2000/svg"
    style="background:white">`;

    /* ---------------------------------------------------
       🔶 DRAW POLYGONS (with correct color logic)
    --------------------------------------------------- */
    // A. Polygons Draw Karein (Roof Facets)
    polygons.forEach(poly => {

        // Normalize label safe way (avoid undefined/null)
        const rawLabel = poly.properties?.label || "polygon";
        const normLabel = rawLabel.trim().toLowerCase();   // **critical fix**

        // Color priority:
        // 1) custom color
        // 2) color map
        // 3) fallback polygon color
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
                fill:none;
                stroke:${strokeColor};
                stroke-width:1;
                stroke-linejoin:round;
                stroke-linecap:round;
            "
        />
    `;
    });

    /* ---------------------------------------------------
       🔶 DRAW LINES + LABELS
    --------------------------------------------------- */
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
            style="fill:none;stroke:${strokeColor};stroke-width:1;stroke-linecap:round;"
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

    svg += `</svg>`;
    return svg;
};
