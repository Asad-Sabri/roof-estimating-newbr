// pdfGenerator.tsx
import html2pdf from "html2pdf.js";
import PDFTemplate from "./PDFTemplate";
import ReactDOMServer from "react-dom/server";
import { captureMapImage } from "./MapCaptureUtil";
import { getPDFData } from "./PDFDataProvider";
import React from "react";

export const generatePDF = () => {
  const mapRef = (window as any).mapRef;
  const mapImage = captureMapImage(mapRef);
  const data = getPDFData();

  // ✅ JSX allowed only in .tsx
  const pdfHtml = ReactDOMServer.renderToStaticMarkup(
    <PDFTemplate mapImage={mapImage} data={data} />
  );

  html2pdf()
    .from(pdfHtml)
    .set({
      margin: [10, 10, 10, 10],
      filename: `Roof_Report_${Date.now()}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait", unit: "pt", format: "a4" },
    })
    .save();
};
