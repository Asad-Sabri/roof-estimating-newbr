// useMapboxFunctions.ts se yeh functions aur data import honge
import { useMapboxFunctions } from './useMapboxFunctions'; 
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
// Awaited functions/variables:
// const { safeRoofAreaState, safePlanAreaState, safeEdgesState, edgesState, getPolygonsDataForReport, toFeetInchesFormat, EDGE_TYPE_COLORS } = useMapboxFunctions(); // Assuming these are destructured from your hook
// const { getRoofSummaryData } = useMapboxFunctions();
// const { mapContainerRef } = useMapboxFunctions(); 
// --- DUMMY DATA (Aapke states se aayega) ---
const EDGE_TYPE_COLORS = { 
    "Unlabeled": "#FFD700", 
    "Valley": "#1e90ff", 
    "Hip": "#8A2BE2",
    "Wall Flashing": "#ff4500", // Example color
    "Step Flashing": "#32cd32"  // Example color
}; 

// Helper: Metre to Feet/Inches conversion. Assuming this is available.
const toFeetInchesFormat = (meters: any) => {
    const ft = meters * 3.28084;
    const feet = Math.floor(ft);
    const inches = Math.round((ft - feet) * 12);
    if (inches >= 12) return `${feet + 1}'0"`;
    return `${feet}'${inches}"`;
};

// Dummies (Replace with actual state/hook data in your component)
const dummyData = {
    roofAreaState: 2568.75,
    planAreaState: 2500.00,
    polygonsForReport: [ // New structured data
        { id: "poly-1", areaSqFt: 1200.5, edges: [{type: "Unlabeled", length: 30}, {type: "Valley", length: 15.2}]},
        { id: "poly-2", areaSqFt: 1368.25, edges: [{type: "Hip", length: 20}, {type: "Unlabeled", length: 40}]},
    ],
    edgesState: [ // Detailed edges list
        { type: "Unlabeled", length: 30, id: 'e1' }, 
        { type: "Valley", length: 15.2, id: 'e2' }, 
        { type: "Hip", length: 20, id: 'e3' },
        { type: "Unlabeled", length: 40, id: 'e4' },
    ]
};

