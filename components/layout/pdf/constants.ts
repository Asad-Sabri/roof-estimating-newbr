// /constants.ts

export const LINE_COLORS: Record<string, string> = {
    'bend': '#940062',
    'eave': '#808080',
    'hip': '#FFFF00',
    'rake': '#008000',
    'ridge': '#FF0000',
    'valley': '#4B0082',
    'parapet': '#000000',
};

interface Edge {
    lengthFeet: number;
}

export interface LineData {
    id?: string;
    label?: string;
    customColor?: string;
    edges?: Edge[];
    coordinates: [number, number][];
}

export interface PolygonData {
    id?: string;
    label?: string;
    customColor?: string;
    edges?: Edge[];
    coordinates: [number, number][][]; // polygon rings
}

interface BoundingBox {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}

const projectCoordinates = (
    coords: [number, number][],
    dataCenterX: number,
    dataCenterY: number,
    scaleFactor: number,
    svgCenterX: number,
    svgCenterY: number
): string => {
    return coords
        .map(([lng, lat]) => {
            const x = (lng - dataCenterX) * scaleFactor + svgCenterX;
            const y = svgCenterY - (lat - dataCenterY) * scaleFactor;
            return `${x},${y}`;
        })
        .join(" ");
};

export const scaleCoordinatesToSVG = (
    lines: LineData[] = [],
    polygons: PolygonData[] = [],
    svgWidth: number = 500,
    svgHeight: number = 500
) => {
    if (!Array.isArray(lines) || !Array.isArray(polygons)) {
        return {
            scaledLines: [],
            scaledPolygons: [],
            viewBox: `0 0 ${svgWidth} ${svgHeight}`,
        };
    }

    const allGeometries = [...lines, ...polygons];

    if (allGeometries.length === 0) {
        return {
            scaledLines: [],
            scaledPolygons: [],
            viewBox: `0 0 ${svgWidth} ${svgHeight}`,
        };
    }

    const allCoords: [number, number][] = allGeometries.flatMap((g) => {
        if ("coordinates" in g && Array.isArray(g.coordinates)) {
            if (Array.isArray(g.coordinates[0][0])) {
                return g.coordinates[0]; // polygon outer ring
            }
            return g.coordinates; // line
        }
        return [];
    });

    const bbox: BoundingBox = allCoords.reduce(
        (acc: BoundingBox, coord: [number, number]) => {
            const [lng, lat] = coord;
            return {
                minX: Math.min(acc.minX, lng),
                maxX: Math.max(acc.maxX, lng),
                minY: Math.min(acc.minY, lat),
                maxY: Math.max(acc.maxY, lat),
            };
        },
        { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
    );

    const padding = 20;
    const dataWidth = bbox.maxX - bbox.minX;
    const dataHeight = bbox.maxY - bbox.minY;
    const effectiveWidth = svgWidth - padding * 2;
    const effectiveHeight = svgHeight - padding * 2;
    const scaleFactor = Math.min(effectiveWidth / dataWidth, effectiveHeight / dataHeight);

    const dataCenterX = (bbox.minX + bbox.maxX) / 2;
    const dataCenterY = (bbox.minY + bbox.maxY) / 2;
    const svgCenterX = svgWidth / 2;
    const svgCenterY = svgHeight / 2;

    // -------------------------
    // SCALE LINES
    // -------------------------
    const scaledLines = lines.map((line) => {
        const totalLength =
            line.edges && line.edges.length > 0
                ? line.edges.reduce((sum, e) => sum + e.lengthFeet, 0)
                : 0;

        const points = projectCoordinates(
            line.coordinates,
            dataCenterX,
            dataCenterY,
            scaleFactor,
            svgCenterX,
            svgCenterY
        );

        const [p1, p2] = [line.coordinates[0], line.coordinates[1] || line.coordinates[0]];
        const midLng = (p1[0] + p2[0]) / 2;
        const midLat = (p1[1] + p2[1]) / 2;
        const midX = (midLng - dataCenterX) * scaleFactor + svgCenterX;
        const midY = svgCenterY - (midLat - dataCenterY) * scaleFactor;

        const key = (line.customColor || line.label || 'unknown').toLowerCase();
        const strokeColor = line.customColor || LINE_COLORS[key] || '#444';

        return {
            points,
            label: line.label?.toLowerCase() || 'unknown',
            length: totalLength > 0 ? totalLength.toFixed(0) + ' ft' : 'N/A',
            midPoint: { x: midX, y: midY },
            color: strokeColor,
        };
    });

    // -------------------------
    // SCALE POLYGONS
    // -------------------------
    const scaledPolygons = polygons.map((polygon) => {
        const ring = polygon.coordinates[0];
        const points = projectCoordinates(
            ring,
            dataCenterX,
            dataCenterY,
            scaleFactor,
            svgCenterX,
            svgCenterY
        );

        const strokeColor = polygon.customColor || LINE_COLORS[polygon.label?.toLowerCase() || 'unknown'] || '#000';

        return {
            points,
            fill: 'white',
            stroke: strokeColor,
            strokeWidth: 2,
            label: polygon.label?.toLowerCase() || 'unknown',
        };
    });

    return {
        scaledLines,
        scaledPolygons,
        viewBox: `0 0 ${svgWidth} ${svgHeight}`,
    };
};
