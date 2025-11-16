// "use client";
// import React, {
//   useRef,
//   useState,
//   forwardRef,
//   useImperativeHandle,
//   useEffect,
// } from "react";
// import jsPDF from "jspdf";
// // Assuming these types/components are defined elsewhere in your project
// import MapContainer, {
//   MapSectionHandle,
// } from "../sections/components/MapContainer";

// // --- Type Definitions (Ensure these match your actual imports) ---
// interface RoofMapSectionProps {
//   setPlanArea: (area: number) => void;
//   setRoofArea: (area: number) => void;
//   onMapLoad?: (mapInstance: mapboxgl.Map) => void;
//   setEdges: (
//     edges: { id: string; length: number; type: string; polygonId: string }[]
//   ) => void;
//   setPolygonPoints: (
//     points: { lat: number; lon: number; seq: number }[]
//   ) => void;
//   selectedLabel?: { name: string; color: string } | null;
// }

// // --- Component ---
// const RoofMapSection = forwardRef<MapSectionHandle, RoofMapSectionProps>(
//   (
//     { setPlanArea, setRoofArea, setEdges, setPolygonPoints, selectedLabel },
//     ref
//   ) => {
//     // ⚠️ CRITICAL: Use the component's state variables for PDF generation
//     const mapRef = useRef<MapSectionHandle | null>(null);
//     const [edgesState, setEdgesState] = useState<
//       { id: string; length: number; type: string; polygonId: string }[]
//     >([]);
//     const [planAreaState, setPlanAreaState] = useState<number>(0);
//     const [roofAreaState, setRoofAreaState] = useState<number>(0);
//     const [showGrid, setShowGrid] = useState(false);

//     // --- Component Logic ---
    
//     // Handle measurements from MapContainer
//     const handleMeasurementsChange = (payload: {
//       edges: any[];
//       planArea: number;
//       roofArea: number;
//       polygonPoints: any[];
//     }) => {
//       setEdgesState(payload.edges || []);
//       setPlanAreaState(payload.planArea || 0);
//       setRoofAreaState(payload.roofArea || 0);
//       setPlanArea(payload.planArea);
//       setRoofArea(payload.roofArea);
//       setEdges(payload.edges);
//       setPolygonPoints(payload.polygonPoints);
//     };

//     // Edge click + label assignment (polygon-aware) - (Kept your provided logic)
// // --- EDGE CLICK + LABEL ASSIGNMENT ---
// useEffect(() => {
//   const map = mapRef.current?.getMap?.();
//   if (!map) return;

//   const handleEdgeClick = (e: mapboxgl.MapMouseEvent & unknown) => {
//     try {
//       const layerNames = [
//         "gl-draw-line-inactive",
//         "gl-draw-line-active",
//         "gl-draw-polygon-stroke-inactive",
//         "gl-draw-polygon-stroke-active",
//       ];

//       // Filter layers that exist
//       const availableLayers = layerNames.filter((layer) => {
//         try { return !!map.getLayer(layer); } catch { return false; }
//       });
//       if (!availableLayers.length) return;

//       const features = map.queryRenderedFeatures(e.point, { layers: availableLayers });
//       if (!features.length) return;

//       const edgeFeature = features[0];
//       const edgeId = edgeFeature.properties?.id || edgeFeature.id;
//       const polygonId = edgeFeature.properties?.["draw:feature-id"] || edgeFeature.id;

//       if (!edgeId || !selectedLabel) return;

//       // ✅ Update only clicked edge in state
//       const updatedEdges = edgesState.map((edgeItem) =>
//         edgeItem.id === edgeId && edgeItem.polygonId === polygonId
//           ? { ...edgeItem, type: selectedLabel.name }
//           : edgeItem
//       );
//       setEdgesState(updatedEdges);
//       setEdges(updatedEdges);

//       // ✅ Update color only for this edge
//       layerNames.forEach((layer) => {
//         try {
//           if (map.getLayer(layer)) {
//             map.setPaintProperty(layer, "line-color", [
//               "case",
//               ["all", ["==", ["get", "id"], edgeId], ["==", ["get", "polygonId"], polygonId]],
//               selectedLabel.color,
//               '#FFD500' // default
//             ]);
//           }
//         } catch (err) {
//           console.warn(`[EDGE CLICK] Failed to update color on layer ${layer}:`, err);
//         }
//       });
//     } catch (err) {
//       console.error("[EDGE CLICK] Unexpected error:", err);
//     }
//   };

