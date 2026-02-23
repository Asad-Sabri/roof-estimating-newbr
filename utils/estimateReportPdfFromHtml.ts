/**
 * Generate estimate report PDF from the same HTML design as the report page.
 * Design HTML me rehta hai, isse perfectly same PDF milti hai.
 */

import React from "react";
import { createRoot } from "react-dom/client";
import { EstimateReportContent } from "@/components/estimating/EstimateReportContent";
import type { EstimateRecord, CompanyProfile } from "@/components/estimating/EstimateReportContent";

export type { EstimateRecord, CompanyProfile };

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
};

export interface GenerateReportPdfInput {
  estimate: EstimateRecord;
  company?: CompanyProfile | null;
  mapUrl?: string;
}

/**
 * Renders the report HTML and returns PDF as Blob (same design as report page).
 */
export async function generateEstimateReportPdfFromHtml(
  input: GenerateReportPdfInput
): Promise<Blob> {
  const { estimate, company, mapUrl } = input;
  const companyResolved: CompanyProfile = company || DEFAULT_COMPANY;

  const [html2pdf] = await Promise.all([import("html2pdf.js")]);
  const html2pdfDefault = (html2pdf as any).default || html2pdf;

  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;left:0;top:0;width:816px;min-height:1100px;background:#fff;color:#111827;z-index:-9999;pointer-events:none;opacity:0.01;overflow:visible;";
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(
    React.createElement(EstimateReportContent, {
      estimate,
      company: companyResolved,
      mapUrl: mapUrl || "",
      forPdf: true,
    })
  );

  await new Promise((r) => setTimeout(r, 100));
  await new Promise((r) => requestAnimationFrame(r));
  await new Promise((r) => requestAnimationFrame(r));
  await new Promise((r) => setTimeout(r, 400));

  const imgs = container.querySelectorAll("img");
  await Promise.all(
    Array.from(imgs).map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) resolve();
          else {
            img.onload = () => resolve();
            img.onerror = () => resolve();
            setTimeout(resolve, 3000);
          }
        })
    )
  );
  await new Promise((r) => setTimeout(r, 200));

  const targetEl = container.firstElementChild as HTMLElement;
  if (targetEl) {
    targetEl.style.width = "816px";
    targetEl.style.minHeight = "1050px";
  }

  const blob = await html2pdfDefault()
    .set({
      margin: [10, 10, 10, 10],
      filename: "Roof-Estimate.pdf",
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { orientation: "portrait", unit: "pt", format: "a4" },
      pagebreak: { mode: "css", before: ".page-break-before" },
    })
    .from(targetEl || container)
    .output("blob");

  root.unmount();
  document.body.removeChild(container);

  return blob;
}
