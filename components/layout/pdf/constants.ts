// /constants.ts

export const LINE_COLORS: Record<string, string> = {
    'ridge': '#FF0000',
    'hip': '#FFA500',
    'valley': '#800080',
    'rake': '#0000FF',
    'eave': '#008000',
    'flashing': '#008080',
    'stepFlashing': '#393939ff',
    'bend': '#940062',
    'deduction': '#000000',
};

interface Edge {
    lengthFeet: number;
    start?: [number, number];
    end?: [number, number];
}

export interface LineData {
    id?: string;
    label?: string;
    customColor?: string;
    edges?: Edge[];
    coordinates: [number, number][];
}

export interface PolygonData {
    area: number;
    pitch: any;
    id?: string;
    label?: string;
    customColor?: string;
    edges?: Edge[];
    coordinates: [number, number][][];
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

    const allCoords: [number, number][] = allGeometries.flatMap((g: any) => {
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
        const points = projectCoordinates(
            line.coordinates,
            dataCenterX,
            dataCenterY,
            scaleFactor,
            svgCenterX,
            svgCenterY
        );

        const key = (line.customColor || line.label || 'unknown').toLowerCase();
        const strokeColor = line.customColor || LINE_COLORS[key] || '#4A90D9';

        // Generate edge labels
        const edgeLabels = (line.edges || []).map((edge) => {
            const start = edge.start || line.coordinates[0];
            const end = edge.end || line.coordinates[1] || start;

            const midX = ((start[0] + end[0]) / 2 - dataCenterX) * scaleFactor + svgCenterX;
            const midY = svgCenterY - ((start[1] + end[1]) / 2 - dataCenterY) * scaleFactor;

            return {
                x: midX,
                y: midY,
                length: edge.lengthFeet.toFixed(0) + '',
            };
        });

        return {
            points,
            label: line.label?.toLowerCase() || 'unknown',
            color: strokeColor,
            edgeLabels,
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

        const strokeColor = polygon.customColor || LINE_COLORS[polygon.label?.toLowerCase() || 'unknown'] || '#4A90D9';

        const edgeLabels = (polygon.edges || []).map((edge) => {
            const start = edge.start || ring[0];
            const end = edge.end || ring[1] || start;

            const midX = ((start[0] + end[0]) / 2 - dataCenterX) * scaleFactor + svgCenterX;
            const midY = svgCenterY - ((start[1] + end[1]) / 2 - dataCenterY) * scaleFactor;

            return {
                x: midX,
                y: midY,
                length: edge.lengthFeet.toFixed(0) + '',
            };
        });

        return {
            points,
            fill: strokeColor,
            stroke: strokeColor,
            strokeWidth: 2,
            label: polygon.label?.toLowerCase() || 'unknown',
            edgeLabels,
        };
    });

    return {
        scaledLines,
        scaledPolygons,
        viewBox: `0 0 ${svgWidth} ${svgHeight}`,
    };
};
