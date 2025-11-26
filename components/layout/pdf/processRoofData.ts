// utils/processRoofData.ts

// turf library use karne ke liye import
import * as turf from "@turf/turf"; 

interface Edge {
  lengthFeet: number;
}

interface LineData {
  label?: string; 
  edges?: Edge[];
  coordinates: [number, number][]; // Fallback for calculation
}

// Final output data structure for GAF Summary
export interface GAFSummary {
  eaves: number;
  rakes: number;
  ridges: number;
  valleys: number;
  hips: number;
  bends: number;
  // Area components (for consistency)
  totalArea: number; 
  parapetArea: number; 
}

// Helper: Line feature ki total length feet mein nikalna
const getLineTotalLengthFeet = (line: LineData): number => {
    // Priority 1: Agar edges array mein lengthFeet pehle se calculated hai (jaise aapke data mein hai)
    if (line.edges && line.edges.length > 0) {
        return line.edges.reduce((sum, edge) => sum + edge.lengthFeet, 0);
    } 
    // Fallback: Agar edges nahi hain, toh coordinates se turf use karke calculate karein
    else if (line.coordinates && line.coordinates.length > 1) {
        const lengthMeters = turf.length(turf.lineString(line.coordinates), { units: "meters" });
        return lengthMeters * 3.28084; // meters to feet conversion
    }
    return 0;
};

// Main aggregation function
export const calculateGAFSummary = (
  lines: LineData[],
  totalArea: string,
  parapetArea: string, 
): GAFSummary => {
  const summary: GAFSummary = {
    eaves: 0,
    rakes: 0,
    ridges: 0,
    valleys: 0,
    hips: 0,
    bends: 0,
    totalArea: parseFloat(totalArea) || 0,
    parapetArea: parseFloat(parapetArea) || 0,
  };

  // Lines ko iterate karein aur unke label ke hisaab se total length sum karein
  lines.forEach((l) => {
    const label = l.label ? l.label.toLowerCase() : '';
    const lengthFeet = getLineTotalLengthFeet(l);

    // Ye logic aapke Mapbox Draw labels (Hip, Ridge, Valley, etc.) ko map karta hai.
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
  
  // Linear measurements ko 2 decimal places tak round off karein
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