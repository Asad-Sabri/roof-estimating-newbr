//mapboxSnapshot.ts
import mapboxgl from "mapbox-gl";

interface SnapshotOptions {
  center: [number, number]; // [lng, lat] of house
  zoom?: number; // default 20
  width?: number; // px
  height?: number; // px
  style?: string; // Mapbox style URL
  accessToken: string;
}

/**
 * Generates a base64 PNG snapshot of a map (top view)
 */
export const generateTopViewSnapshot = async ({
  center,
  zoom = 20,
  width = 800,
  height = 600,
  style = "https://maps.googleapis.com/maps/api/staticmap?center=${center.lat},${center.lng}&zoom=${zoom}&size=${width}x${height}&maptype=${mapType}&key=${API_KEY}`;",
  accessToken,
}: SnapshotOptions): Promise<string> => {
  const container = document.createElement("div");
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.position = "absolute";
  container.style.top = "-10000px"; // offscreen
  document.body.appendChild(container);

  mapboxgl.accessToken = accessToken;

  const map = new mapboxgl.Map({
    container,
    style,
    center,
    zoom,
    interactive: false,
    preserveDrawingBuffer: true,
  });

  await new Promise<void>((resolve) => {
    map.on("load", () => resolve());
  });

  const canvas = container.querySelector("canvas") as HTMLCanvasElement;
  const dataUrl = canvas.toDataURL("image/png");

  map.remove();
  document.body.removeChild(container);

  return dataUrl;
};
