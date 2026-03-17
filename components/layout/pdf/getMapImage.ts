// C:\Users\ASAD SABRI\Documents\GitHub\roof-estimating-newbr\components\layout\pdf\getMapImage.ts

export interface MapOptions {
  zoom?: number;
  width?: number;
  height?: number;
  bearing?: number; // New: Bearing for rotation (0 to 360)
}

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

export const getMapboxMapURL = (
  center: { lat: number; lng: number },
  options: MapOptions = {}
) => {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const zoom = options.zoom ?? 20;
  const width = options.width ?? 1000;
  const height = options.height ?? 800;
  const mapStyle = 'mapbox/satellite-streets-v11';
  const bearing = options.bearing ?? 0; // Use bearing

  if (!accessToken) {
    console.error("NEXT_PUBLIC_MAPBOX_TOKEN is not set.");
    return `https://placehold.co/${width}x${height}/E9967A/FFFFFF?text=Mapbox+Token+Missing`;
  }

  // Updated URL format: /{lng},{lat},{zoom},{bearing}/{width}x{height}
  return `https://api.mapbox.com/styles/v1/${mapStyle}/static/${center.lng},${center.lat},${zoom},${bearing}/${width}x${height}@2x?access_token=${accessToken}`;
};

/** Returns a data URL placeholder so PDF can embed it (no CORS). */
function getPlaceholderDataUrl(width: number, height: number, text: string): string {
  if (typeof document === "undefined") return "";
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.fillStyle = "#E9967A";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#333";
  ctx.font = "18px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, width / 2, height / 2);
  return canvas.toDataURL("image/png");
}

export const getMapImageBase64 = async (
  center: { lat: number; lng: number },
  options: MapOptions = {}
): Promise<string> => {
  const width = options.width ?? 1000;
  const height = options.height ?? 800;
  const mapUrl = getMapboxMapURL(center, options);

  try {
    const response = await fetch(mapUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Mapbox Static Maps API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Failed to fetch map image: ${response.statusText}`);
    }

    const blob = await response.blob();

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") resolve(reader.result);
        else reject(new Error("Failed to convert image Blob to Data URL."));
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error generating Base64 map image:", error);
    return getPlaceholderDataUrl(width, height, "Map load failed");
  }
};