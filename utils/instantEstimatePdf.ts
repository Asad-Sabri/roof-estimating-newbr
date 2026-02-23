import { jsPDF } from "jspdf";

const ACCENT_RED = "#8b0e0f";
const ACCENT_RGB = { r: 139, g: 14, b: 15 };
const COMPANY_GREEN = { r: 0, g: 100, b: 60 };

type EstimateItem = {
  type: string;
  minPrice: number;
  maxPrice: number;
  enabled?: boolean;
};

export type CompanyProfile = {
  companyName?: string;
  licenseNumber?: string;
  phone?: string;
  email?: string;
  website?: string;
  addressLine?: string;
  disclaimer?: string;
  contactPersonName?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  followUpText?: string;
  whatsIncluded?: string[];
};

const DEFAULT_COMPANY: CompanyProfile = {
  companyName: "Superior Pro Roofing Systems",
  licenseNumber: "LIC #123456",
  phone: "(555) 123-4567",
  email: "info@superiorproroofs.com",
  website: "www.superiorproroofs.com",
  addressLine: "123 Main St, Suite 100, Anytown, USA",
  disclaimer:
    "Preliminary estimate only. Formal estimate subject to inspection, scope confirmation, and material selection. Pricing is preliminary and non‑binding until verified by an authorized project specialist.",
  contactPersonName: "Person XXX",
  contactPersonPhone: "XXX-XXX-XXXX",
  contactPersonEmail: "GM@SuperiorRoofingCali.com",
  followUpText:
    "You can anticipate prompt follow-up from [Person XXX] at [Phone XXX-XXX-XXXX] and [Email GM@SuperiorRoofingCali.com] to schedule or confirm your inspection and discuss your estimate.\nVery truly yours,\nShafic XXXXX.",
  whatsIncluded: [
    "Tear-off and proper disposal of existing roofing materials.",
    "Install ice & water shield and synthetic underlayment.",
    "Flashings, pipe boots, vents, and necessary sealants.",
    "Starter, field, and ridge materials per selected system.",
    "Jobsite protection, magnet sweep, and daily cleanup.",
    "Manufacturer and workmanship warranty (per selection).",
    "Final walk-through with project specialist.",
    "Permit and inspection coordination where applicable.",
  ],
};

/** Pic ke mutabiq: Left column 4, Right column 4 */
const WHATS_INCLUDED_LEFT = [
  "Tear-off and proper disposal of existing roofing materials.",
  "Flashings, pipe boots, vents, and necessary sealants.",
  "Jobsite protection, magnet sweep, and daily cleanup.",
  "Final walk-through with project specialist.",
];
const WHATS_INCLUDED_RIGHT = [
  "Install ice & water shield and synthetic underlayment.",
  "Starter, field, and ridge materials per selected system.",
  "Manufacturer and workmanship warranty (per selection).",
  "Permit and inspection coordination where applicable.",
];

export type EstimateFormData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  roofSteepness?: string;
  buildingType?: string;
  currentRoofType?: string;
  desiredRoofType?: string;
  roofLayers?: string;
  totalArea?: number;
  projectTimeline?: string;
  estimates?: EstimateItem[];
  company?: CompanyProfile | null;
};

function currency(n: number | undefined): string {
  if (n === undefined || n === null) return "—";
  return `$${Math.round(n).toLocaleString()}`;
}

/**
 * Pick highlighted estimate (desired roof type match, or first enabled).
 * All options (including Tile Roof) are shown in "All Pricing Options" table.
 */
function getHighlightAndAllOptions(data: EstimateFormData) {
  const list = (data.estimates || []).filter((e) => e.enabled !== false);
  const desired = (data.desiredRoofType || "").toLowerCase();
  const match =
    list.find(
      (e) =>
        e.type.toLowerCase().includes(desired) ||
        desired.includes((e.type.toLowerCase().split(" ")[0] || "").trim())
    ) ||
    list.find((e) => e.type.toLowerCase().includes("tile")) ||
    list[0];
  return { highlight: match, allOptions: list };
}

/**
 * Generate Roof Estimate report PDF (same design as customer-panel estimate-report).
 * Colors and layout match the "Roof Estimate.pdf" design.
 */
