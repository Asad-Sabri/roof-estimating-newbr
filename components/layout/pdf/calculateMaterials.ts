// calculateMaterials.ts

import { GAFSummary } from "./processRoofData";

// Define the structure for material output
export interface MaterialQuantities {
  shingles: number; // in Bundles (assuming Timberline)
  starter: number; // in Feet
  ridgeCap: number; // in Feet
  underlayment: number; // in Squares (or Rolls)
}

// 📌 Assumptions (GAF Timberline HDZ):
// 1. Shingle Coverage: 3 bundles = 0.984 squares, so 1 bundle ≈ 32.8 sq ft
const SQ_FT_PER_SHINGLE_BUNDLE = 32.8; 
// 2. Underlayment Coverage: 1 square (100 sq ft) per unit (e.g., FeltBuster roll)
const SQ_FT_PER_UNDERLAYMENT_SQUARE = 100;

export const calculateMaterialQuantities = (summary: GAFSummary, totalAreaSqFt: number): MaterialQuantities => {
  
  // Formulas based on GAF Report Notes:
  const starterLength = summary.eaves + summary.rakes;
  const ridgeCapLength = summary.ridges; // Simplified: Assuming 'ridges' covers all hip/ridge measurements

  // 1. Shingles: Calculate bundles required
  // Note: We use the Total Area (Polygons) which is more accurate for shingles.
  // totalAreaSqFt is the roof area measurement (e.g., 4952 sq ft)
  const shinglesBundles = totalAreaSqFt / SQ_FT_PER_SHINGLE_BUNDLE;
  
  // 2. Starter and Ridge Cap: Simply use the calculated lengths
  // Note: Production-level code would round up to the nearest package/roll size.
  const starter = starterLength;
  const ridgeCap = ridgeCapLength;

  // 3. Underlayment (FeltBuster/Tiger Paw): Coverage is 100 sq ft = 1 Square
  // Note: We calculate the minimum squares required, production code adds waste factor.
  const underlaymentSquares = totalAreaSqFt / SQ_FT_PER_UNDERLAYMENT_SQUARE;

  return {
    shingles: Math.ceil(shinglesBundles), // Always round up to full bundle
    starter: Math.ceil(starter), // Round up to nearest foot (for simplicity)
    ridgeCap: Math.ceil(ridgeCap), // Round up to nearest foot (for simplicity)
    underlayment: Math.ceil(underlaymentSquares), // Round up to full square/roll
  };
};

// 💡 Yaad rakhein: Shingles ke bundles *hamesha* total area ko cover karne chahiye.