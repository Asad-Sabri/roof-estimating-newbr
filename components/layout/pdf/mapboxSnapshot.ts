// utils/mapboxSnapshot.ts
import mapboxgl from "mapbox-gl";

interface SnapshotOptions {
  center: [number, number]; // [lng, lat] of house
  zoom?: number; // default 20
  width?: number; // in px, default 800
  height?: number; // in px, default 600
  style?: string; // mapbox style URL, default Mapbox streets
  accessToken: string; // your Mapbox token
}

/**
 * Generates a base64 PNG snapshot of a map at a given center and zoom.
 * Does NOT include drawn polygons or lines.
 */
export const generateTopViewSnapshot = async ({
  center,
  zoom = 20,
  width = 800,
  height = 600,
  style = "mapbox://styles/mapbox/streets-v12",
  accessToken,
}: SnapshotOptions): Promise<string> => {
  // Create a hidden div for offscreen map
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
    preserveDrawingBuffer: true, // needed for canvas capture
  });

  // Wait for map to fully load
  await new Promise<void>((resolve) => {
    map.on("load", () => resolve());
  });

  // Grab canvas and convert to data URL
  const canvas = container.querySelector("canvas") as HTMLCanvasElement;
  const dataUrl = canvas.toDataURL("image/png");

  map.remove();
  document.body.removeChild(container);

  return dataUrl; // you can pass this as `topViewImage` to PDF
};
