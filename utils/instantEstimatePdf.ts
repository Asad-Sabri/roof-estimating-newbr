import { jsPDF } from "jspdf";

type EstimateItem = {
  type: string;
  minPrice: number;
  maxPrice: number;
  enabled?: boolean;
};

type EstimateFormData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  roofSteepness?: string;
  buildingType?: string;
  currentRoofType?: string;
  desiredRoofType?: string;
  projectTimeline?: string;
  estimates?: EstimateItem[];
};

/**
 * Generate instant estimate report as PDF and return as Blob.
 */
export async function generateInstantEstimatePdf(data: EstimateFormData): Promise<Blob> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 30;

  const title = "Instant Estimate Report";
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(title, pageWidth / 2, y, { align: "center" });
  y += 24;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const name = [data.firstName, data.lastName].filter(Boolean).join(" ") || "—";
  doc.text(`Name: ${name}`, 40, y);
  y += 16;
  doc.text(`Email: ${data.email || "—"}`, 40, y);
  y += 16;
  doc.text(`Phone: ${data.phone || "—"}`, 40, y);
  y += 16;
  doc.text(`Address: ${data.address || "—"}`, 40, y);
  y += 20;

  doc.setFont("helvetica", "bold");
  doc.text("Project details", 40, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.text(`Roof steepness: ${data.roofSteepness || "—"}`, 40, y);
  y += 12;
  doc.text(`Building type: ${data.buildingType || "—"}`, 40, y);
  y += 12;
  doc.text(`Current roof: ${data.currentRoofType || "—"}`, 40, y);
  y += 12;
  doc.text(`Desired roof: ${data.desiredRoofType || "—"}`, 40, y);
  y += 12;
  doc.text(`Timeline: ${data.projectTimeline || "—"}`, 40, y);
  y += 24;

  doc.setFont("helvetica", "bold");
  doc.text("Preliminary estimates", 40, y);
  y += 18;

  const estimates = (data.estimates || []).filter((e) => e.enabled !== false);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  estimates.forEach((est) => {
    if (y > 260) {
      doc.addPage();
      y = 30;
    }
    const line = `${est.type}: $${est.minPrice?.toLocaleString() || 0} - $${est.maxPrice?.toLocaleString() || 0}`;
    doc.text(line, 40, y);
    y += 14;
  });

  y += 16;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("* Preliminary estimate. Final pricing subject to inspection.", 40, y);

  const blob = doc.output("blob");
  return blob;
}
