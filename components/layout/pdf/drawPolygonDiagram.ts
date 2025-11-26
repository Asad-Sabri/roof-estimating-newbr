//drawPolygonDiagram.ts
export interface PolygonDiagramData {
  coordinates: [number, number][];
  color?: string;
  label?: string;
  edges?: { start: [number, number]; end: [number, number]; lengthFeet: number }[];
}

export interface PolygonDiagramData {
  coordinates: [number, number][];
  color?: string; // Legacy color field
  label?: string;
  // edges field mein ab lengthFeet har edge ke liye hona chahiye
  edges?: { start: [number, number]; end: [number, number]; lengthFeet: number }[]; 
  customColor?: string; // Mapbox color
  isDeduction?: boolean; 
}

// Lines data ke liye interface (assumed structure)
export interface LineDiagramData {
    coordinates: [number, number][];
    customColor?: string;
    label: string;
    // Har line segment ke liye edges ka array
    edges: { start: [number, number]; end: [number, number]; lengthFeet: number }[];
}


// Polygons aur Lines dono ko draw karne ke liye function ko update kiya gaya
export const drawDiagramOnCanvas = (polygons: PolygonDiagramData[], lines: LineDiagramData[]): string | null => {
  if ((!polygons || polygons.length === 0) && (!lines || lines.length === 0)) return null;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Size set karein
  canvas.width = 800;
  canvas.height = 600;

  // White background set karein
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const scaleFactor = 10; // Aapka scale factor

  // --- 1. Polygons Draw Karein ---
  polygons.forEach((polygon) => {
    const coords = polygon.coordinates;
    if (!coords || coords.length === 0) return;

    // Mapbox ka customColor use karein, agar nahi hai toh default (#0f2346)
    const color = polygon.customColor || "#0f2346";
    const isDeduction = polygon.isDeduction === true;

    // Set Fill (Halaka sa transparent fill)
    ctx.fillStyle = isDeduction ? "rgba(128, 128, 128, 0.3)" : `${color}30`; // 30 is alpha value for 18% opacity

    // Set Stroke (Thicker line, solid color)
    ctx.strokeStyle = color;
    ctx.lineWidth = isDeduction ? 2 : 3;

    ctx.beginPath();
    coords.forEach((point: [number, number], i: number) => {
      const x = point[0] * scaleFactor;
      const y = point[1] * scaleFactor;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill(); // Fill the area
    ctx.stroke(); // Draw the outline

    // Polygon edges par length label add karein (Agar data mein available hai)
    polygon.edges?.forEach(edge => {
        const midpointX = (edge.start[0] + edge.end[0]) / 2 * scaleFactor;
        const midpointY = (edge.start[1] + edge.end[1]) / 2 * scaleFactor;

        ctx.font = 'bold 10px Arial';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        
        const text = `${edge.lengthFeet.toFixed(1)} ft`;
        const textMetrics = ctx.measureText(text);
        const padding = 3;
        
        // Background for the label (white box)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(
            midpointX - textMetrics.width / 2 - padding,
            midpointY - 10 - padding, // approximate text height
            textMetrics.width + 2 * padding,
            14 + 2 * padding // approximate box height
        );

        // Draw the text
        ctx.fillStyle = color;
        ctx.fillText(text, midpointX, midpointY);
    });
  });

  // --- 2. Lines Draw Karein ---
  lines.forEach(line => {
      const color = line.customColor || "#000000";
      
      // Lines segments ko draw karein aur labels add karein
      line.edges.forEach(edge => {
          // Segment Draw Karein
          ctx.strokeStyle = color;
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';
          
          ctx.beginPath();
          ctx.moveTo(edge.start[0] * scaleFactor, edge.start[1] * scaleFactor);
          ctx.lineTo(edge.end[0] * scaleFactor, edge.end[1] * scaleFactor);
          ctx.stroke();

          // Edge Length Label Add Karein
          const midpointX = (edge.start[0] + edge.end[0]) / 2 * scaleFactor;
          const midpointY = (edge.start[1] + edge.end[1]) / 2 * scaleFactor;

          ctx.font = 'bold 12px Arial';
          ctx.fillStyle = color;
          ctx.textAlign = 'center';
          
          // Background for the label (white box)
          const text = `${edge.lengthFeet.toFixed(1)} ft`;
          const textMetrics = ctx.measureText(text);
          const padding = 5;
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillRect(
              midpointX - textMetrics.width / 2 - padding,
              midpointY - 12 - padding, // approximate text height
              textMetrics.width + 2 * padding,
              18 + 2 * padding // approximate box height
          );

          // Draw the text
          ctx.fillStyle = color;
          ctx.fillText(text, midpointX, midpointY);
      });
  });


  return canvas.toDataURL("image/png");
};