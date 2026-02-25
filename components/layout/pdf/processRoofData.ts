// utils/processRoofData.ts

import * as turf from "@turf/turf";

interface Edge {
  lengthFeet: number;
}

interface LineData {
  label?: string;
  edges?: Edge[];
  coordinates: [number, number][];
}

export interface GAFSummary {
  dominantPitch: any;
  facetCount: number;
  eaves: number;
  rakes: number;
  ridges: number;
  valleys: number;
  hips: number;
  bends: number;
  flashings: number;
  stepFlashings: number;
  totalArea: number;
  parapetArea: number;
}

const getLineTotalLengthFeet = (line: LineData): number => {
  if (line.edges && line.edges.length > 0) {
    return line.edges.reduce((sum, edge) => sum + edge.lengthFeet, 0);
  }
  else if (line.coordinates && line.coordinates.length > 1) {
    const lengthMeters = turf.length(turf.lineString(line.coordinates), { units: "meters" });
    return lengthMeters * 3.28084;
  }
  return 0;
};

export const calculateGAFSummary = (
  lines: LineData[],
  totalArea: string,
  parapetArea: string,
): GAFSummary => {
  const summary: GAFSummary = {
    dominantPitch: undefined,
    facetCount: 0,
    eaves: 0,
    rakes: 0,
    ridges: 0,
    valleys: 0,
    hips: 0,
    flashings: 0,
    stepFlashings: 0,
    bends: 0,
    totalArea: parseFloat(totalArea) || 0,
    parapetArea: parseFloat(parapetArea) || 0,
  };

  lines.forEach((l) => {
    const label = l.label ? l.label.toLowerCase() : '';
    const lengthFeet = getLineTotalLengthFeet(l);

    if (label.includes("eave")) {
      summary.eaves += lengthFeet;
    } else if (label.includes("rake")) {
      summary.rakes += lengthFeet;
    } else if (label.includes("ridge")) {
      summary.ridges += lengthFeet;
    } else if (label.includes("valley")) {
      summary.valleys += lengthFeet;
    } else if (label.includes("hip")) {
      summary.hips += lengthFeet;
    } else if (label.includes("bend")) {
      summary.bends += lengthFeet;
    }
  });

  const finalSummary = Object.fromEntries(
    Object.entries(summary).map(([key, value]) => [
      key,
      (typeof value === 'number' && key !== 'totalArea' && key !== 'parapetArea')
        ? parseFloat(value.toFixed(2))
        : value,
    ])
  ) as GAFSummary;

  return finalSummary;
};