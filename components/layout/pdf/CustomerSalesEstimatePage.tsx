// components/layout/pdf/CustomerSalesEstimatePage.tsx

import React from "react";

// --- STYLE CONSTANTS (PDFTemplate se lenge) ---
const CARD_HEADER_BG_COLOR = "#0f2346";
const ACCENT_COLOR = "#f3f3f3";
const RED_DISCLAIMER_COLOR = "#a30000"; // Dark red for caution
const cardContentStyle: React.CSSProperties = {
  padding: "15px",
  fontFamily: "Arial",
};

// --- INTERFACES ---
interface CustomerData {
  address?: string;
  totalArea?: string;
  pitch?: string;
  complexity?: string;
  stories?: number | string;
  style?: string; // e.g., GAF Timberline HDZ
  color?: string; // e.g., Shakewood

  // Financial Data (Aapko yeh values calculate karke deni hongi)
  estimatePrice: number;
  taxRebatePercentage: number; // e.g., 0.20 for 20%

  // Contact Info
  salesPersonName: string;
  salesPersonMobile: string;
  salesPersonEmail: string;
}

interface CustomerSalesEstimatePageProps {
  data: CustomerData;
  PageWrapper: React.FC<{ page: number; children: React.ReactNode }>;
  CustomReportPageHeader: React.FC<any>; // Using 'any' for simplicity
  pageCounter: number;
}

// Fixed Scope of Work (As per your image reference)
const SCOPE_OF_WORK = [
  "Full Tear Off and Disposal of your old roof",
  "Install GAF Storm Guard Ice & Water Shield (where required)",
  "Install GAF Felt Buster synthetic underlayment",
  "Completely replace all metal flashing and drip edge",
  "Install GAF ProStart Starter shingle to all edges of your roof",
  "6 Nail Installation of GAF Timberline shingles",
  "Complete magnetic sweep and clean up during and after the job",
];

export const CustomerSalesEstimatePage: React.FC<
  CustomerSalesEstimatePageProps
