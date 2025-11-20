"use client";

import React from "react";
import PDFTemplate from "./PDFTemplate";
import { createRoot } from "react-dom/client";
import html2pdf from "html2pdf.js";

interface GeneratePDFOptions {
  mapImage?: string;
  topViewImage?: string;
}

export const generatePDF = ({ mapImage, topViewImage }: GeneratePDFOptions) => {
  // Latest project from localStorage
  let latestProject: any = { polygons: [], lines: [] };
  if (typeof window !== "undefined") {
    const projectsRaw = localStorage.getItem("projects");
    if (projectsRaw) {
      const projects = JSON.parse(projectsRaw);
      if (Array.isArray(projects) && projects.length > 0) {
        latestProject = projects[projects.length - 1];
      }
    }
  }

  const polygons = latestProject.polygons || [];
  const lines = latestProject.lines || [];

  // Temporary div create
  const tempDiv = document.createElement("div");
  document.body.appendChild(tempDiv);

  const root = createRoot(tempDiv);
  root.render(
    <PDFTemplate
      mapImage={mapImage}
      topViewImage={topViewImage}
      data={{
        polygons,
        lines,
        projectName: latestProject.projectName,
        userName: latestProject.userName,
        summary: latestProject.summary,
        createdAt: latestProject.createdAt,
        firstName: latestProject.firstName,
        lastName: latestProject.lastName,
        email: latestProject.email,
        mobile: latestProject.mobile,
        propertyType: latestProject.propertyType,
        roofType: latestProject.roofType,
        address: latestProject.address,
        totalArea: latestProject.totalArea,
        totalLength: latestProject.totalLength,
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
};
