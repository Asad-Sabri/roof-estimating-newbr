export interface RoofPolygon {
  coordinates: [number, number][][];
  label?: string;
  labelPos?: [number, number];
}

export interface RoofLine {
  coordinates: [number, number][];
}

export const createRoofSVG = (
  polygons: RoofPolygon[],
  lines: RoofLine[],
  width = 800,
  height = 600
) => {
  const svgHeader = `
    <svg xmlns="http://www.w3.org/2000/svg"
         width="${width}"
         height="${height}"
         viewBox="0 0 ${width} ${height}"
         style="background:white;">
  `;

  let shapes = "";

  // ---- POLYGONS ----
  polygons.forEach(poly => {
    const points = poly.coordinates[0]
      .map(c => `${c[0]},${c[1]}`)
      .join(" ");

    shapes += `
      <polygon 
        points="${points}" 
        fill="none" 
        stroke="#ff0000" 
        stroke-width="2"
      />
    `;
  });

  // ---- LINES ----
  lines.forEach(line => {
    const points = line.coordinates
      .map(c => `${c[0]},${c[1]}`)
      .join(" ");

    shapes += `
      <polyline 
        points="${points}" 
        fill="none" 
        stroke="#0000ff" 
        stroke-width="2"
      />
    `;
  });

  // ---- LABELS ----
  polygons.forEach(poly => {
    if (!poly.label || !poly.labelPos) return;

    shapes += `
      <text 
        x="${poly.labelPos[0]}" 
        y="${poly.labelPos[1]}" 
        font-size="20"
        fill="black"
      >
        ${poly.label}
      </text>
    `;
  });

  return svgHeader + shapes + "</svg>";
};
