/**
 * Generate estimate report PDF from the same HTML design as the report page.
 * Design HTML me rehta hai, isse perfectly same PDF milti hai.
 * PDF me real-time company details ke liye GET /api/company/user ya GET /api/company use hota hai.
 */

import React from "react";
import { createRoot } from "react-dom/client";
import { EstimateReportContent } from "@/components/estimating/EstimateReportContent";
import type { EstimateRecord, CompanyProfile } from "@/components/estimating/EstimateReportContent";
import { getCompanyUserAPI, getCompanyAPI } from "@/services/companyAPI";

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

function formatAddress(addr: any): string {
  if (!addr || typeof addr !== "object") return "";
  return [addr.street, addr.city, addr.state, addr.country, addr.zip_code].filter(Boolean).join(", ");
}

/** GET API se company fetch karke CompanyProfile return – PDF / email report ke liye real-time details */
export async function fetchCompanyForReportPdf(): Promise<CompanyProfile> {
  try {
    const res = await getCompanyUserAPI();
    const r = res?.data ?? res?.settings ?? res;
    if (r && typeof r === "object") return mapApiToCompanyProfile(r);
  } catch {
    // fallback
  }
  try {
    const res = await getCompanyAPI();
    const data = res?.data ?? res;
    const r = data?.company && typeof data.company === "object" ? data.company : data;
    if (r && typeof r === "object") return mapApiToCompanyProfile(r);
  } catch {
    // use default
  }
  return DEFAULT_COMPANY;
}

function mapApiToCompanyProfile(r: any): CompanyProfile {
  const address = r.address && typeof r.address === "object" ? r.address : undefined;
  const addressLine = formatAddress(address) || (r.addressLine ?? r.address_line ?? DEFAULT_COMPANY.addressLine);
  const whatsIncludedRaw = r.whatsIncluded ?? r.whats_included;
  const whatsIncluded = Array.isArray(whatsIncludedRaw)
    ? whatsIncludedRaw
    : typeof whatsIncludedRaw === "string"
      ? whatsIncludedRaw.split("\n").map((s: string) => s.trim()).filter(Boolean)
      : undefined;
  return {
    ...DEFAULT_COMPANY,
    companyName: r.companyName ?? r.company_name ?? DEFAULT_COMPANY.companyName,
    licenseNumber: r.licenseNumber ?? r.license_number ?? DEFAULT_COMPANY.licenseNumber,
    phone: r.mobile_number ?? r.phone ?? DEFAULT_COMPANY.phone,
    email: r.email ?? DEFAULT_COMPANY.email,
    website: r.website ?? DEFAULT_COMPANY.website,
    addressLine,
    disclaimer: r.disclaimer ?? DEFAULT_COMPANY.disclaimer,
    contactPersonName: r.contactPersonName ?? r.contact_person_name ?? DEFAULT_COMPANY.contactPersonName,
    contactPersonPhone: r.contactPersonPhone ?? r.contact_person_phone ?? DEFAULT_COMPANY.contactPersonPhone,
    contactPersonEmail: r.contactPersonEmail ?? r.contact_person_email ?? DEFAULT_COMPANY.contactPersonEmail,
    followUpText: r.followUpText ?? r.follow_up_text ?? DEFAULT_COMPANY.followUpText,
    whatsIncluded: whatsIncluded && whatsIncluded.length > 0 ? whatsIncluded : undefined,
  };
}

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
  const { estimate, company: companyInput, mapUrl } = input;
  const companyResolved: CompanyProfile = companyInput ?? await fetchCompanyForReportPdf();

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
