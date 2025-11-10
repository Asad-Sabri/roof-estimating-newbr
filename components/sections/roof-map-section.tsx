"use client";
import React, {
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import jsPDF from "jspdf";
import MapContainer, {
  MapSectionHandle,
} from "../sections/components/MapContainer";

interface RoofMapSectionProps {
  setPlanArea: (area: number) => void;
  setRoofArea: (area: number) => void;
  onMapLoad?: (mapInstance: mapboxgl.Map) => void;
  setEdges: (
    edges: { id: string; length: number; type: string; polygonId: string }[]
  ) => void;
  setPolygonPoints: (
    points: { lat: number; lon: number; seq: number }[]
  ) => void;
  selectedLabel?: { name: string; color: string } | null;
}

const RoofMapSection = forwardRef<MapSectionHandle, RoofMapSectionProps>(
  (
    { setPlanArea, setRoofArea, setEdges, setPolygonPoints, selectedLabel },
    ref
  ) => {
    const mapRef = useRef<MapSectionHandle | null>(null);
    const [edgesState, setEdgesState] = useState<any[]>([]);
    const [planAreaState, setPlanAreaState] = useState<number>(0);
    const [roofAreaState, setRoofAreaState] = useState<number>(0);
    const [showGrid, setShowGrid] = useState(false);

    // ✅ Handle measurements from MapContainer
    const handleMeasurementsChange = (payload: {
      edges: any[];
      planArea: number;
      roofArea: number;
      polygonPoints: any[];
    }) => {
      setEdgesState(payload.edges || []);
      setPlanAreaState(payload.planArea || 0);
      setRoofAreaState(payload.roofArea || 0);
      setPlanArea(payload.planArea);
      setRoofArea(payload.roofArea);
      setEdges(payload.edges);
      setPolygonPoints(payload.polygonPoints);
    };

    // ✅ Edge click + label assignment (polygon-aware)
    useEffect(() => {
      const map = mapRef.current?.getMap?.(); // This whole useEffect seems to be for a different feature (coloring edges on click) and might be conflicting. The new logic will handle coloring the entire selected polygon.
      if (!map) return;

      const handleEdgeClick = (
        e: mapboxgl.MapMouseEvent & unknown
      ) => {
        // ✅ Check which layers exist in the map before querying
        const availableLayers: string[] = [];
        const layerNames = [
          "gl-draw-line-inactive",
          "gl-draw-line-active",
          "gl-draw-polygon-stroke-inactive",
          "gl-draw-polygon-stroke-active",
        ];

        layerNames.forEach((layerName) => {
          try {
            if (map.getLayer(layerName)) {
              availableLayers.push(layerName);
            }
          } catch (err) {
            // Layer doesn't exist, skip it
          }
        });

        if (availableLayers.length === 0) return;

        const features = map.queryRenderedFeatures(e.point, {
          layers: availableLayers,
        });

        if (!features.length) return;

        const edgeFeature = features[0];
        const edgeId = edgeFeature.properties?.id || edgeFeature.id;
        const polygonId =
          edgeFeature.properties?.["draw:feature-id"] || edgeFeature.id;

        if (!edgeId || !selectedLabel) return;

        // ✅ Update only the clicked edge of the specific polygon
        const updatedEdges = edgesState.map((edgeItem) =>
          edgeItem.id === edgeId && edgeItem.polygonId === polygonId
            ? { ...edgeItem, type: selectedLabel.name }
            : edgeItem
        );

        setEdgesState(updatedEdges);
        setEdges(updatedEdges);

        // ✅ Update color for only this edge
        try {
          const layerNames = [
            "gl-draw-line-inactive",
            "gl-draw-line-active",
            "gl-draw-polygon-stroke-inactive",
            "gl-draw-polygon-stroke-active",
          ];

          layerNames.forEach((layer) => {
            try {
              if (map.getLayer(layer)) {
                map.setPaintProperty(layer, "line-color", [
                  "case",
                  [
                    "all",
                    ["==", ["get", "id"], edgeId],
                    ["==", ["get", "polygonId"], polygonId],
                  ],
                  selectedLabel.color,
                  "#FFD500",
                ]);
              }
            } catch (layerErr) {
              // Layer doesn't exist or error setting property, skip it
            }
          });
        } catch (err) {
          console.warn("Color update failed:", err);
        }
      };

      map.on("click", handleEdgeClick);
      return () => {
        map.off("click", handleEdgeClick);
      };
    }, [selectedLabel, edgesState]);

    // ✅ PDF generation
    const downloadPDF = async () => {
      try {
        const doc = new jsPDF({ orientation: "landscape", unit: "px" });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // -------------------
        // Load Public Logo
        // -------------------

        const logoUrl = "/logo-latest.png";
        const loadImage = (url: string) =>
          new Promise<HTMLImageElement>((resolve, reject) => {
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

          doc.addImage(imgData, "PNG", 20, 10, 80, 40); // adjust position & size
        } catch (err) {
          console.warn("Logo loading failed:", err);
        }

        // -------------------
        // Report Title
        // -------------------
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("Roof Measurement Report", pageWidth / 2, 35, {
          align: "center",
        });

        // -------------------
        // Client / Project Info
        // -------------------
        const personName = localStorage.getItem("personName") || "John Doe";
        const projectAddress =
          localStorage.getItem("projectAddress") || "123 Main St, City";
        const reportDate = new Date().toLocaleDateString();

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`Client: ${personName}`, 20, 70);
        doc.text(`Project Address: ${projectAddress}`, 20, 90);
        doc.text(`Report Date: ${reportDate}`, 20, 110);

        // -------------------
        // Roof Summary Box
        // -------------------
        doc.setDrawColor(0);
        doc.setFillColor(220, 220, 220);
        doc.rect(20, 130, 200, 50, "FD");
        doc.setFont("helvetica", "bold");
        doc.text(`Total Roof Area:`, 30, 155);
        doc.text(`${roofAreaState.toFixed(2)} sqft`, 130, 155);
        doc.text(`Plan Area:`, 30, 175);
        doc.text(`${planAreaState.toFixed(2)} sqft`, 130, 175);

        // -------------------
        // Roof Type Summary by Polygon (Format: "ridge => 2 polygon 200'1")
        // -------------------
        let y = 200;
        
        // ✅ Helper function to convert feet to feet'inches" format
        const toFeetInchesFormat = (feet: number): string => {
          if (!isFinite(feet) || feet < 0) return `0'0"`;
          const feetInt = Math.floor(feet);
          const inches = Math.round((feet - feetInt) * 12);
          return `${feetInt}'${inches}"`;
        };

        // ✅ Get polygon data from localStorage or current state
        let polygonsData: any[] = [];
        try {
          const savedData = localStorage.getItem("roofPolygonsState");
          if (savedData) {
            polygonsData = JSON.parse(savedData);
          }
        } catch {}

        // ✅ Group polygons by roof type label
        const polygonsByType: Record<string, { polygons: any[]; totalLength: number }> = {};
        const edgeTypeColors: Record<string, string> = {
          Ridge: "#e74c3c",
          Hip: "#f39c12",
          Valley: "#8e44ad",
          Rake: "#2980b9",
          Eave: "#27ae60",
          Flashing: "#16a085",
          "Step Flashing": "#d35400",
          Transition: "#2c3e50",
        };

        // ✅ Calculate total length for each polygon type from edgesState
        // ✅ Group edges by polygon and then by roof type
        const polygonTypesMap: Record<string, Set<string>> = {}; // roofType -> polygonIds
        const polygonLengths: Record<string, number> = {}; // polygonId -> totalLength
        
        edgesState.forEach((e: any) => {
          const edgeType = e.type || "Unlabeled";
          const polygonId = e.polygonId || "";
          
          if (edgeType !== "edge" && edgeType !== "Unlabeled") {
            if (!polygonTypesMap[edgeType]) {
              polygonTypesMap[edgeType] = new Set();
            }
            if (polygonId) {
              polygonTypesMap[edgeType].add(polygonId);
            }
            
            // ✅ Calculate total length for this polygon type
            if (!polygonsByType[edgeType]) {
              polygonsByType[edgeType] = { polygons: [], totalLength: 0 };
            }
            polygonsByType[edgeType].totalLength += e.length || 0;
          }
        });

        // ✅ Also use localStorage data if available
        polygonsData.forEach((polygon: any) => {
          const roofType = polygon.label || "Unlabeled";
          if (roofType !== "Unlabeled") {
            if (!polygonsByType[roofType]) {
              polygonsByType[roofType] = { polygons: [], totalLength: 0 };
            }
            polygonsByType[roofType].polygons.push(polygon);
          }
        });

        // ✅ Update polygon counts from edgesState
        Object.keys(polygonTypesMap).forEach((roofType) => {
          if (polygonsByType[roofType]) {
            const polygonCount = Math.max(polygonTypesMap[roofType].size, polygonsByType[roofType].polygons.length || 1);
            polygonsByType[roofType].polygons = Array(polygonCount).fill({}); // Set count
          }
        });

        // ✅ Display roof types in format: "ridge => 2 polygon 200'1"
        if (Object.keys(polygonsByType).length > 0) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(14);
          doc.setTextColor(0, 0, 0);
          doc.text("Roof Type Summary", 20, y);
          y += 20;

          // ✅ Sort by type name
          const sortedTypes = Object.entries(polygonsByType).sort(([a], [b]) => a.localeCompare(b));
          
          sortedTypes.forEach(([type, data]) => {
            // ✅ Get polygon count from polygonTypesMap or polygons array
            const polygonCount = polygonTypesMap[type]?.size || data.polygons.length || 1;
            const formattedLength = toFeetInchesFormat(data.totalLength);
            
            // ✅ Format: "ridge => 2 polygon 200'1"
            const summaryText = `${type} => ${polygonCount} polygon ${formattedLength}`;
            
            // ✅ Color indicator
            const colorHex = edgeTypeColors[type] || "#000000";
            const r = parseInt(colorHex.slice(1, 3), 16);
            const g = parseInt(colorHex.slice(3, 5), 16);
            const b = parseInt(colorHex.slice(5, 7), 16);
            doc.setFillColor(r, g, b);
            doc.setDrawColor(0, 0, 0);
            doc.rect(20, y - 4, 12, 12, "FD");

            // ✅ Text
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.text(summaryText, 40, y + 4);

            y += 18;

            if (y > pageHeight - 300) {
              doc.addPage();
              y = 40;
            }
          });

          y += 10;
        }

        // -------------------
        // Edges Table with Color Coding (Detailed)
        // -------------------
        if (edgesState.length > 0) {
          // ✅ Edge type color mapping (matches left sidebar)
          const edgeTypeColors: Record<string, string> = {
            Ridge: "#e74c3c",
            Hip: "#f39c12",
            Valley: "#8e44ad",
            Rake: "#2980b9",
            Eave: "#27ae60",
            Flashing: "#16a085",
            "Step Flashing": "#d35400",
            Transition: "#2c3e50",
          };
          
          doc.setFont("helvetica", "bold");
          doc.setFillColor(100, 149, 237); // header color
          doc.setTextColor(255, 255, 255);
          doc.rect(20, y, pageWidth - 40, 20, "F");
          doc.text("Side", 30, y + 14);
          doc.text("Type", 100, y + 14);
          doc.text("Length (ft)", 200, y + 14);
          doc.text("Color", 280, y + 14);

          y += 20;
          doc.setFont("helvetica", "normal");
          
          // ✅ Group edges by type for summary
          const edgesByType: Record<string, { count: number; totalLength: number }> = {};

          edgesState.forEach((e: any, i: number) => {
            const edgeType = e.type || "Unlabeled";
            
            // ✅ Track summary by type
            if (!edgesByType[edgeType]) {
              edgesByType[edgeType] = { count: 0, totalLength: 0 };
            }
            edgesByType[edgeType].count++;
            edgesByType[edgeType].totalLength += e.length || 0;
            
            // ✅ Get color for this edge type
            const colorHex = edgeTypeColors[edgeType] || "#000000";
            const r = parseInt(colorHex.slice(1, 3), 16);
            const g = parseInt(colorHex.slice(3, 5), 16);
            const b = parseInt(colorHex.slice(5, 7), 16);
            
            // ✅ Draw row with alternating background
            if (i % 2 === 0) {
              doc.setFillColor(245, 245, 245);
              doc.rect(20, y, pageWidth - 40, 18, "F");
            }
            
            doc.setDrawColor(200, 200, 200);
            doc.rect(20, y, pageWidth - 40, 18); // row border
            
            doc.setTextColor(0, 0, 0);
            doc.text(`${i + 1}`, 30, y + 14);
            doc.text(edgeType, 100, y + 14);
            doc.text(`${(e.length || 0).toFixed(2)}`, 200, y + 14);
            
            // ✅ Draw color indicator
            doc.setFillColor(r, g, b);
            doc.setDrawColor(0, 0, 0);
            doc.rect(280, y + 4, 15, 10, "FD");
            
            y += 18;

            if (y > pageHeight - 200) {
              doc.addPage();
              y = 40;
            }
          });
          
        }

        // -------------------
        // Current Polygon Diagram/Picture
        // -------------------
        // ✅ Wait a bit for map to render before capturing
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        const dataUrl = mapRef.current?.getMapCanvasDataURL?.();
        if (dataUrl) {
          y += 15;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(14);
          doc.setTextColor(0, 0, 0);
          doc.text("Roof Map Diagram", pageWidth / 2, y, { align: "center" });
          
          y += 20;
          const imgWidth = 700;
          const imgHeight = 450;
          const x = (pageWidth - imgWidth) / 2;
          const mapY = y;
          
          // ✅ Add image with error handling
          try {
            doc.addImage(dataUrl, "PNG", x, mapY, imgWidth, imgHeight);
          } catch (imgErr) {
            console.warn("Error adding map image to PDF:", imgErr);
            doc.setFont("helvetica", "italic");
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text("Map diagram could not be generated", x, mapY + imgHeight / 2, { align: "center" });
          }
          
          // ✅ Add compass direction (N, S, E, W) based on map bearing
          const map = mapRef.current?.getMap?.();
          if (map) {
            try {
              const bearing = map.getBearing();
              // ✅ Normalize bearing to 0-360
              const normalizedBearing = ((bearing % 360) + 360) % 360;
              
              // ✅ Determine primary direction
              let compassDirection = "N";
              if (normalizedBearing >= 45 && normalizedBearing < 135) {
                compassDirection = "E";
              } else if (normalizedBearing >= 135 && normalizedBearing < 225) {
                compassDirection = "S";
              } else if (normalizedBearing >= 225 && normalizedBearing < 315) {
                compassDirection = "W";
              }
              
              // ✅ Draw compass indicator in top-right corner of map
              const compassX = x + imgWidth - 50;
              const compassY = mapY + 20;
              
              // ✅ Draw compass circle
              doc.setDrawColor(0, 0, 0);
              doc.setFillColor(255, 255, 255);
              doc.circle(compassX, compassY, 20, "FD");
              doc.setDrawColor(0, 0, 0);
              doc.circle(compassX, compassY, 20, "D");
              
              // ✅ Draw direction indicator
              doc.setFontSize(14);
              doc.setFont("helvetica", "bold");
              doc.setTextColor(0, 0, 0);
              doc.text(compassDirection, compassX, compassY + 5, { align: "center" });
              
              // ✅ Add small degree indicator
              doc.setFontSize(8);
              doc.setFont("helvetica", "normal");
              doc.text(`${Math.round(normalizedBearing)}°`, compassX, compassY + 15, { align: "center" });
            } catch (err) {
              console.warn("Error adding compass:", err);
            }
          }
        }
        
        // -------------------
        // Color Legend (if edges have types)
        // -------------------
        const edgeTypes = new Set(edgesState.map((e: any) => e.type).filter(Boolean));
        if (edgeTypes.size > 0) {
          const legendY = y + (dataUrl ? 420 : 20); // ✅ imgHeight = 400, so use 420 for spacing
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.text("Edge Types:", 20, legendY);
          
          // ✅ Edge type color mapping (matches left sidebar)
          const edgeTypeColors: Record<string, string> = {
            Ridge: "#e74c3c",
            Hip: "#f39c12",
            Valley: "#8e44ad",
            Rake: "#2980b9",
            Eave: "#27ae60",
            Flashing: "#16a085",
            "Step Flashing": "#d35400",
            Transition: "#2c3e50",
          };
          
          let legendX = 20;
          let legendRow = 0;
          edgeTypes.forEach((type: string) => {
            if (legendX > pageWidth - 150) {
              legendRow++;
              legendX = 20;
            }
            
            const color = edgeTypeColors[type] || "#000000";
            // ✅ Convert hex to RGB
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            
            // ✅ Draw color box
            doc.setFillColor(r, g, b);
            doc.setDrawColor(0, 0, 0);
            doc.rect(legendX, legendY + 5 + (legendRow * 15), 10, 10, "FD");
            
            // ✅ Draw type label
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(0, 0, 0);
            doc.text(type, legendX + 15, legendY + 12 + (legendRow * 15));
            
            legendX += 80;
          });
        }

        // -------------------
        // Total Summary at End
        // -------------------
        let totalY = y + (dataUrl ? 470 : 50); // After map image or after edges
        
        // ✅ Check if we need a new page
        if (totalY > pageHeight - 80) {
          doc.addPage();
          totalY = 40;
        }

        // ✅ Total summary box
        doc.setDrawColor(0, 0, 0);
        doc.setFillColor(240, 248, 255); // Light blue background
        doc.rect(20, totalY, pageWidth - 40, 60, "FD");
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("Total Summary", 30, totalY + 20);
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`Total Roof Area: ${roofAreaState.toFixed(2)} sq.ft`, 30, totalY + 40);
        doc.text(`Total Plan Area: ${planAreaState.toFixed(2)} sq.ft`, 30, totalY + 55);
        
        // ✅ Total length summary
        const totalEdgeLength = edgesState.reduce((sum: number, e: any) => sum + (e.length || 0), 0);
        const totalFormatted = toFeetInchesFormat(totalEdgeLength);
        doc.text(`Total Edge Length: ${totalFormatted} (${totalEdgeLength.toFixed(2)} ft)`, 300, totalY + 40);
        
        // ✅ Total polygons count (estimate from unique polygon IDs in edges)
        const uniquePolygonIds = new Set(edgesState.map((e: any) => e.polygonId || "").filter(Boolean));
        const polygonCount = uniquePolygonIds.size || Math.ceil(edgesState.length / 4); // Estimate if no polygonIds
        doc.text(`Total Polygons: ${polygonCount}`, 300, totalY + 55);

        // -------------------
        // Footer
        // -------------------
        doc.setFontSize(10);
        const pageNumber = (doc as any).internal?.pages?.length || 1;
        doc.text(
          `Generated by RoofPro Software | Page ${pageNumber}`,
          pageWidth / 2,
          pageHeight - 20,
          { align: "center" }
        );

        doc.save("roof-measurement.pdf");
      } catch (err) {
        console.warn("PDF generation error:", err);
        alert("Error while generating PDF. Check console for details.");
      }
    };

    // ✅ Expose methods to parent
    useImperativeHandle(ref, () => ({
      startDrawing: () => mapRef.current?.startDrawing(),
      startSingleDrawing: () => mapRef.current?.startSingleDrawing(),
      handleLabelSelect: (label: { name: string; color: string }) => mapRef.current?.handleLabelSelect?.(label),
      deleteAll: () => mapRef.current?.deleteAll(),
      setDrawMode: (mode: string) => mapRef.current?.setDrawMode(mode),
      undo: () => mapRef.current?.undo(),
      redo: () => mapRef.current?.redo(),
      toggleLabels: () => mapRef.current?.toggleLabels(),
      confirmLocation: (coords: [number, number]) =>
        mapRef.current?.confirmLocation(coords),
      searchAddress: (address: string) =>
        mapRef.current?.searchAddress(address),
      getMapCanvasDataURL: () => mapRef.current?.getMapCanvasDataURL(),
      rotateLeft: () => mapRef.current?.rotateLeft(),
      rotateRight: () => mapRef.current?.rotateRight(),
      toggleStreetView: () => mapRef.current?.toggleStreetView(),
      deleteSelected: () => mapRef.current?.deleteSelected(),
      downloadPDF,

      
    }));

    return (
      <div className="relative w-full h-full">
        <MapContainer
          ref={mapRef}
          onMeasurementsChange={handleMeasurementsChange}
          onGridToggle={(visible) => setShowGrid(visible)}
          selectedLabel={selectedLabel || undefined}
        />
        {showGrid && (
          <div
            className="absolute inset-0 z-40 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.29) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.22) 1px, transparent 1px)",
              backgroundSize: "100px 100px",
              backdropFilter: "brightness(0.9)",
            }}
          />
        )}
      </div>
    );
  }
);

RoofMapSection.displayName = "RoofMapSection";
export default RoofMapSection;
