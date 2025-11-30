import PDFTemplate from "./PDFTemplate";
import { getMapCenter, getGoogleMapURL, getMapImageBase64 } from "./getMapImage";

import { calculateGAFSummary } from "./processRoofData";
import { createRoofSVG } from "./createRoofSVG";
import {
  calculateMaterialQuantities,
  MaterialQuantities,
} from "./calculateMaterials";

// Define the type for the report being generated
type ReportType = "full" | "owner";

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
      // Fallback: If conversion fails, return the SVG Data URL directly
      resolve(svgB64);
    };
  });
};

/**
 * Helper function to generate and download a single PDF based on reportType.
 * We've renamed the original export to a private helper function.
 */
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
      : { polygons: [], lines: [], totalArea: "0", totalLength: "0" };

    const polygons = latestProject.polygons || [];
    const totalAreaSqFt = parseFloat(latestProject.totalArea || "0");
    const lines = latestProject.lines || [];

    const center = getMapCenter(polygons, lines);

    // --- Data Preparation ---
const topViewImage = await getMapImageBase64(center, {
      zoom: 20,
      width: 800,
      height: 600,
    });
    const roofDiagramSVG = createRoofSVG(polygons, lines, 800, 600);

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
    // --- End Data Preparation ---

    const tempDiv = document.createElement("div");
    // NOTE: Append to body is required for html2pdf to correctly calculate dimensions
    document.body.appendChild(tempDiv);
    const root = createRoot(tempDiv);

    // Pass the new reportType prop to the template
    root.render(
      <PDFTemplate
        mapImage={topViewImage}
        polygonDiagramImage={roofDiagramImage}
        reportType={reportType} // <-- New Prop is passed here
        data={{
          ...latestProject,
          gafSummary: gafSummary,
          materialQuantities: materialQuantities,
        }}
        topViewImage={""}
      />
    );

    // Give React a short time to render the template in the tempDiv
    await new Promise((resolve) => setTimeout(resolve, 500));

    const filename =
      reportType === "full"
        ? `Full_Report_${Date.now()}.pdf`
        : `Owner_Report_${Date.now()}.pdf`;

    await html2pdf()
      .from(tempDiv)
      .set({
        margin: [10, 10, 10, 10],
        filename: filename, // Set dynamic filename
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { orientation: "portrait", unit: "pt", format: "a4" },
      })
      .save()
      .finally(() => {
        // Cleanup the temporary React root and DOM element
        root.unmount();
        document.body.removeChild(tempDiv);
      });
  } catch (err) {
    console.error(`PDF generation for ${reportType} failed:`, err);
    throw err; // Re-throw the error so the main function knows it failed
  }
};

/**
 * The new exported function that handles the double download logic.
 * This is the function that the Download button will call.
 */
export const generateReportsAndDownload = async (p0: { mapImage: string }) => {
  // 1. Generate the Full (Admin) Report
  console.log("Starting Full Report Generation...");
  await generateSinglePDF(p0, "full");

  // 2. Generate the Owner (User) Report
  // We add a small delay here. This small delay (100ms) can sometimes
  // help the browser distinguish between the two download requests, reducing
  // the chance of the second one being blocked as a pop-up.
  await new Promise((resolve) => setTimeout(resolve, 100));

  console.log("Starting Owner Report Generation...");
  await generateSinglePDF(p0, "owner");

  console.log("Both Reports Downloaded Successfully.");
};

// Original export name (generatePDF) is now the entry point for double download
// The old implementation of generatePDF is now generateSinglePDF
export const generatePDF = generateReportsAndDownload;
