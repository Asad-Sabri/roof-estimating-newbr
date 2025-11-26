// utils/calculateCombinedSummary.ts
import { LineData, PolygonData } from "./constants";

export interface GAFSummary {
  ridges: number;
  hips: number;
  valleys: number;
  rakes: number;
  eaves: number;
  flashings: number;
  stepFlashings: number;
}

export const calculateCombinedSummary = (
  lines: LineData[],
  polygons: PolygonData[]
): GAFSummary => {
  const summary: GAFSummary = {
    ridges: 0,
    hips: 0,
    valleys: 0,
    rakes: 0,
    eaves: 0,
    flashings: 0,
    stepFlashings: 0,
  };

  const addEdgeLength = (label: string | undefined, length: number) => {
    if (!label) return;
    const key = label.toLowerCase();
    switch (key) {
      case "ridge":
        summary.ridges += length;
        break;
      case "hip":
        summary.hips += length;
        break;
      case "valley":
        summary.valleys += length;
        break;
      case "rake":
        summary.rakes += length;
        break;
      case "eave":
        summary.eaves += length;
        break;
      case "flashing":
        summary.flashings += length;
        break;
      case "step flashing":
        summary.stepFlashings += length;
        break;
    }
  };

  // Lines
  lines.forEach((line) => {
    (line.edges || []).forEach((edge) => {
      addEdgeLength(line.label, edge.lengthFeet);
    });
  });

  // Polygons
  polygons.forEach((polygon) => {
    (polygon.edges || []).forEach((edge) => {
      addEdgeLength(polygon.label, edge.lengthFeet);
    });
  });

  return summary;
};