//   map.on("click", handleEdgeClick);
//   return () => map.off("click", handleEdgeClick);
// }, [selectedLabel, edgesState, setEdges]);


//     // --- Static Data and Helpers for PDF ---
//     const STATIC_LENGTH_DATA = [
//       { type: "Eaves", display: "ft in", color: "#6AA84F" },
//       { type: "Valleys", display: "ft in", color: "#D03F3B" },
//       { type: "Hips", display: "ft in", color: "#8E7CC3" },
//       { type: "Ridges", display: "ft in", color: "#B6D7A8" },
//       { type: "Rakes", display: "ft in", color: "#FFD966" },
//       { type: "Wall Flashing", display: "ft in", color: "#4A86E8" },
//       { type: "Step Flashing", display: "ft in", color: "#990000" },
//       { type: "Parapet Wall", display: "ft in", color: "#E69138" },
//       { type: "Transitions", display: "ft in", color: "#FF99FF" },
//       { type: "Unspecified", display: "ft in", color: "#4AC6FF" },
//     ];

//     const EDGE_TYPE_COLORS: Record<string, string> = {
//       Eaves: "#6AA84F",
//       Valleys: "#D03F3B",
//       Hips: "#8E7CC3",
//       Ridges: "#B6D7A8",
//       Rakes: "#FFD966",
//       "Wall Flashing": "#4A86E8",
//       "Step Flashing": "#990000",
//       Transitions: "#FF99FF",
//       "Parapet Wall": "#E69138",
//       Unspecified: "#4AC6FF",
//     };

//     const dummyRoofArea = 2500.5;
//     const dummyPlanArea = 2200.75;
//     const dummyEdges = [
//       { type: "Eaves", length: 50.1, polygonId: "p1" },
//     ];

