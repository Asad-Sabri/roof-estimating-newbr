// components/layout/pdf/PDFTemplateStyles.tsx (UPDATED)

import React from "react";

// --- CONSTANTS ---
export const BASE_RATE_PER_SQ_FT = 4.5;
export const RATE_PER_LINEAR_FOOT_TRIM = 1.5;
export const MINIMUM_JOB_FEE = 1500;

// NEW DESIGN CONSTANTS
export const PAGE_BG_COLOR = "#F7F7F7"; // Thora dark white background
export const CARD_BG_COLOR = "#FFFFFF"; // Har page content white card mein
export const CARD_HEADER_BG_COLOR = "#0f2346"; // Dark Blue (for Headers)
export const ACCENT_COLOR = "#1f497d"; // Secondary Accent Blue/Color for borders
export const RED_DISCLAIMER_COLOR = "#a30000"; // Dark Red

// --- STYLE OBJECTS ---

// Base style for card content padding and font
export const cardContentStyle: React.CSSProperties = {
  padding: "15px 25px", // Increased padding for better whitespace
  fontFamily: "Arial, sans-serif",
  fontSize: "12px", // Default font size
  lineHeight: "1.5",
};

// Main container for the white card
export const cardContainerStyle: React.CSSProperties = {
  borderRadius: "8px", // Slightly rounded corners
  marginBottom: "20px",
  backgroundColor: CARD_BG_COLOR, // White background for the card
  border: `1px solid ${ACCENT_COLOR}30`, // Light accent border
  boxShadow: "0 4px 6px rgba(0,0,0,0.05)", // Subtle shadow for lift
};

// Style for the top header of the card
export const cardHeaderStyle: React.CSSProperties = {
  backgroundColor: CARD_HEADER_BG_COLOR,
  padding: "15px 25px", // Padding adjusted
  borderTopLeftRadius: "8px",
  borderTopRightRadius: "8px",
  color: "#fff",
};

export const headingStyle: React.CSSProperties = {
  color: "#fff",
  fontWeight: 700,
  fontSize: "18px",
  margin: "0",
  fontFamily: "Arial, sans-serif",
};

export const footerCardStyle: React.CSSProperties = {
  position: "absolute",
  bottom: "0px",
  right: "30px",
  backgroundColor: CARD_HEADER_BG_COLOR,
  padding: "0px 12px 15px 12px",
  marginTop: "120px",
  marginBottom: "5px",
  borderRadius: "4px",
  fontSize: "12px",
  color: "#fff",
};

// Page style with dark white background
export const pageStyle = (pageNumber: number): React.CSSProperties => ({
  pageBreakAfter: "always",
  padding: "5px 15px 5px 15px", // Page padding increase
  backgroundColor: PAGE_BG_COLOR, // Dark white page background
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
    {/* Page Number in Footer */}
    <div style={footerCardStyle}> {page}</div>
  </div>
);

interface CardTitleHeaderProps {
  title: string;
}

// Reusable card header component (without CardHeaderStyle which is for main page header)
export const CardTitleHeader: React.FC<CardTitleHeaderProps> = ({ title }) => (
  <div
    style={{
      padding: "5px 25px 20px 25px",
      // margin: "25px 0",
      backgroundColor: CARD_HEADER_BG_COLOR,
      color: "#fff",
      fontWeight: "bold",
      fontSize: "14px",
      borderTopLeftRadius: "8px",
      borderTopRightRadius: "8px",
      fontFamily: "Arial, sans-serif",
    }}
  >
    {title}
  </div>
);