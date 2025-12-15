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
  return new Promise((resolve, reject) => {
    const img = new Image(width, height);
    const svgB64 =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgString)));
    img.src = svgB64;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Canvas context not found");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = (error) => {
      console.error("Error loading SVG for conversion:", error);
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
    const latestProject = projectsRaw
      ? JSON.parse(projectsRaw).slice(-1)[0]
      : { polygons: [], lines: [], totalArea: "0", totalLength: "0", mapboxBearing: "0" };

    const polygons = latestProject.polygons || [];
    const totalAreaSqFt = parseFloat(latestProject.totalArea || "0");
    const lines = latestProject.lines || [];
    
    // Retrieve the Mapbox rotation angle from the saved project data
    const mapboxRotationAngle = parseFloat(latestProject.mapboxBearing || "0");

    const center = getMapCenter(polygons, lines);
    const mapOptions = { zoom: 20, width: 800, height: 600 };

// --- NEW LOGIC: Capture all 4 angled images concurrently ---
    console.log("Capturing 4 angled map images...");
    const [
      northViewImage,
      eastViewImage,
      southViewImage,
      westViewImage,
    ] = await Promise.all([
      getMapImageBase64(center, { ...mapOptions, bearing: 0 }),
      getMapImageBase64(center, { ...mapOptions, bearing: 90 }),
      getMapImageBase64(center, { ...mapOptions, bearing: 180 }),
      getMapImageBase64(center, { ...mapOptions, bearing: 270 }),
    ]);

    const angledImages: AngledImages = {
      north: northViewImage,
      east: eastViewImage,
      south: southViewImage,
      west: westViewImage,
    };
    
    // Top View (used for Page 2, typically North view is used)
    const topViewImage = northViewImage; 

    // Passing the rotation angle to correct the SVG drawing
    const roofDiagramSVG = createRoofSVG(polygons, lines, 800, 600, mapboxRotationAngle);

    const roofDiagramImage = await convertSVGToDataURL(
      roofDiagramSVG,
      800,
      600
    );

    const PARAPET_AREA_PLACEHOLDER = "98.77";
    const gafSummary = calculateGAFSummary(
      lines,
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
        mapImage={topViewImage}
        polygonDiagramImage={roofDiagramImage}
        reportType={reportType} 
        data={{
          ...latestProject,
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