//     // Helper function to convert feet to feet'inches" format
//     const toFeetInchesFormat = (feet: number): string => {
//       if (!isFinite(feet) || feet < 0) return `0'0"`;
//       const feetInt = Math.floor(feet);
//       const inches = Math.round((feet - feetInt) * 12);
//       return `${feetInt}'${inches}"`;
//     };

    // --- downloadPDF Function ---
    // const downloadPDF = async () => {
    //   try {
    //     const doc = new jsPDF({
    //       orientation: "portrait",
    //       unit: "px",
    //       format: "a4",
    //     });
    //     const pageWidth = doc.internal.pageSize.getWidth();
    //     const pageHeight = doc.internal.pageSize.getHeight();
    //     const MARGIN_X = 40;
    //     let currentY = 10;

    //     // Ensure states have fallback values for clean generation
    //     const safeRoofAreaState =
    //       typeof roofAreaState === "number" && isFinite(roofAreaState)
    //         ? roofAreaState
    //         : dummyRoofArea;
    //     const safePlanAreaState =
    //       typeof planAreaState === "number" && isFinite(planAreaState)
    //         ? planAreaState
    //         : dummyPlanArea;
    //     const safeEdgesState =
    //       Array.isArray(edgesState) && edgesState.length > 0
    //         ? edgesState
    //         : dummyEdges;

    //     // ------------------------------------
    //     // 1. PROFESSIONAL HEADER (Logo & Info)
    //     // ------------------------------------

    //     // Load Public Logo
    //     const logoUrl = "/logo-latest.png";
    //     const loadImage = (url: string) =>
    //       new Promise<HTMLImageElement>((resolve, reject) => {
    //         const img = new Image();
    //         img.onload = () => resolve(img);
    //         img.onerror = (err) => reject(err);
    //         img.src = url;
    //       });

    //     try {
    //       const logoImg = await loadImage(logoUrl);
    //       const canvas = document.createElement("canvas");
    //       canvas.width = logoImg.width;
    //       canvas.height = logoImg.height;
    //       const ctx = canvas.getContext("2d");
    //       if (ctx) ctx.drawImage(logoImg, 0, 0);
    //       const imgData = canvas.toDataURL("image/png");

    //       doc.addImage(imgData, "PNG", MARGIN_X, currentY, 80, 40);
    //     } catch (err) {
    //       console.warn("Logo loading failed:", err);
    //       // Fallback text if logo fails
    //       doc.setFontSize(16);
    //       doc.setFont("helvetica", "bold");
    //       doc.setTextColor(50, 50, 50);
    //       doc.text("ROOFPRO", MARGIN_X, currentY + 15);
    //     }

    //     // Client / Project Info (Right side)
    //     const personName = localStorage.getItem("personName") || "John Doe";
    //     const projectAddress =
    //       localStorage.getItem("projectAddress") ||
    //       "123 Main St, City, State 12345";
    //     const reportDate = new Date().toLocaleDateString();

    //     doc.setFontSize(10);
    //     doc.setFont("helvetica", "normal");
    //     doc.setTextColor(80, 80, 80);
    //     const infoX = pageWidth - MARGIN_X;
    //     doc.text(`Client: ${personName}`, infoX, currentY + 5, {
    //       align: "right",
    //     });
    //     doc.text(`Address: ${projectAddress}`, infoX, currentY + 18, {
    //       align: "right",
    //     });
    //     doc.text(`Date: ${reportDate}`, infoX, currentY + 31, {
    //       align: "right",
    //     });

    //     // Separator line
    //     currentY = 60;
    //     doc.setDrawColor(200, 200, 200);
    //     doc.setLineWidth(1);
    //     doc.line(MARGIN_X, currentY, pageWidth - MARGIN_X, currentY);

    //     currentY += 20;

    //     // ------------------------------------
    //     // 2. MAIN REPORT TITLE (Lowered Heading)
    //     // ------------------------------------
    //     doc.setFontSize(22);
    //     doc.setFont("helvetica", "bold");
    //     doc.setTextColor(30, 80, 140); // Dark Blue Title
    //     doc.text("ROOF MEASUREMENT REPORT", pageWidth / 2, currentY, {
    //       align: "center",
    //     });

    //     currentY += 30; // Move down after the new main heading

    //     // ------------------------------------
    //     // 3. ROOF SUMMARY BOX (Top Left)
    //     // ------------------------------------
    //     const summaryBoxWidth = 180;
    //     const summaryBoxHeight = 55;
    //     doc.setDrawColor(30, 80, 140);
    //     doc.setFillColor(235, 245, 255);
    //     doc.rect(MARGIN_X, currentY, summaryBoxWidth, summaryBoxHeight, "FD");

    //     doc.setFont("helvetica", "bold");
    //     doc.setFontSize(14);
    //     doc.setTextColor(30, 80, 140);
    //     doc.text("MEASUREMENT SUMMARY", MARGIN_X + 10, currentY + 15);

    //     doc.setFontSize(12);
    //     doc.setTextColor(50, 50, 50);
    //     doc.text(`Total Roof Area:`, MARGIN_X + 10, currentY + 35);
    //     doc.text(
    //       `${safeRoofAreaState.toFixed(2)} sqft`,
    //       MARGIN_X + summaryBoxWidth - 10,
    //       currentY + 35,
    //       { align: "right" }
    //     );
    //     doc.text(`Plan Area:`, MARGIN_X + 10, currentY + 50);
    //     doc.text(
    //       `${safePlanAreaState.toFixed(2)} sqft`,
    //       MARGIN_X + summaryBoxWidth - 10,
    //       currentY + 50,
    //       { align: "right" }
    //     );

    //     currentY += summaryBoxHeight + 20;

    //     // ------------------------------------
    //     // 4. ROOF DIAGRAM (Static Image/Placeholder)
    //     // ------------------------------------
    //     doc.setFontSize(16);
    //     doc.setFont("helvetica", "bold");
    //     doc.setTextColor(50, 50, 50);
    //     doc.text("1. Roof Sketch & Lengths", MARGIN_X, currentY);
    //     currentY += 15;

    //     const diagramBoxWidth = pageWidth - 2 * MARGIN_X;
    //     const diagramBoxHeight = 250;
    //     doc.setDrawColor(200, 200, 200);
    //     doc.setFillColor(255, 255, 255);
    //     doc.rect(MARGIN_X, currentY, diagramBoxWidth, diagramBoxHeight, "FD");

    //     // Placeholder for the main roof diagram
    //     // --- START PLACEHOLDER ---
    //     doc.setFontSize(10);
    //     doc.setFont("helvetica", "italic");
    //     doc.setTextColor(150, 150, 150);
    //     doc.text(
    //       "Map Diagram/Vector Drawing (Map Ref/Data URL goes here)",
    //       pageWidth / 2,
    //       currentY + 10,
    //       { align: "center" }
    //     );
    //     doc.text(
    //       "This space would contain the actual roof outline and measurements.",
    //       pageWidth / 2,
    //       currentY + 25,
    //       { align: "center" }
    //     );

    //     // Adding the visual "Length" title from the image replica
    //     doc.setFont("helvetica", "bold");
    //     doc.setFontSize(18);
    //     doc.setTextColor(60, 118, 172);
    //     doc.text("Length", MARGIN_X + 20, currentY + 50);

    //     // Compass (Static replica)
    //     const compassX = pageWidth - MARGIN_X - 25;
    //     const compassY = currentY + 40;
    //     doc.setDrawColor(0, 0, 0);
    //     doc.line(compassX, compassY - 15, compassX, compassY + 15);
    //     doc.line(compassX - 15, compassY, compassX + 15, compassY);
    //     doc.setFont("helvetica", "bold");
    //     doc.text("N", compassX, compassY - 18, { align: "center" });
    //     doc.text("S", compassX, compassY + 25, { align: "center" });
    //     doc.text("E", compassX + 18, compassY + 3, { align: "left" });
    //     doc.text("W", compassX - 18, compassY + 3, { align: "right" });

    //     // --- END PLACEHOLDER ---

    //     currentY += diagramBoxHeight + 20;

    //     // ------------------------------------
    //     // 5. LENGTH SUMMARY LEGEND (Image replica layout + Dynamic Data)
    //     // ------------------------------------
    //     doc.setFontSize(16);
    //     doc.setFont("helvetica", "bold");
    //     doc.setTextColor(50, 50, 50);
    //     doc.text("2. Length Summary", MARGIN_X, currentY);
    //     currentY += 15;

    //     const legendXStart = MARGIN_X;
    //     const columnWidth = (pageWidth - 2 * MARGIN_X) / 2;
    //     const rowHeight = 20;
    //     let legendY = currentY;

    //     // Aggregate dynamic lengths
    //     const dynamicLengths: Record<string, number> = safeEdgesState.reduce(
    //       (acc, e: any) => {
    //         const type = e.type || "Unspecified";
    //         acc[type] = (acc[type] || 0) + (e.length || 0);
    //         return acc;
    //       },
    //       {} as Record<string, number>
    //     );

    //     // Get all unique types and sort them for consistent display
    //     const allTypes = Array.from(
    //       new Set([
    //         ...Object.keys(EDGE_TYPE_COLORS),
    //         ...Object.keys(dynamicLengths),
    //       ])
    //     );
    //     allTypes.sort();

    //     allTypes.forEach((type, index) => {
    //       const length = dynamicLengths[type] || 0;
    //       const formattedLength = toFeetInchesFormat(length);
    //       const displayValue =
    //         length > 0
    //           ? formattedLength.replace("'", "ft ").replace('"', "in")
    //           : "0ft 0in";

    //       const xOffset = index % 2 === 0 ? 0 : columnWidth;

    //       if (index % 2 === 0 && index > 0) {
    //         legendY += rowHeight;
    //       }

    //       // Get color
    //       const colorHex = EDGE_TYPE_COLORS[type] || "#000000";
    //       const r = parseInt(colorHex.slice(1, 3), 16);
    //       const g = parseInt(colorHex.slice(3, 5), 16);
    //       const b = parseInt(colorHex.slice(5, 7), 16);

    //       // Draw line indicator (matching image style)
    //       doc.setLineWidth(1.5);
    //       doc.setDrawColor(r, g, b);

    //       if (type === "Wall Flashing") {
    //         doc.setLineDash([3, 3], 0);
    //       } else if (type === "Step Flashing") {
    //         doc.setLineDash([1, 2], 0);
    //       }
    //       doc.line(
    //         legendXStart + xOffset,
    //         legendY + 5,
    //         legendXStart + xOffset + 15,
    //         legendY + 5
    //       );
    //       doc.setLineDash([], 0); // Reset line style

    //       // Draw Text
    //       doc.setFont("helvetica", "normal");
    //       doc.setFontSize(10);
    //       doc.setTextColor(0, 0, 0);

    //       // Type Label (Left aligned)
    //       doc.text(type, legendXStart + xOffset + 20, legendY + 10);

    //       // Length Value (Right aligned within its half-column)
    //       doc.text(
    //         displayValue,
    //         legendXStart + xOffset + columnWidth - 10,
    //         legendY + 10,
    //         { align: "right" }
    //       );
    //     });

    //     currentY = legendY + rowHeight + 20;

    //     // ------------------------------------
    //     // 6. DETAILED EDGES TABLE (Original Dynamic Logic)
    //     // ------------------------------------

    //     // Add a new page if the table will overflow
    //     if (currentY > pageHeight - 150) {
    //       doc.addPage();
    //       currentY = 40;
    //     }

    //     doc.setFontSize(16);
    //     doc.setFont("helvetica", "bold");
    //     doc.setTextColor(50, 50, 50);
    //     doc.text("3. Detailed Edge List", MARGIN_X, currentY);
    //     currentY += 15;

    //     const tableY = currentY;
    //     const tableWidth = pageWidth - 2 * MARGIN_X;
    //     const rowHeightTable = 18;

    //     // Header
    //     doc.setFont("helvetica", "bold");
    //     doc.setFillColor(100, 149, 237);
    //     doc.setTextColor(255, 255, 255);
    //     doc.rect(MARGIN_X, tableY, tableWidth, rowHeightTable, "F");
    //     doc.text("Side #", MARGIN_X + 10, tableY + 12);
    //     doc.text("Type", MARGIN_X + 100, tableY + 12);
    //     doc.text("Length (ft)", MARGIN_X + 200, tableY + 12);
    //     doc.text("Length (ft'in)", MARGIN_X + 300, tableY + 12);
    //     doc.text("Color", MARGIN_X + 400, tableY + 12);

    //     currentY = tableY + rowHeightTable;
    //     doc.setFont("helvetica", "normal");

    //     safeEdgesState.forEach((e: any, i: number) => {
    //       const edgeType = e.type || "Unlabeled";
    //       const length = e.length || 0;
    //       const formattedLength = toFeetInchesFormat(length);

    //       // Check for page break
    //       if (currentY + rowHeightTable > pageHeight - 50) {
    //         doc.addPage();
    //         currentY = 40;
    //       }

    //       // Get color
    //       const colorHex = EDGE_TYPE_COLORS[edgeType] || "#000000";
    //       const r = parseInt(colorHex.slice(1, 3), 16);
    //       const g = parseInt(colorHex.slice(3, 5), 16);
    //       const b = parseInt(colorHex.slice(5, 7), 16);

    //       // Draw row with alternating background
    //       if (i % 2 !== 0) {
    //         doc.setFillColor(245, 245, 245);
    //         doc.rect(MARGIN_X, currentY, tableWidth, rowHeightTable, "F");
    //       }

    //       doc.setDrawColor(200, 200, 200);
    //       doc.rect(MARGIN_X, currentY, tableWidth, rowHeightTable); // row border

    //       doc.setTextColor(0, 0, 0);
    //       doc.text(`${i + 1}`, MARGIN_X + 10, currentY + 12);
    //       doc.text(edgeType, MARGIN_X + 100, currentY + 12);
    //       doc.text(`${length.toFixed(2)}`, MARGIN_X + 200, currentY + 12);
    //       doc.text(formattedLength, MARGIN_X + 300, currentY + 12);

    //       // Draw color indicator
    //       doc.setFillColor(r, g, b);
    //       doc.setDrawColor(0, 0, 0);
    //       doc.rect(MARGIN_X + 400, currentY + 4, 15, 10, "FD");

    //       currentY += rowHeightTable;
    //     });

    //     // ------------------------------------
    //     // 7. GOOGLE MAP/SHAPES LINK REFERENCE
    //     // ------------------------------------
    //     currentY += 20;
    //     if (currentY > pageHeight - 50) {
    //       doc.addPage();
    //       currentY = 40;
    //     }

    //     doc.setFontSize(12);
    //     doc.setFont("helvetica", "bold");
    //     doc.setTextColor(50, 50, 50);
    //     doc.text("4. Map & Data Reference", MARGIN_X, currentY);
    //     currentY += 15;

    //     doc.setFont("helvetica", "normal");
    //     doc.setTextColor(0, 0, 200); // Blue for links

    //     const googleLink = "https://maps.google.com/view_project_XYZ";
    //     doc.textWithLink(
    //       "View Interactive Map and Shapes Online",
    //       MARGIN_X,
    //       currentY,
    //       { url: googleLink }
    //     );

    //     // ------------------------------------
    //     // 8. PROFESSIONAL FOOTER
    //     // ------------------------------------
    //     const footerY = pageHeight - 20;
    //     doc.setDrawColor(200, 200, 200);
    //     doc.setLineWidth(0.5);
    //     doc.line(MARGIN_X, footerY - 5, pageWidth - MARGIN_X, footerY - 5);

    //     doc.setFontSize(8);
    //     doc.setFont("helvetica", "normal");
    //     doc.setTextColor(100, 100, 100);

    //     const pageNumber = (doc as any).internal.getNumberOfPages();
    //     doc.text(
    //       `Report Generated by RoofPro Software | Confidential | Page ${pageNumber}`,
    //       pageWidth / 2,
    //       footerY + 5,
    //       { align: "center" }
    //     );

    //     doc.save("Professional_Roof_Measurement_Report.pdf");
    //   } catch (err) {
    //     console.error("PDF generation error:", err);
    //     alert("Error while generating PDF. Check console for details.");
    //   }
    // };

