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
      const map = mapRef.current?.getMap?.();
      if (!map) return;

      const handleEdgeClick = (
        e: mapboxgl.MapMouseEvent & mapboxgl.EventData
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

        const logoUrl = "./logo-roofpro.png";
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
        // Edges Table
        // -------------------
        let y = 200;
        if (edgesState.length > 0) {
          doc.setFont("helvetica", "bold");
          doc.setFillColor(100, 149, 237); // header color
          doc.setTextColor(255, 255, 255);
          doc.rect(20, y, pageWidth - 40, 20, "F");
          doc.text("Side", 30, y + 14);
          doc.text("Type", 100, y + 14);
          doc.text("Length (ft)", 200, y + 14);

          y += 20;
          doc.setFont("helvetica", "normal");
          doc.setTextColor(0, 0, 0);

          edgesState.forEach((e, i) => {
            doc.rect(20, y, pageWidth - 40, 18); // row border
            doc.text(`${i + 1}`, 30, y + 14);
            doc.text(`${e.type || "Unlabeled"}`, 100, y + 14);
            doc.text(`${e.length.toFixed(2)}`, 200, y + 14);
            y += 18;

            if (y > pageHeight - 120) {
              doc.addPage();
              y = 40;
            }
          });
        }

        // -------------------
        // Map Image
        // -------------------
        const dataUrl = mapRef.current?.getMapCanvasDataURL?.();
        if (dataUrl) {
          const imgWidth = 600;
          const imgHeight = 400;
          const x = (pageWidth - imgWidth) / 2;
          doc.addImage(dataUrl, "PNG", x, y + 20, imgWidth, imgHeight);
        }

        // -------------------
        // Footer
        // -------------------
        doc.setFontSize(10);
        doc.text(
          `Generated by RoofPro Software | Page 1`,
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
      deleteAll: () => mapRef.current?.deleteAll(),
      setDrawMode: (mode: string) => mapRef.current?.setDrawMode(mode),
      undo: () => mapRef.current?.undo(),
      redo: () => mapRef.current?.redo(),
      startSplitMode: () => mapRef.current?.startSplitMode(),
      applyOverhang: () => mapRef.current?.applyOverhang(),
      confirmLocation: (coords: [number, number]) =>
        mapRef.current?.confirmLocation(coords),
      searchAddress: (address: string) =>
        mapRef.current?.searchAddress(address),
      getMapCanvasDataURL: () => mapRef.current?.getMapCanvasDataURL(),
      rotateLeft: () => mapRef.current?.rotateLeft(),
      rotateRight: () => mapRef.current?.rotateRight(),
      toggleStreetView: () => mapRef.current?.toggleStreetView(),
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
