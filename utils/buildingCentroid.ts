/**
 * Get building centroid for a given point (e.g. from geocoding).
 * Tries Mapbox Tilequery (building layer) and OSM Overpass; falls back to input point.
 * Used so the map pin lands on the building, not the street (Phase 1 requirement).
 */

const MAPBOX_TOKEN = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_MAPBOX_TOKEN : "";

export type BuildingCentroidResult = { lng: number; lat: number; source: "tilequery" | "osm" | "fallback" };

/**
 * Compute centroid of a polygon (first ring only).
 */
function polygonCentroid(coords: number[][]): [number, number] {
  if (!coords.length) return [0, 0];
  let sumLng = 0, sumLat = 0, n = 0;
  for (const c of coords) {
    if (Array.isArray(c) && c.length >= 2) {
      sumLng += c[0];
      sumLat += c[1];
      n++;
    }
  }
  return n ? [sumLng / n, sumLat / n] : [0, 0];
}

/**
 * Get building centroid for (lng, lat). Prefer building footprint centroid over street point.
 */
export async function getBuildingCentroid(lng: number, lat: number): Promise<BuildingCentroidResult> {
  // 1) Mapbox Tilequery – building layer
  if (MAPBOX_TOKEN) {
    try {
      for (const radius of [50, 100, 150]) {
        const url = `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/tilequery/${lng},${lat}.json?radius=${radius}&layers=building&access_token=${MAPBOX_TOKEN}`;
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();
        const features = data?.features;
        if (!Array.isArray(features) || features.length === 0) continue;

        let best: { feature: any; distance: number } | null = null;
        for (const f of features) {
          const geom = f?.geometry;
          if (!geom || (geom.type !== "Polygon" && geom.type !== "MultiPolygon")) continue;
          const ring = geom.type === "Polygon" ? geom.coordinates?.[0] : geom.coordinates?.[0]?.[0];
          if (!ring || !ring.length) continue;
          const [clng, clat] = polygonCentroid(ring);
          const dist = Math.pow(clng - lng, 2) + Math.pow(clat - lat, 2);
          if (!best || dist < best.distance) best = { feature: f, distance: dist };
        }
        if (best?.feature?.geometry) {
          const geom = best.feature.geometry;
          const ring = geom.type === "Polygon" ? geom.coordinates[0] : geom.coordinates[0][0];
          const [clng, clat] = polygonCentroid(ring);
          return { lng: clng, lat: clat, source: "tilequery" };
        }
      }
    } catch {
      // ignore
    }
  }

  // 2) OSM Overpass – building way
  try {
    const radius = 50;
    const query = `[out:json][timeout:15];(way["building"](around:${radius},${lat},${lng}););out geom;`;
    const res = await fetch(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
    );
    if (res.ok) {
      const data = await res.json();
      const elements = data?.elements;
      if (Array.isArray(elements) && elements.length > 0) {
        let closest: { coords: number[][]; dist: number } | null = null;
        for (const el of elements) {
          if (el.type !== "way" || !Array.isArray(el.geometry)) continue;
          const coords = el.geometry.map((p: { lat: number; lon: number }) => [p.lon, p.lat]);
          if (coords.length < 3) continue;
          const [clng, clat] = polygonCentroid(coords);
          const dist = Math.pow(clng - lng, 2) + Math.pow(clat - lat, 2);
          if (!closest || dist < closest.dist) closest = { coords, dist };
        }
        if (closest) {
          const [clng, clat] = polygonCentroid(closest.coords);
          return { lng: clng, lat: clat, source: "osm" };
        }
      }
    }
  } catch {
    // ignore
  }

  return { lng, lat, source: "fallback" };
}

/**
 * From Mapbox geocode feature, get best point for pin: try building centroid, else bbox center, else feature.center.
 */
export async function getPinCoordinatesFromFeature(feature: {
  center?: [number, number];
  bbox?: [number, number, number, number];
  geometry?: { type: string; coordinates?: number[] };
}): Promise<[number, number]> {
  let lng: number, lat: number;
  if (feature.geometry?.type === "Point" && feature.geometry.coordinates?.length >= 2) {
    [lng, lat] = feature.geometry.coordinates as [number, number];
  } else if (feature.center && feature.center.length >= 2) {
    [lng, lat] = feature.center;
  } else if (feature.bbox && feature.bbox.length >= 4) {
    lng = (feature.bbox[0] + feature.bbox[2]) / 2;
    lat = (feature.bbox[1] + feature.bbox[3]) / 2;
  } else {
    return [0, 0];
  }
  const result = await getBuildingCentroid(lng, lat);
  return [result.lng, result.lat];
}
