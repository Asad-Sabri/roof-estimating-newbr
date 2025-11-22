import { createRoot } from "react-dom/client";
import html2pdf from "html2pdf.js";
import PDFTemplate from "./PDFTemplate";
import { drawPolygonsOnCanvas } from "./drawPolygonDiagram";
import { getMapCenter, getMapboxMapURL } from "./getMapImage";

export const generatePDF = () => {
  try {
    const projectsRaw = localStorage.getItem("projects");
    const latestProject = projectsRaw
      ? JSON.parse(projectsRaw).slice(-1)[0]
      : { polygons: [], lines: [] };

    const polygons = latestProject.polygons || [];
    const lines = latestProject.lines || [];

    const center = getMapCenter(polygons, lines);

    // ✅ Mapbox static image URL
    const topViewImage = getMapboxMapURL(center, { zoom: 20, width: 800, height: 600 });

    const polygonDiagramImage = drawPolygonsOnCanvas(polygons);

    const tempDiv = document.createElement("div");
    document.body.appendChild(tempDiv);
    const root = createRoot(tempDiv);

    root.render(
      <PDFTemplate
        mapImage={topViewImage}           
        polygonDiagramImage={polygonDiagramImage} 
        data={latestProject}
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