export async function generateInstantEstimatePdf(
  data: EstimateFormData
): Promise<Blob> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = 28;

  const company = data.company || DEFAULT_COMPANY;
  const customerName =
    [data.firstName, data.lastName].filter(Boolean).join(" ") || "Customer";
  const { highlight, allOptions } = getHighlightAndAllOptions(data);

  // ---------- Company header (pic: company name green, contact right) ----------
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COMPANY_GREEN.r, COMPANY_GREEN.g, COMPANY_GREEN.b);
  doc.text(company.companyName || "Superior Pro Roofing Systems", margin, y);
  y += 14;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  if (company.addressLine) doc.text(company.addressLine, margin, y);
  y += 12;
  const contactParts = [company.licenseNumber, company.phone, company.email, company.website].filter(Boolean);
  if (contactParts.length) doc.text(contactParts.join("  "), margin, y);
  y += 24;

  // ---------- PRELIMINARY / Roofing Estimate For ----------
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("PRELIMINARY", margin, y);
  y += 14;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(ACCENT_RGB.r, ACCENT_RGB.g, ACCENT_RGB.b);
  doc.text("Roofing Estimate For: ", margin, y);
  const nameWidth = doc.getTextWidth("Roofing Estimate For: ");
  doc.setTextColor(0, 0, 0);
  doc.text(customerName, margin + nameWidth, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  if (data.address) {
    doc.text(data.address, margin, y);
    y += 16;
  }
  y += 8;

  // ---------- Roof Details box (red header) ----------
  const boxLeft = margin;
  const boxWidth = pageWidth - 2 * margin;
  doc.setFillColor(ACCENT_RGB.r, ACCENT_RGB.g, ACCENT_RGB.b);
  doc.rect(boxLeft, y, boxWidth, 22, "F");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Roof Details", boxLeft + 14, y + 15);
  y += 28;
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const roofRows: [string, string][] = [
    ["Building", data.buildingType || "—"],
    ["Steepness", data.roofSteepness || "—"],
    ["Current Roof", data.currentRoofType || "—"],
    ["Desired Roof", data.desiredRoofType || "—"],
    ["Layers", data.roofLayers || "—"],
    [
      "Total Area",
      data.totalArea != null
        ? `${Math.round(data.totalArea).toLocaleString()} sq ft`
        : "—",
    ],
  ];
  roofRows.forEach(([label, value]) => {
    doc.setTextColor(100, 100, 100);
    doc.text(label, boxLeft + 14, y + 4);
    doc.setTextColor(0, 0, 0);
    doc.text(value, boxLeft + 90, y + 4);
    y += 14;
  });
  y += 14;

  // ---------- Preliminary Roof Estimate (highlight price) + Other Pricing Options ----------
  const col1Width = 140;
  const col2Width = boxWidth - col1Width - 10;

  doc.setFillColor(ACCENT_RGB.r, ACCENT_RGB.g, ACCENT_RGB.b);
  doc.rect(boxLeft, y, col1Width, 20, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Preliminary Roof Estimate", boxLeft + 14, y + 14);
  y += 26;
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  if (highlight) {
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(ACCENT_RGB.r, ACCENT_RGB.g, ACCENT_RGB.b);
    doc.text(currency(highlight.minPrice), boxLeft + 14, y + 8);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("to", boxLeft + 14, y + 22);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(ACCENT_RGB.r, ACCENT_RGB.g, ACCENT_RGB.b);
    doc.text(currency(highlight.maxPrice), boxLeft + 14, y + 36);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(highlight.type, boxLeft + 14, y + 48);
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text("*Preliminary estimate. Subject to on-site inspection.", boxLeft + 14, y + 60);
  }
  const otherStartY = y - 26;
  doc.setFillColor(ACCENT_RGB.r, ACCENT_RGB.g, ACCENT_RGB.b);
  doc.rect(boxLeft + col1Width + 10, otherStartY, col2Width, 20, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("All Pricing Options", boxLeft + col1Width + 24, otherStartY + 14);
  let otherY = otherStartY + 26;
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  if (allOptions.length === 0) {
    doc.setTextColor(100, 100, 100);
    doc.text("No options available.", boxLeft + col1Width + 24, otherY + 10);
  } else {
    allOptions.forEach((o) => {
      doc.text(o.type, boxLeft + col1Width + 24, otherY + 6);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(ACCENT_RGB.r, ACCENT_RGB.g, ACCENT_RGB.b);
      doc.text(
        `${currency(o.minPrice)} - ${currency(o.maxPrice)}`,
        boxLeft + col1Width + col2Width - 20,
        otherY + 6,
        { align: "right" }
      );
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      otherY += 14;
    });
  }
  y = Math.max(y + 72, otherY + 14);
  y += 14;

  // ---------- What's Included (pic: exact two-column order) ----------
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(248, 248, 248);
  doc.rect(boxLeft, y, boxWidth, 22, "FD");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("What's Included", boxLeft + 14, y + 15);
  y += 28;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  const leftItems = WHATS_INCLUDED_LEFT;
  const rightItems = WHATS_INCLUDED_RIGHT;
  const bulletY = y;
  const maxBulletY = Math.max(
    bulletY + leftItems.length * 12,
    bulletY + rightItems.length * 12
  );
  leftItems.forEach((item, i) => {
    doc.text(`• ${item}`, boxLeft + 14, bulletY + 6 + i * 12);
  });
  rightItems.forEach((item, i) => {
    doc.text(`• ${item}`, boxLeft + boxWidth / 2 + 14, bulletY + 6 + i * 12);
  });
  y = maxBulletY + 16;

  // ---------- Next Steps / Follow-up / Disclaimer ----------
  if (company.followUpText) {
    const followUp = (company.followUpText || "")
      .replace(/\[Person XXX\]/g, company.contactPersonName || "[Person XXX]")
      .replace(/\[Phone XXX-XXX-XXXX\]/g, company.contactPersonPhone || "[Phone]")
      .replace(/\[Email GM@SuperiorRoofingCali\.com\]/g, company.contactPersonEmail || "[Email]");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Next Steps", boxLeft, y);
    y += 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    const lines = followUp.split("\n");
    lines.forEach((line) => {
      if (y > 800) {
        doc.addPage();
        y = 28;
      }
      doc.text(line, boxLeft, y);
      y += 11;
    });
    y += 8;
  }
  if (company.disclaimer) {
    if (y > 820) {
      doc.addPage();
      y = 28;
    }
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(company.disclaimer, boxLeft, y, { maxWidth: boxWidth });
  }

  const blob = doc.output("blob");
  return blob;
}
