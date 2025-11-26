// pdfGenerator.tsx (FINAL FIX - Correct Placement)

// Static Imports (jo server par safe hain)
import PDFTemplate from "./PDFTemplate";
import { getMapCenter, getMapboxMapURL } from "./getMapImage";
import { calculateGAFSummary } from "./processRoofData";
import { createRoofSVG } from "./createRoofSVG";
import { calculateMaterialQuantities, MaterialQuantities } from "./calculateMaterials";

// 🚀 FIX: Utility function ko generatePDF se pehle define karein
const convertSVGToDataURL = (
  svgString: string,
  width: number,
  height: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image(width, height);

    // 1. SVG string ko Base64 mein encode karein:
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

      // 2. White background set karein (taaki transparent area white ho)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // 3. SVG image ko Canvas par draw karein
      ctx.drawImage(img, 0, 0, width, height);

      // 4. Final PNG Data URL return karein
      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = (error) => {
      console.error("Error loading SVG for conversion:", error);
      resolve(svgB64);
    };
  });
};


// Note: react-dom/client aur html2pdf.js ke imports ko yahan se remove kar diya gaya hai.

export const generatePDF = async () => {
  // 🚀 Function ko ASYNC bana diya

  // 1. Client-side Check: Server-side execution ko rokein
  if (typeof window === "undefined") {
    console.warn("PDF generation skipped: Attempted to run on the server.");
    return;
  }

  // 2. Dynamic Imports: Client-only dependencies ko load karein
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

    const topViewImage = getMapboxMapURL(center, {
      zoom: 20,
      width: 800,
      height: 600,
    });
    
    // SVG String Generation
    const roofDiagramSVG = createRoofSVG(
      polygons,
      lines,
      800, // width
      600 // height
    );

    // 🚀 Call the function defined above
    const roofDiagramImage = await convertSVGToDataURL(
      roofDiagramSVG,
      800,
      600
    );

    // --- MILESTONE 1: Calculate Aggregated Summary ---
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
    // ----------------------------------------------------

    // ❌ REMOVE THE REDUNDANT FUNCTION DEFINITION FROM HERE
    // (Aapke original code mein convertSVGToDataURL ki definition yahan thi)
    
    const tempDiv = document.createElement("div");
    document.body.appendChild(tempDiv);
    const root = createRoot(tempDiv);

    root.render(
      <PDFTemplate
        mapImage={topViewImage}
        polygonDiagramImage={roofDiagramImage} // Data URL image
        data={{
          ...latestProject,
          gafSummary: gafSummary,
          materialQuantities: materialQuantities,
        }}
      />
    );

    setTimeout(() => {
      html2pdf()
        .from(tempDiv)
        .set({
          margin: [10, 10, 10, 10],
          filename: `Roof_Report_${Date.now()}.pdf`,
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { orientation: "portrait", unit: "pt", format: "a4" },
        })
        .save()
        .finally(() => {
          root.unmount();
          document.body.removeChild(tempDiv);
        });
    }, 500);
  } catch (err) {
    console.error("PDF generation failed:", err);
  }
};