export interface PolygonDiagramData {
  coordinates: [number, number][];
  color?: string;
  label?: string;
  edges?: { start: [number, number]; end: [number, number]; lengthFeet: number }[];
}

export const drawPolygonsOnCanvas = (polygons: any[]): string | null => {
  if (!polygons || polygons.length === 0) return null;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  canvas.width = 800;
  canvas.height = 600;

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  polygons.forEach((polygon) => {
    const coords = polygon.coordinates;
    if (!coords || coords.length === 0) return;

    ctx.fillStyle = polygon.customColor || "#0f2346";
    ctx.strokeStyle = polygon.customColor || "#0f2346";
    ctx.lineWidth = 2;

    ctx.beginPath();
    coords.forEach((point: [number, number], i: number) => {
      const x = point[0] * 10; // scale factor
      const y = point[1] * 10;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });

  return canvas.toDataURL("image/png");
};