//     // --- Expose methods to parent ---
//     useImperativeHandle(ref, () => ({
//       startDrawing: () => mapRef.current?.startDrawing(),
//       startSingleDrawing: () => mapRef.current?.startSingleDrawing(),
//       handleLabelSelect: (label: { name: string; color: string }) =>
//         mapRef.current?.handleLabelSelect?.(label),
//       deleteAll: () => mapRef.current?.deleteAll(),
//       setDrawMode: (mode: string) => mapRef.current?.setDrawMode(mode),
//       undo: () => mapRef.current?.undo(),
//       redo: () => mapRef.current?.redo(),
//       toggleLabels: () => mapRef.current?.toggleLabels(),
//       confirmLocation: (coords: [number, number]) =>
//         mapRef.current?.confirmLocation(coords),
//       searchAddress: (address: string) =>
//         mapRef.current?.searchAddress(address),
//       getMapCanvasDataURL: () => mapRef.current?.getMapCanvasDataURL(),
//       rotateLeft: () => mapRef.current?.rotateLeft(),
//       rotateRight: () => mapRef.current?.rotateRight(),
//       toggleStreetView: () => mapRef.current?.toggleStreetView(),
//       deleteSelected: () => mapRef.current?.deleteSelected(),
//       downloadPDF, // This is the function exposed for PDF generation
//     }));

//     // --- Render ---
//     return (
//       <div className="relative w-full h-full">
//         <MapContainer
//           ref={mapRef}
//           onMeasurementsChange={handleMeasurementsChange}
//           onGridToggle={(visible) => setShowGrid(visible)}
//           selectedLabel={selectedLabel || undefined}
//         />
//         {showGrid && (
//           <div
//             className="absolute inset-0 z-40 pointer-events-none"
//             style={{
//               backgroundImage:
//                 "linear-gradient(to right, rgba(255,255,255,0.29) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.22) 1px, transparent 1px)",
//               backgroundSize: "100px 100px",
//               backdropFilter: "brightness(0.9)",
//             }}
//           />
//         )}
//       </div>
//     );
//   }
// );

// RoofMapSection.displayName = "RoofMapSection";
// export default RoofMapSection;