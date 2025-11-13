import jsPDF from "jspdf";
import { EDGE_TYPE_COLORS, toFeetInchesFormat } from "./mapContext";

export const generatePDF = async (
  mapContainerRef: React.RefObject<HTMLDivElement>,
  mapRef: React.RefObject<any>,
  projectData: any,
  polygons: any[] = [],
  lines: any[] = []
) => {
  try {
    const doc = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const MARGIN_X = 40;
    let currentY = 10;

    // -------------------------------
    // HEADER
    // -------------------------------
    const logoUrl = "/logo-latest.png";
    const loadImage = (url: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = url;
      });

    try {
      const logoImg = await loadImage(logoUrl);
      const canvas = document.createElement("canvas");
      canvas.width = logoImg.width;
      canvas.height = logoImg.height;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.drawImage(logoImg, 0, 0);
      const imgData = canvas.toDataURL("image/png");
      doc.addImage(imgData, "PNG", MARGIN_X, currentY, 80, 40);
    } catch {
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("ROOFPRO", MARGIN_X, currentY + 15);
    }

    // Project info
    const reportDate = new Date().toLocaleDateString();
    const infoX = pageWidth - MARGIN_X;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Client: ${projectData.name || "Client"}`, infoX, currentY + 5, { align: "right" });
    doc.text(`Address: ${projectData.address || "Address"}`, infoX, currentY + 18, { align: "right" });
    doc.text(`Date: ${reportDate}`, infoX, currentY + 31, { align: "right" });

    currentY = 60;
    doc.setDrawColor(200, 200, 200);
    doc.line(MARGIN_X, currentY, pageWidth - MARGIN_X, currentY);
    currentY += 20;

    // TITLE
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 80, 140);
    doc.text("ROOF MEASUREMENT REPORT", pageWidth / 2, currentY, { align: "center" });
    currentY += 30;

    // SUMMARY BOX
    const summaryBoxWidth = 180;
    const summaryBoxHeight = 55;
    doc.setDrawColor(30, 80, 140);
    doc.setFillColor(235, 245, 255);
    doc.rect(MARGIN_X, currentY, summaryBoxWidth, summaryBoxHeight, "FD");

    doc.setFontSize(14);
    doc.text("MEASUREMENT SUMMARY", MARGIN_X + 10, currentY + 15);
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text(`Total Roof Area:`, MARGIN_X + 10, currentY + 35);
    doc.text(
      `${Number(projectData.totalAreaSqFt || 0).toFixed(2)} sqft`,
      MARGIN_X + summaryBoxWidth - 10,
      currentY + 35,
      { align: "right" }
    );
    doc.text(`Polygons:`, MARGIN_X + 10, currentY + 50);
    doc.text(`${projectData.totalPolygons || polygons.length}`, MARGIN_X + summaryBoxWidth - 10, currentY + 50, {
      align: "right",
    });

    currentY += summaryBoxHeight + 20;

    // -------------------------------
    // ROOF SKETCH & SNAPSHOT
    // -------------------------------
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    doc.text("1. Roof Sketch & Lengths", MARGIN_X, currentY);
    currentY += 15;

    const diagramBoxWidth = pageWidth - 2 * MARGIN_X;
    const diagramBoxHeight = 250;
    doc.setDrawColor(200, 200, 200);
    doc.rect(MARGIN_X, currentY, diagramBoxWidth, diagramBoxHeight, "S");

    // MAP SNAPSHOT - UPDATED
    if (mapRef?.current) {
      const mapCanvas = mapRef.current.getCanvas();
      if (mapCanvas) {
        // Fit bounds if polygons exist
        if (polygons.length > 0) {
          const bounds = new mapRef.current.LngLatBounds();
          polygons.forEach((poly) => {
            poly.coordinates[0].forEach(([lng, lat]: [number, number]) => bounds.extend([lng, lat]));
          });
          mapRef.current.fitBounds(bounds, { padding: 20, duration: 0 });
          await new Promise((resolve) => setTimeout(resolve, 500)); // wait map render
        }

        const imgData = mapCanvas.toDataURL("image/png");
        const imgWidth = diagramBoxWidth - 10;
        const imgHeight = (mapCanvas.height * imgWidth) / mapCanvas.width;
        doc.addImage(imgData, "PNG", MARGIN_X + 5, currentY + 5, imgWidth, imgHeight);
      } else {
        doc.setFontSize(10);
        doc.text("Map snapshot unavailable", pageWidth / 2, currentY + 40, { align: "center" });
      }
    }

    currentY += diagramBoxHeight + 25;

    // -------------------------------
    // LENGTH SUMMARY LEGEND
    // -------------------------------
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("2. Length Summary", MARGIN_X, currentY);
    currentY += 15;

    const legendXStart = MARGIN_X;
    const columnWidth = (pageWidth - 2 * MARGIN_X) / 2;
    const rowHeight = 20;
    let legendY = currentY;

    const dynamicLengths: Record<string, number> = lines?.reduce((acc: Record<string, number>, l: any) => {
      const type = l.type || "Unspecified";
      acc[type] = (acc[type] || 0) + (l.length || 0);
      return acc;
    }, {}) || {};

    Object.keys(dynamicLengths).forEach((type, index) => {
      const length = dynamicLengths[type] || 0;
      const formatted = toFeetInchesFormat(length).replace("'", "ft ").replace('"', "in");
      const xOffset = index % 2 === 0 ? 0 : columnWidth;
      if (index % 2 === 0 && index > 0) legendY += rowHeight;

      const colorHex = EDGE_TYPE_COLORS[type] || "#000000";
      const r = parseInt(colorHex.slice(1, 3), 16);
      const g = parseInt(colorHex.slice(3, 5), 16);
      const b = parseInt(colorHex.slice(5, 7), 16);

      doc.setLineWidth(1.5);
      doc.setDrawColor(r, g, b);
      doc.line(legendXStart + xOffset, legendY + 5, legendXStart + xOffset + 15, legendY + 5);

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(type, legendXStart + xOffset + 20, legendY + 10);
      doc.text(formatted, legendXStart + xOffset + columnWidth - 10, legendY + 10, { align: "right" });
    });

    currentY = legendY + rowHeight + 20;

    // -------------------------------
    // DETAILED EDGE LIST
    // -------------------------------
    if (currentY > pageHeight - 150) {
      doc.addPage();
      currentY = 40;
    }

    doc.setFontSize(16);
    doc.text("3. Detailed Edge List", MARGIN_X, currentY);
    currentY += 15;

    const tableWidth = pageWidth - 2 * MARGIN_X;
    const rowHeightTable = 18;

    doc.setFont("helvetica", "bold");
    doc.setFillColor(100, 149, 237);
    doc.setTextColor(255, 255, 255);
    doc.rect(MARGIN_X, currentY, tableWidth, rowHeightTable, "F");
    doc.text("Side #", MARGIN_X + 10, currentY + 12);
    doc.text("Type", MARGIN_X + 80, currentY + 12);
    doc.text("Length (ft)", MARGIN_X + 200, currentY + 12);
    doc.text("Formatted", MARGIN_X + 320, currentY + 12);

    currentY += rowHeightTable;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    lines?.forEach((e: any, i: number) => {
      const edgeType = e.type || "Unlabeled";
      const length = e.length || 0;
      const formatted = toFeetInchesFormat(length);
      const color = EDGE_TYPE_COLORS[edgeType] || "#000000";
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);

      if (currentY + rowHeightTable > pageHeight - 50) {
        doc.addPage();
        currentY = 40;
      }

      if (i % 2 !== 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(MARGIN_X, currentY, tableWidth, rowHeightTable, "F");
      }

      doc.setTextColor(0, 0, 0);
      doc.text(`${i + 1}`, MARGIN_X + 10, currentY + 12);
      doc.text(edgeType, MARGIN_X + 80, currentY + 12);
      doc.text(Number(length).toFixed(2), MARGIN_X + 200, currentY + 12);
      doc.text(formatted, MARGIN_X + 320, currentY + 12);

      doc.setFillColor(r, g, b);
      doc.rect(MARGIN_X + 420, currentY + 5, 15, 10, "F");

      currentY += rowHeightTable;
    });

    // FOOTER
    const footerY = pageHeight - 20;
    doc.setDrawColor(200, 200, 200);
    doc.line(MARGIN_X, footerY - 5, pageWidth - MARGIN_X, footerY - 5);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Report Generated by RoofPro Software | Page ${doc.internal.getNumberOfPages()}`, pageWidth / 2, footerY + 5, {
      align: "center",
    });

    doc.save("Roof_Measurement_Report.pdf");
  } catch (err) {
    console.error("PDF generation error:", err);
    alert("Error while generating PDF. Check console for details.");
  }
};
