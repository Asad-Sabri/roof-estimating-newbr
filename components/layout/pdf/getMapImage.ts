//getMapImage.ts
export interface MapOptions {
  zoom?: number;
  width?: number;
  height?: number;
}

// Center calculate karo polygons aur lines se
export const getMapCenter = (polygons: any[], lines: any[]) => {
  const allCoords: [number, number][] = [];

  polygons.forEach(p =>
    p.coordinates?.[0]?.forEach((c: [number, number]) => allCoords.push(c))
  );
  lines.forEach(l =>
    l.coordinates?.forEach((c: [number, number]) => allCoords.push(c))
  );

  if (allCoords.length === 0) return { lat: 0, lng: 0 };

  const latSum = allCoords.reduce((sum, c) => sum + c[1], 0);
  const lngSum = allCoords.reduce((sum, c) => sum + c[0], 0);

  return { lat: latSum / allCoords.length, lng: lngSum / allCoords.length };
};

// Mapbox Static Image URL generate karo
export const getMapboxMapURL = (
  center: { lat: number; lng: number },
  options: MapOptions = {}
) => {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const zoom = options.zoom ?? 21; 
    
  const width = options.width ?? 1000;   // bigger image, higher clarity
  const height = options.height ?? 800;

  return `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${center.lng},${center.lat},${zoom},0,0/${width}x${height}?access_token=${token}`;
};
