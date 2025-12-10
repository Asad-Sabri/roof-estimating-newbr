// drawPolygonDiagram.ts
export interface PolygonDiagramData {
  coordinates: [number, number][];
  color?: string; // Legacy color field
  label?: string;
  edges?: { start: [number, number]; end: [number, number]; lengthFeet: number }[]; 
  customColor?: string; // Mapbox color
  isDeduction?: boolean; 
}

export interface LineDiagramData {
    coordinates: [number, number][];
    customColor?: string;
    label: string;
    edges: { start: [number, number]; end: [number, number]; lengthFeet: number }[];
}

export const drawDiagramOnCanvas = (polygons: PolygonDiagramData[], lines: LineDiagramData[], rotationAngleDeg: number = 0): string | null => {
  if ((!polygons || polygons.length === 0) && (!lines || lines.length === 0)) return null;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Canvas Size
  canvas.width = 800;
  canvas.height = 600;
  const PADDING = 40; 

  // White background
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // --- 1. Saare Points ka Bounding Box Calculate Karein ---
  const allPoints = [
    ...(polygons || []).flatMap(p => p.coordinates),
    ...(lines || []).flatMap(l => l.edges.flatMap(e => [e.start, e.end])),
  ];

  if (allPoints.length === 0) return null;

  const minX = Math.min(...allPoints.map(p => p[0]));
  const minY = Math.min(...allPoints.map(p => p[1]));
  const maxX = Math.max(...allPoints.map(p => p[0]));
  const maxY = Math.max(...allPoints.map(p => p[1]));
  
  const dataWidth = maxX - minX;
  const dataHeight = maxY - minY;

  if (dataWidth === 0 && dataHeight === 0) return null;

  // Scaling Factor Calculate Karein
  const availableWidth = canvas.width - 2 * PADDING;
  const availableHeight = canvas.height - 2 * PADDING;
  
  const scaleFactorX = dataWidth > 0 ? availableWidth / dataWidth : Infinity;
  const scaleFactorY = dataHeight > 0 ? availableHeight / dataHeight : Infinity;
  const scaleFactor = Math.min(scaleFactorX, scaleFactorY, 100); 
  
  // Centering Offsets Calculate Karein
  const scaledDataWidth = dataWidth * scaleFactor;
  const scaledDataHeight = dataHeight * scaleFactor;

  // Center of the data in original coordinates
  const dataCenterX = (minX + maxX) / 2;
  const dataCenterY = (minY + maxY) / 2;
  
  // Center of the canvas
  const canvasCenterX = canvas.width / 2;
  const canvasCenterY = canvas.height / 2;
  
  // Transformation helper function (Yeh point ko scale, translate, aur ROTATE karega)
  // Hum pehle data ko center karte hain, phir rotation apply karte hain, phir canvas par center karte hain.
  const transformPoint = (point: [number, number]): { x: number, y: number } => {
    // 1. Point ko data center ke relative nikalna (Translation)
    const normalizedX = (point[0] - dataCenterX) * scaleFactor;
    const normalizedY = (point[1] - dataCenterY) * scaleFactor;
    
    // 2. Ab yahan rotation correction apply hogi. 
    // Agar input coordinates Mapbox bearing (e.g., 45 deg) se rotated hain, toh hum
    // unhe utna hi reverse rotate karenge taaki woh straight ho jaayen (e.g., -45 deg).
    const angleRad = -rotationAngleDeg * (Math.PI / 180); // Reverse rotation
    const cosA = Math.cos(angleRad);
    const sinA = Math.sin(angleRad);
    
    const rotatedX = normalizedX * cosA - normalizedY * sinA;
    const rotatedY = normalizedX * sinA + normalizedY * cosA;

    // 3. Final position ko canvas par center karna
    const x = rotatedX + canvasCenterX;
    const y = rotatedY + canvasCenterY;
    
    return { x, y };
  };

  // --- 2. Polygons Draw Karein ---
  // Drawing logic is transformPoint() use karegi.
  polygons.forEach((polygon) => {
    const coords = polygon.coordinates;
    if (!coords || coords.length === 0) return;

    // ... (Styling code yahi rahega)
    const color = polygon.customColor || "#0f2346";
    const isDeduction = polygon.isDeduction === true;
    ctx.fillStyle = isDeduction ? "rgba(128, 128, 128, 0.3)" : `${color}30`;
    ctx.strokeStyle = color;
    ctx.lineWidth = isDeduction ? 2 : 3;
    
    // Polygon Path
    ctx.beginPath();
    coords.forEach((point: [number, number], i: number) => {
      const { x, y } = transformPoint(point); 
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Polygon edge labels
    polygon.edges?.forEach(edge => {
      const start = transformPoint(edge.start);
      const end = transformPoint(edge.end);
      
      const midpointX = (start.x + end.x) / 2;
      const midpointY = (start.y + end.y) / 2;

      // Label Drawing (Wahi logic jo text box ko white background de kar draw karta hai)
      ctx.font = 'bold 10px Arial';
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      // ... (Rest of label drawing)
      const text = `${edge.lengthFeet.toFixed(1)} ft`;
      const textMetrics = ctx.measureText(text);
      const padding = 3;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(midpointX - textMetrics.width / 2 - padding, midpointY - 10 - padding, textMetrics.width + 2 * padding, 14 + 2 * padding);
      ctx.fillStyle = color;
      ctx.fillText(text, midpointX, midpointY);
    });
  });

  // --- 3. Lines Draw Karein ---
  lines.forEach(line => {
    const color = line.customColor || "#000000";
    
    line.edges.forEach(edge => {
      const start = transformPoint(edge.start);
      const end = transformPoint(edge.end);

      // Segment Draw Karein
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      // Edge Length Label Add Karein
      const midpointX = (start.x + end.x) / 2;
      const midpointY = (start.y + end.y) / 2;

      // Label Drawing (Wahi logic)
      ctx.font = 'bold 12px Arial';
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      // ... (Rest of label drawing)
      const text = `${edge.lengthFeet.toFixed(1)} ft`;
      const textMetrics = ctx.measureText(text);
      const padding = 5;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(midpointX - textMetrics.width / 2 - padding, midpointY - 12 - padding, textMetrics.width + 2 * padding, 18 + 2 * padding);
      ctx.fillStyle = color;
      ctx.fillText(text, midpointX, midpointY);
    });
  });

  return canvas.toDataURL("image/png");
};