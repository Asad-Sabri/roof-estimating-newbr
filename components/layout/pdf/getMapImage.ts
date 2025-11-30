// MapOptions interface ko yahin define kar dein, taaki woh kisi aur file par depend na kare.
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

/**
 * Mapbox Static Map API URL generate karo
 *
 * @param center - Map ka center point { lat, lng }
 * @param options - Image ke options (zoom, width, height)
 * @returns Mapbox Static API URL
 */
export const getMapboxMapURL = (
  center: { lat: number; lng: number },
  options: MapOptions = {}
) => {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const zoom = options.zoom ?? 20;
  const width = options.width ?? 1000;
  const height = options.height ?? 800;
  // Mapbox Satellite style ka URL
  const mapStyle = 'mapbox/satellite-streets-v11'; 

  if (!accessToken) {
    console.error("NEXT_PUBLIC_MAPBOX_TOKEN is not set.");
    // Token na hone par placeholder image wapas karo
    return `https://placehold.co/${width}x${height}/E9967A/FFFFFF?text=Mapbox+Token+Missing`;
  }

  // Mapbox Static Images API URL Format:
  // https://api.mapbox.com/styles/v1/{style_id}/static/{lon},{lat},{zoom}/[w]x[h][@2x]?access_token=YOUR_TOKEN
  return `https://api.mapbox.com/styles/v1/${mapStyle}/static/${center.lng},${center.lat},${zoom}/${width}x${height}@2x?access_token=${accessToken}`;
};

/**
 * Mapbox Static Map image ko fetch karke Base64 Data URL mein convert karta hai.
 * Ye html2pdf.js mein CORS issues ko bypass karne ke liye zaroori hai.
 *
 * @param center - Map ka center point { lat, lng }
 * @param options - Image ke options (zoom, width, height)
 * @returns Base64 Data URL string
 */
export const getMapImageBase64 = async (
  center: { lat: number; lng: number },
  options: MapOptions = {}
): Promise<string> => {
    // Ab Mapbox URL use ho raha hai
    const mapUrl = getMapboxMapURL(center, options);

    try {
        const response = await fetch(mapUrl);
        
        if (!response.ok) {
            // Agar Mapbox token invalid ho ya rate limit exceed ho jaye
            const errorText = await response.text();
            console.error(`Mapbox Static Maps API error: ${response.status} ${response.statusText}`, errorText);
            throw new Error(`Failed to fetch map image: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        
        return await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result);
                } else {
                    reject(new Error("Failed to convert image Blob to Data URL."));
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

    } catch (error) {
        console.error("Error generating Base64 map image:", error);
        // Fallback: Agar Base64 conversion fail ho jaye, toh placeholder Data URL wapas karo.
        const width = options.width ?? 1000;
        const height = options.height ?? 800;
        const placeholderUrl = `https://placehold.co/${width}x${height}/E9967A/FFFFFF?text=Map+Load+Failed`;
        return placeholderUrl; 
    }
};

// NOTE: Ab Mapbox Static Images API ka logic istemaal ho raha hai.