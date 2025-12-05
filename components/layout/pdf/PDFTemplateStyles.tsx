// components/layout/pdf/PDFTemplateStyles.tsx

import React from "react";

// --- CONSTANTS ---
export const BASE_RATE_PER_SQ_FT = 4.5;
export const RATE_PER_LINEAR_FOOT_TRIM = 1.5;
export const MINIMUM_JOB_FEE = 1500;

export const PAGE_BG_COLOR = "#f3f3f3";
export const CARD_HEADER_BG_COLOR = "#0f2346"; // Dark Blue
export const HEADER_ACCENT_COLOR = "#f3f3f3";
export const ACCENT_COLOR = "white";
export const RED_DISCLAIMER_COLOR = "#a30000"; // Dark Red

// --- STYLE OBJECTS ---
export const cardContentStyle: React.CSSProperties = {
  padding: "5px",
  fontFamily: "Arial",
};

export const cardContainerStyle: React.CSSProperties = {
  borderRadius: "6px",
  marginBottom: "25px",
  border: "1px solid #ccc",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
};

export const cardHeaderStyle: React.CSSProperties = {
  backgroundColor: CARD_HEADER_BG_COLOR,
  padding: "10px 20px 30px 20px",
  borderBottom: "1px solid #ccc",
  borderTopLeftRadius: "6px",
  borderTopRightRadius: "6px",
  color: "#fff",
};

export const headingStyle: React.CSSProperties = {
  color: HEADER_ACCENT_COLOR,
  fontWeight: 700,
  fontSize: "18px",
  margin: "0",
};

export const footerCardStyle: React.CSSProperties = {
  position: "absolute",
  bottom: "0px",
  left: "50%",
  transform: "translateX(-50%)",
  backgroundColor: CARD_HEADER_BG_COLOR,
  padding: "5px 12px 20px",
//   borderRadius: "4px",
  fontSize: "12px",
  color: "#f3f3f3",
  border: "1px solid #ccc",
};

export const pageStyle = (pageNumber: number): React.CSSProperties => ({
  pageBreakAfter: "always",
  padding: "20px 0px",
  fontFamily: "Arial, sans-serif",
  position: "relative",
  minHeight: "1000px",
  color: "#111",
});

// --- HELPER COMPONENTS ---

interface PageWrapperProps {
    page: number;
    children: React.ReactNode;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ page, children }) => (
  <div style={pageStyle(page)}>
    {children}
    <div style={footerCardStyle}>{page}</div>
  </div>
);

interface CardTitleHeaderProps {
    title: string;
}

export const CardTitleHeader: React.FC<CardTitleHeaderProps> = ({ title }) => (
  <div
    style={{
      padding: "10px 20px",
      backgroundColor: CARD_HEADER_BG_COLOR,
      color: "#fff",
      fontWeight: "bold",
      borderTopLeftRadius: "6px",
      borderTopRightRadius: "6px",
    }}
  >
    {title}
  </div>
);