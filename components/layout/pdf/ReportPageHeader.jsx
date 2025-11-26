// ReportPageHeader.jsx
import React from "react";
import logoSrc from "../../../public/logo-latest.png";
import Image from "next/image";

const ReportPageHeader = ({ latestProject }) => {
  const finalHeaderStyle = {
    backgroundColor: "#0f2346",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
  };

  return (
    <div style={finalHeaderStyle}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Image src={logoSrc} alt="Logo" height={150} width={150} />
      </div>

      <div style={{ textAlign: "right", color: "#fff" }}>
        <p style={{ margin: 0, fontSize: "14px" }}>
          Prepared For: <strong>Superior Pro Roofs</strong>
        </p>
        <p style={{ margin: 0, fontSize: "14px" }}>
          Date:{" "}
          <strong>
            {latestProject?.createdAt
              ? new Date(latestProject.createdAt).toLocaleDateString()
              : "N/A"}
          </strong>
        </p>
      </div>
    </div>
  );
};

export default ReportPageHeader;