> = ({ data, PageWrapper, CustomReportPageHeader, pageCounter }) => {
  const currentPage = ++pageCounter;

  const estimatePrice = data.estimatePrice;
  const taxRebate = estimatePrice * data.taxRebatePercentage;
  const netPrice = estimatePrice - taxRebate;

  // Formatting numbers to currency
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  return (
    <>
      <PageWrapper page={currentPage}>
        <CustomReportPageHeader
          title="Customer Estimate"
          isCoverPage={false}
          titleFontSize="20px"
          isFullReport={true}
        />

        {/* --- Preliminary Estimate & Disclaimer Section --- */}
        <div
          style={{
            border: `3px solid ${RED_DISCLAIMER_COLOR}`,
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "25px",
            backgroundColor: "#fff0f0",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              color: RED_DISCLAIMER_COLOR,
              margin: "0 0 10px 0",
              fontSize: "20px",
            }}
          >
            🛑 PRELIMINARY ESTIMATE ONLY
          </h2>
          <p
            style={{
              margin: 0,
              color: "#444",
              fontSize: "12px",
              fontStyle: "italic",
            }}
          >
            Formal estimate subject to inspection, scope confirmation, and
            material selection. **Pricing is preliminary and non-binding until
            verified by an authorized Project Specialist.**
          </p>
        </div>

        {/* --- Estimate Summary & Financials --- */}
        <div style={{ display: "flex", gap: "30px" }}>
          {/* 1. Roof Details Card */}
          <div style={{ flex: 1, border: "1px solid #ccc", borderRadius: 6 }}>
            <div
              style={{
                padding: "10px 15px",
                backgroundColor: CARD_HEADER_BG_COLOR,
                color: "#fff",
                borderTopLeftRadius: 6,
                borderTopRightRadius: 6,
              }}
            >
              <h3 style={{ margin: 0, fontSize: "16px" }}>Roof Details</h3>
            </div>
            <div style={cardContentStyle}>
              <p style={{ margin: "5px 0" }}>
                **Roofing Estimate For:** {data.address || "N/A"}
              </p>
              <hr style={{ border: "1px solid #eee", margin: "10px 0" }} />
              {/* Zaroori Details */}
              <p style={{ margin: "5px 0" }}>
                **Roof Area (Measured):** **{data.totalArea || 0} sq ft**
              </p>
              <p style={{ margin: "5px 0" }}>
                **Steepness (Pitch):** {data.pitch || "N/A"}
              </p>
              <p style={{ margin: "5px 0" }}>
                **Complexity:** {data.complexity || "N/A"}
              </p>
              {/* Material Details */}
              <p style={{ margin: "5px 0" }}>
                **Suggested Style:** **{data.style || "GAF Timberline HDZ"}**
              </p>
              <p style={{ margin: "5px 0" }}>
                **Color:** {data.color || "Shakewood"}
              </p>
              <p style={{ margin: "5px 0" }}>
                **Stories:** {data.stories || "N/A"}
              </p>
            </div>
          </div>

          {/* 2. Financial Summary Card */}
          <div
            style={{
              flex: 1,
              border: "1px solid #ccc",
              borderRadius: 6,
              backgroundColor: ACCENT_COLOR,
            }}
          >
            <div
              style={{
                padding: "10px 15px",
                backgroundColor: CARD_HEADER_BG_COLOR,
                color: "#fff",
                borderTopLeftRadius: 6,
                borderTopRightRadius: 6,
              }}
            >
              <h3 style={{ margin: 0, fontSize: "16px" }}>Your Estimate</h3>
            </div>
            <div style={{ padding: "20px 15px", textAlign: "center" }}>
              <h1
                style={{
                  color: CARD_HEADER_BG_COLOR,
                  fontSize: "36px",
                  margin: "0 0 10px 0",
                }}
              >
                {formatCurrency(estimatePrice)}
              </h1>
              <p
                style={{
                  margin: "5px 0",
                  fontSize: "14px",
                  color: "#006400",
                  fontWeight: "bold",
                }}
              >
                POTENTIAL TAX REBATES: {formatCurrency(taxRebate)}
              </p>
              <div
                style={{
                  borderTop: "2px solid #555",
                  margin: "15px auto",
                  width: "70%",
                }}
              ></div>
              <p
                style={{
                  margin: "5px 0",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                POTENTIAL NET PRICE
              </p>
              <p
                style={{
                  color: RED_DISCLAIMER_COLOR,
                  fontSize: "24px",
                  fontWeight: "bold",
                  margin: "5px 0",
                }}
              >
                {formatCurrency(netPrice)}
              </p>
            </div>
          </div>
        </div>
      </PageWrapper>
      <PageWrapper page={currentPage}>
        <CustomReportPageHeader
          title="Roof Disclaimer"
          isCoverPage={false}
          titleFontSize="20px"
          isFullReport={true}
        />

        {/* --- What's Included / Scope of Work --- */}
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: 6,
            marginTop: "25px",
          }}
        >
          <div
            style={{
              padding: "10px 15px",
              backgroundColor: CARD_HEADER_BG_COLOR,
              color: "#fff",
              borderTopLeftRadius: 6,
              borderTopRightRadius: 6,
            }}
          >
            <h3 style={{ margin: 0, fontSize: "16px" }}>
              Whats Included (Scope of Work)
            </h3>
          </div>
          <ul
            style={{
              ...cardContentStyle,
              listStyleType: "disc",
              paddingLeft: "40px",
            }}
          >
            {SCOPE_OF_WORK.map((item, index) => (
              <li key={index} style={{ marginBottom: "8px", fontSize: "14px" }}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* --- Next Steps --- */}
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: 6,
            marginTop: "25px",
          }}
        >
          <div
            style={{
              padding: "10px 15px",
              backgroundColor: ACCENT_COLOR,
              color: CARD_HEADER_BG_COLOR,
              borderTopLeftRadius: 6,
              borderTopRightRadius: 6,
            }}
          >
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>
              Next Steps
            </h3>
          </div>
          <div style={cardContentStyle}>
            <p style={{ fontSize: "14px", margin: "0 0 10px 0" }}>
              You can expect an immediate follow-up from **
              {data.salesPersonName}**. They will contact you to schedule your
              roof inspection and discuss the estimate. We will also assist you
              in reducing the price through tax rebates.
            </p>
            <p style={{ fontSize: "14px", margin: 0 }}>
              **Contact:** {data.salesPersonEmail} | {data.salesPersonMobile}
            </p>
          </div>
        </div>

        <p
          style={{
            fontSize: "10px",
            color: "#777",
            marginTop: "20px",
            textAlign: "center",
          }}
        >
          Tax rebates are available on installations that include
          energy-efficient products, such as solar attic ventilation. Price
          subject to change if material selections are updated.
        </p>
      </PageWrapper>
    </>
  );
};
