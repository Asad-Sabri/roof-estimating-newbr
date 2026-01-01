// Google Solar API Service
import { axiosInstance, handleAPIRequest } from "./axiosInstance";

interface RoofSegment {
  polygon: {
    exterior: {
      vertices: Array<{
        latitude: number;
        longitude: number;
      }>;
    };
  };
  pitchDegrees: number;
  azimuthDegrees: number;
  areaMeters2: number;
  planeHeightAtCenterMeters: number;
}

interface BuildingInsightsResponse {
  roofSegments?: RoofSegment[];
  buildingStats?: {
    floorAreaMeters2: number;
  };
}

/**
 * Fetch building insights from Google Solar API
 * This will automatically detect roof polygons
 */
export const getBuildingInsightsAPI = async (lat: number, lng: number) => {
  // This should be called from backend API route
  // Frontend -> Backend API Route -> Google Solar API
  return handleAPIRequest(
    axiosInstance.post,
    "/api/google-solar/building-insights",
    { lat, lng }
  );
};

/**
 * Convert roof segments to polygon coordinates for map display
 */
export const convertRoofSegmentsToPolygons = (
  roofSegments: RoofSegment[]
): Array<{
  coordinates: [number, number][][];
  area: number;
  pitch: number;
}> => {
  return roofSegments.map((segment) => {
    const vertices = segment.polygon.exterior.vertices;
    const coordinates: [number, number][] = vertices.map((v) => [
      v.longitude,
      v.latitude,
    ]);
    
    // Close the polygon
    if (
      coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
      coordinates[0][1] !== coordinates[coordinates.length - 1][1]
    ) {
      coordinates.push(coordinates[0]);
    }

    return {
      coordinates: [coordinates],
      area: segment.areaMeters2 * 10.7639, // Convert to sq ft
      pitch: segment.pitchDegrees,
    };
  });
};