const pdfGenrate = async () => {
    // --- Data Safety Check ---
    const { mapContainerRef, getRoofSummaryData, getPolygonsDataForReport } = useMapboxFunctions();
    const summaryData = getRoofSummaryData(); // Summary: totalAreaSqFt, totalLengths, etc.
    const polygonsData = getPolygonsDataForReport(); // New: Polygons ka detailed data

    if (!mapContainerRef.current) {
        alert("Map is not ready for screenshot.");
        return;
    }
    
    // Fallback data structure ko use karein, jaisa aapne code mein kiya hai
    const safeRoofAreaState = summaryData.totalAreaSqFt;
    const safePlanAreaState = 2500.00; // Assuming this comes from a state not shown
    const safeEdgesState = summaryData.detailedEdges.map(e => ({ type: e.type, length: e.length }));

    // Map screenshot logic (as before, using html2canvas)
    let mapImageBase64 = null;
    try {
        const canvas = await html2canvas(mapContainerRef.current, {
            useCORS: true,
            allowTaint: true,
            scale: 2, 
        });
        mapImageBase64 = canvas.toDataURL('image/jpeg', 0.8);
    } catch (error) {
        console.error("Map screenshot failed:", error);
    }
    // --- END Data & Screenshot Setup ---

    try {
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "px",
            format: "a4",
        });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const MARGIN_X = 40;
        let currentY = 10;
        
        // **********************************
        // 1-3. HEADER, TITLE, SUMMARY BOX (Jaisa aapka code tha, waisa hi rakha hai)
        // **********************************
        // ... (Your existing code for Header, Title, and Summary Box) ...
        
        // Load Public Logo
        const logoUrl = "/logo-latest.png";
        const loadImage = (url) =>
          new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = (err) => reject(err);
            img.src = url;
          });

        try {
          const logoImg = await loadImage(logoUrl);
          const canvas = document.createElement("canvas");
          canvas.width = logoImg.width;
          canvas.height = logoImg.height;
          const ctx = canvas.getContext("2d");
          if (ctx) ctx.drawImage(logoImg, 0, 0);
          const imgData = canvas.toDataURL("image/png");

          doc.addImage(imgData, "PNG", MARGIN_X, currentY, 80, 40);
        } catch (err) {
          console.warn("Logo loading failed:", err);
          doc.setFontSize(16);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(50, 50, 50);
          doc.text("ROOFPRO", MARGIN_X, currentY + 15);
        }

        const personName = localStorage.getItem("personName") || "John Doe";
        const projectAddress =
          localStorage.getItem("projectAddress") ||
          "123 Main St, City, State 12345";
        const reportDate = new Date().toLocaleDateString();

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        const infoX = pageWidth - MARGIN_X;
        doc.text(`Client: ${personName}`, infoX, currentY + 5, {
          align: "right",
        });
        doc.text(`Address: ${projectAddress}`, infoX, currentY + 18, {
          align: "right",
        });
        doc.text(`Date: ${reportDate}`, infoX, currentY + 31, {
          align: "right",
        });

        currentY = 60;
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(1);
        doc.line(MARGIN_X, currentY, pageWidth - MARGIN_X, currentY);

        currentY += 20;

        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 80, 140);
        doc.text("ROOF MEASUREMENT REPORT", pageWidth / 2, currentY, {
          align: "center",
        });

        currentY += 30;

        const summaryBoxWidth = 180;
        const summaryBoxHeight = 55;
        doc.setDrawColor(30, 80, 140);
        doc.setFillColor(235, 245, 255);
        doc.rect(MARGIN_X, currentY, summaryBoxWidth, summaryBoxHeight, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(30, 80, 140);
        doc.text("MEASUREMENT SUMMARY", MARGIN_X + 10, currentY + 15);

        doc.setFontSize(12);
        doc.setTextColor(50, 50, 50);
        doc.text(`Total Roof Area:`, MARGIN_X + 10, currentY + 35);
        doc.text(
            `${safeRoofAreaState.toFixed(2)} sqft`,
            MARGIN_X + summaryBoxWidth - 10,
            currentY + 35,
            { align: "right" }
        );
        doc.text(`Plan Area:`, MARGIN_X + 10, currentY + 50);
        doc.text(
            `${safePlanAreaState.toFixed(2)} sqft`,
            MARGIN_X + summaryBoxWidth - 10,
            currentY + 50,
            { align: "right" }
        );
        
        currentY += summaryBoxHeight + 20;

        // ------------------------------------
        // 4. ROOF DIAGRAM (Screenshot daalna)
        // ------------------------------------
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(50, 50, 50);
        doc.text("1. Roof Sketch & Lengths", MARGIN_X, currentY);
        currentY += 15;

        const diagramBoxWidth = pageWidth - 2 * MARGIN_X;
        const diagramBoxHeight = 250;
        
        // Map Image ko add karein
        if (mapImageBase64) {
             // Image ko box ke andar fit karein
            doc.addImage(mapImageBase64, 'JPEG', MARGIN_X, currentY, diagramBoxWidth, diagramBoxHeight, undefined, 'FAST');
        } else {
            doc.setDrawColor(200, 200, 200);
            doc.setFillColor(255, 255, 255);
            doc.rect(MARGIN_X, currentY, diagramBoxWidth, diagramBoxHeight, "FD");
            doc.setFontSize(10);
            doc.setFont("helvetica", "italic");
            doc.setTextColor(150, 150, 150);
            doc.text("Map Diagram/Vector Drawing (Screenshot failed or not available)", pageWidth / 2, currentY + 125, { align: "center" });
        }
        
        // Remaining elements (Length title, Compass)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(60, 118, 172);
        doc.text("Length", MARGIN_X + 20, currentY + 50);

        const compassX = pageWidth - MARGIN_X - 25;
        const compassY = currentY + 40;
        doc.setDrawColor(0, 0, 0);
        doc.line(compassX, compassY - 15, compassX, compassY + 15);
        doc.line(compassX - 15, compassY, compassX + 15, compassY);
        doc.setFont("helvetica", "bold");
        doc.text("N", compassX, compassY - 18, { align: "center" });
        doc.text("S", compassX, compassY + 25, { align: "center" });
        doc.text("E", compassX + 18, compassY + 3, { align: "left" });
        doc.text("W", compassX - 18, compassY + 3, { align: "right" });

        currentY += diagramBoxHeight + 20;
        
        // ------------------------------------
        // 4.5. NEW SECTION: POLYGON BREAKDOWN (Detailed Polygons Data)
        // ------------------------------------
        
        if (currentY > pageHeight - 150) {
            doc.addPage();
            currentY = 40;
        }

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 80, 140); 
        doc.text("2. Polygon Area Breakdown", MARGIN_X, currentY);
        currentY += 15;

        const polyTableY = currentY;
        const polyTableWidth = pageWidth - 2 * MARGIN_X;
        const polyRowHeight = 18;

        // Header
        doc.setFont("helvetica", "bold");
        doc.setFillColor(150, 190, 230); // Light Blue Header
        doc.setTextColor(255, 255, 255);
        doc.rect(MARGIN_X, polyTableY, polyTableWidth, polyRowHeight, "F");
        doc.text("Polygon ID", MARGIN_X + 10, polyTableY + 12);
        doc.text("Area (sqft)", MARGIN_X + 150, polyTableY + 12);
        doc.text("Perimeter (ft)", MARGIN_X + 300, polyTableY + 12);

        currentY = polyTableY + polyRowHeight;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);

        polygonsData.forEach((poly, i) => {
            const polygonPerimeter = poly.edges.reduce((sum, edge) => sum + edge.length, 0);
            
            // Check for page break
            if (currentY + polyRowHeight > pageHeight - 50) {
                doc.addPage();
                currentY = 40;
            }

            // Draw row with alternating background
            if (i % 2 !== 0) {
                doc.setFillColor(245, 245, 245);
                doc.rect(MARGIN_X, currentY, polyTableWidth, polyRowHeight, "F");
            }
            
            doc.setDrawColor(200, 200, 200);
            doc.rect(MARGIN_X, currentY, polyTableWidth, polyRowHeight); // row border

            doc.text(`Polygon ${i + 1} (${poly.id})`, MARGIN_X + 10, currentY + 12);
            doc.text(`${poly.areaSqFt.toFixed(2)}`, MARGIN_X + 150, currentY + 12);
            doc.text(`${polygonPerimeter.toFixed(2)}`, MARGIN_X + 300, currentY + 12);

            currentY += polyRowHeight;
        });

        currentY += 20;

        // ------------------------------------
        // 5. LENGTH SUMMARY LEGEND (Total Lengths)
        // ------------------------------------
        // Heading change: 
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(50, 50, 50);
        doc.text("3. Total Lengths Summary", MARGIN_X, currentY); // Section number changed to 3
        currentY += 15;

        const legendXStart = MARGIN_X;
        const columnWidth = (pageWidth - 2 * MARGIN_X) / 2;
        const rowHeight = 20;
        let legendY = currentY;

        // Aggregate dynamic lengths (Using the totalLengths from the summary hook)
        const dynamicLengths = summaryData.totalLengths;
        const allTypes = Object.keys(EDGE_TYPE_COLORS); 
        allTypes.sort();

        allTypes.forEach((type, index) => {
            const length = dynamicLengths[type] || 0;
            const formattedLength = toFeetInchesFormat(length);
            const displayValue =
                length > 0
                    ? formattedLength.replace("'", "ft ").replace('"', "in")
                    : "0ft 0in";

            // Agar length zero hai aur yeh default EDGE_TYPE_COLORS mein hai to skip nahi karein.
            // Lekin agar aap sirf measured lines dikhana chahte hain, toh yahan `if (length === 0) return;` laga sakte hain.
            
            const xOffset = index % 2 === 0 ? 0 : columnWidth;

            if (index % 2 === 0 && index > 0) {
                legendY += rowHeight;
            }

            // ... (Your existing code for drawing line indicator and text for Section 5) ...
            const colorHex = EDGE_TYPE_COLORS[type] || "#000000";
            const r = parseInt(colorHex.slice(1, 3), 16);
            const g = parseInt(colorHex.slice(3, 5), 16);
            const b = parseInt(colorHex.slice(5, 7), 16);

            doc.setLineWidth(1.5);
            doc.setDrawColor(r, g, b);

            if (type === "Wall Flashing") {
                doc.setLineDash([3, 3], 0);
            } else if (type === "Step Flashing") {
                doc.setLineDash([1, 2], 0);
            }
            doc.line(legendXStart + xOffset, legendY + 5, legendXStart + xOffset + 15, legendY + 5);
            doc.setLineDash([], 0);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);

            doc.text(type, legendXStart + xOffset + 20, legendY + 10);
            doc.text(
                displayValue,
                legendXStart + xOffset + columnWidth - 10,
                legendY + 10,
                { align: "right" }
            );
        });

        currentY = legendY + rowHeight + 20;


        // ------------------------------------
        // 6. DETAILED EDGES TABLE (Per-Edge List)
        // ------------------------------------
        
        if (currentY > pageHeight - 150) {
            doc.addPage();
            currentY = 40;
        }

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(50, 50, 50);
        doc.text("4. Detailed Edge List", MARGIN_X, currentY); // Section number changed to 4
        currentY += 15;

        const tableY = currentY;
        const tableWidth = pageWidth - 2 * MARGIN_X;
        const rowHeightTable = 18;

        // Header
        doc.setFont("helvetica", "bold");
        doc.setFillColor(100, 149, 237);
        doc.setTextColor(255, 255, 255);
        doc.rect(MARGIN_X, tableY, tableWidth, rowHeightTable, "F");
        doc.text("Side #", MARGIN_X + 10, tableY + 12);
        doc.text("Polygon ID", MARGIN_X + 80, tableY + 12);
        doc.text("Type", MARGIN_X + 180, tableY + 12);
        doc.text("Length (ft)", MARGIN_X + 280, tableY + 12);
        doc.text("Length (ft'in)", MARGIN_X + 380, tableY + 12);
        doc.text("Color", MARGIN_X + 480, tableY + 12); // Pushed color column further

        currentY = tableY + rowHeightTable;
        doc.setFont("helvetica", "normal");

        summaryData.detailedEdges.forEach((e, i) => { // Using data from summary hook
            const edgeType = e.type || "Unlabeled";
            const length = e.length || 0;
            const formattedLength = e.formattedLength || toFeetInchesFormat(length); // Use pre-calculated formatted length
            const polygonId = e.polygonId || 'N/A'; // Naya property

            if (currentY + rowHeightTable > pageHeight - 50) {
                doc.addPage();
                currentY = 40;
            }

            const colorHex = EDGE_TYPE_COLORS[edgeType] || "#000000";
            const r = parseInt(colorHex.slice(1, 3), 16);
            const g = parseInt(colorHex.slice(3, 5), 16);
            const b = parseInt(colorHex.slice(5, 7), 16);

            if (i % 2 !== 0) {
                doc.setFillColor(245, 245, 245);
                doc.rect(MARGIN_X, currentY, tableWidth, rowHeightTable, "F");
            }

            doc.setDrawColor(200, 200, 200);
            doc.rect(MARGIN_X, currentY, tableWidth, rowHeightTable);

            doc.setTextColor(0, 0, 0);
            doc.text(`${i + 1}`, MARGIN_X + 10, currentY + 12);
            doc.text(polygonId, MARGIN_X + 80, currentY + 12); // New Column
            doc.text(edgeType, MARGIN_X + 180, currentY + 12);
            doc.text(`${length.toFixed(2)}`, MARGIN_X + 280, currentY + 12);
            doc.text(formattedLength, MARGIN_X + 380, currentY + 12);

            doc.setFillColor(r, g, b);
            doc.setDrawColor(0, 0, 0);
            doc.rect(MARGIN_X + 480, currentY + 4, 15, 10, "FD");

            currentY += rowHeightTable;
        });


        // **********************************
        // 7-8. MAP REFERENCE & FOOTER (Jaisa aapka code tha, waisa hi rakha hai)
        // **********************************
        
        currentY += 20;
        if (currentY > pageHeight - 50) {
            doc.addPage();
            currentY = 40;
        }

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(50, 50, 50);
        doc.text("5. Map & Data Reference", MARGIN_X, currentY);
        currentY += 15;

        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 200);

        const googleLink = "https://maps.google.com/view_project_XYZ";
        doc.textWithLink(
            "View Interactive Map and Shapes Online",
            MARGIN_X,
            currentY,
            { url: googleLink }
        );

        const footerY = pageHeight - 20;
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(MARGIN_X, footerY - 5, pageWidth - MARGIN_X, footerY - 5);

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);

        const pageNumber = (doc).internal.getNumberOfPages();
        doc.text(
            `Report Generated by RoofPro Software | Confidential | Page ${pageNumber}`,
            pageWidth / 2,
            footerY + 5,
            { align: "center" }
        );

        doc.save("Professional_Roof_Measurement_Report.pdf");
    } catch (err) {
        console.error("PDF generation error:", err);
        alert("Error while generating PDF. Check console for details.");
    }
};
// module.exports = { pdfGenrate }; // Agar ye file component se alag ho
