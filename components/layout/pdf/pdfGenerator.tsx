import PDFTemplate from "./PDFTemplate";
import { getMapCenter, getMapImageBase64 } from "./getMapImage";

import { calculateGAFSummary } from "./processRoofData";
import { createRoofSVG } from "./createRoofSVG";
import {
  calculateMaterialQuantities,
  MaterialQuantities,
} from "./calculateMaterials";

type ReportType = "full" | "owner";

interface AngledImages {
  north: string;
  east: string;
  south: string;
  west: string; 
}

const convertSVGToDataURL = (
  svgString: string,
  width: number,
  height: number
): Promise<string> => {
  const fallbackSvg =
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f5f5f5"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="16" fill="#666">No diagram data</text></svg>`;
  const safeSvg =
    typeof svgString === "string" && svgString.trim().length > 0 ? svgString : fallbackSvg;

  return new Promise((resolve, reject) => {
    const img = new Image(width, height);
    let svgB64: string;
    try {
      svgB64 =
        "data:image/svg+xml;base64," +
        btoa(unescape(encodeURIComponent(safeSvg)));
    } catch (e) {
      console.error("SVG to base64 failed:", e);
      img.onerror = () => resolve("");
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(fallbackSvg)));
      return;
    }
    img.src = svgB64;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(svgB64);
        return;
      }
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = () => {
      console.error("Error loading SVG for PDF diagram");
      resolve(svgB64);
    };
  });
};

const generateSinglePDF = async (
  p0: { mapImage: string },
  reportType: ReportType
) => {
  if (typeof window === "undefined") {
    console.warn(
      `PDF generation for ${reportType} skipped: Attempted to run on the server.`
    );
    return;
  }

  const [{ createRoot }, { default: html2pdf }] = await Promise.all([
    import("react-dom/client"),
    import("html2pdf.js"),
  ]);

  try {
    const projectsRaw = localStorage.getItem("projects");
    const parsed = projectsRaw ? JSON.parse(projectsRaw) : [];
    const latestProject = Array.isArray(parsed) && parsed.length > 0
      ? parsed[parsed.length - 1]
      : { polygons: [], lines: [], totalArea: "0", totalLength: "0", mapboxBearing: "0" };

    const rawPolygons = latestProject.polygons || [];
    const rawLines = latestProject.lines || [];
    const totalAreaSqFt = parseFloat(latestProject.totalArea || "0");
    const mapboxRotationAngle = parseFloat(latestProject.mapboxBearing || "0");

    // Normalize for createRoofSVG: it expects properties.label, properties.color, properties.lengthFeet
    const polygons = rawPolygons.map((p: any) => ({
      id: p.id,
      type: p.type || "polygon",
      coordinates: p.coordinates,
      properties: { label: p.label, color: p.customColor },
    }));
    const lines = rawLines.map((l: any) => {
      const lengthFeet = Array.isArray(l.edges)
        ? l.edges.reduce((sum: number, e: any) => sum + (e.lengthFeet || 0), 0)
        : 0;
      return {
        id: l.id,
        type: l.type || "line",
        coordinates: l.coordinates,
        properties: { label: l.label, color: l.customColor, lengthFeet },
      };
    });

    let center = getMapCenter(polygons, lines);
    const hasCoords = (center.lat !== 0 || center.lng !== 0);
    if (!hasCoords && typeof window !== "undefined") {
      try {
        const loc = localStorage.getItem("projectLocation");
        if (loc) {
          const { lat, lng } = JSON.parse(loc);
          if (typeof lat === "number" && typeof lng === "number") center = { lat, lng };
        }
      } catch (_) {}
    }

    const mapOptions = { zoom: 20, width: 800, height: 600 };
    const canvasImage = p0?.mapImage || "";

    let northViewImage: string;
    let eastViewImage: string;
    let southViewImage: string;
    let westViewImage: string;

    if (hasCoords) {
      const [north, east, south, west] = await Promise.all([
        getMapImageBase64(center, { ...mapOptions, bearing: 0 }),
        getMapImageBase64(center, { ...mapOptions, bearing: 90 }),
        getMapImageBase64(center, { ...mapOptions, bearing: 180 }),
        getMapImageBase64(center, { ...mapOptions, bearing: 270 }),
      ]);
      northViewImage = north;
      eastViewImage = east;
      southViewImage = south;
      westViewImage = west;
    } else {
      const fallback = canvasImage || (await getMapImageBase64(center, mapOptions));
      northViewImage = eastViewImage = southViewImage = westViewImage = fallback;
    }

    const angledImages: AngledImages = {
      north: northViewImage,
      east: eastViewImage,
      south: southViewImage,
      west: westViewImage,
    };

    const topViewImage = northViewImage;

    const roofDiagramSVG = createRoofSVG(polygons, lines, 800, 600, mapboxRotationAngle);

    const roofDiagramImage = await convertSVGToDataURL(
      roofDiagramSVG,
      800,
      600
    );

    const PARAPET_AREA_PLACEHOLDER = "98.77";
    const gafSummary = calculateGAFSummary(
      rawLines,
      latestProject.totalArea || "0",
      PARAPET_AREA_PLACEHOLDER
    );
    const materialQuantities: MaterialQuantities = calculateMaterialQuantities(
      gafSummary,
      totalAreaSqFt
    );
 
    const tempDiv = document.createElement("div");
    document.body.appendChild(tempDiv);
    const root = createRoot(tempDiv);
   root.render(
      <PDFTemplate
        mapImage={hasCoords ? topViewImage : (canvasImage || topViewImage)}
        polygonDiagramImage={roofDiagramImage}
        reportType={reportType}
        data={{
          ...latestProject,
          polygons: rawPolygons,
          lines: rawLines,
          gafSummary: gafSummary,
          materialQuantities: materialQuantities,
        }}
        topViewImage={topViewImage}
        angledImages={angledImages}
      />
    );

    await new Promise((resolve) => setTimeout(resolve, 500));

    const filename =
      reportType === "full"
        ? `Full_Report_${Date.now()}.pdf`
        : `Owner_Report_${Date.now()}.pdf`;

    await html2pdf()
      .from(tempDiv)
      .set({
        margin: [10, 10, 10, 10],
        filename: filename, 
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { orientation: "portrait", unit: "pt", format: "a4" },
      })
      .save()
      .finally(() => {
        root.unmount();
        document.body.removeChild(tempDiv);
      });
  } catch (err) {
    console.error(`PDF generation for ${reportType} failed:`, err);
    throw err;
  }
};

export const generateReportsAndDownload = async (p0: { mapImage: string }) => {
  console.log("Starting Full Report Generation...");
  await generateSinglePDF(p0, "full");
  await new Promise((resolve) => setTimeout(resolve, 100));

  console.log("Starting Owner Report Generation...");
  await generateSinglePDF(p0, "owner");

  console.log("Both Reports Downloaded Successfully.");
};

export const generatePDF = generateReportsAndDownload;