// calculateMaterials.ts

import { GAFSummary } from "./processRoofData";

export interface MaterialQuantities {
  shingles: number;
  starter: number;
  ridgeCap: number;
  underlayment: number;
}

const SQ_FT_PER_SHINGLE_BUNDLE = 32.8;
const SQ_FT_PER_UNDERLAYMENT_SQUARE = 100;

export const calculateMaterialQuantities = (
  summary: GAFSummary,
  totalAreaSqFt: number
): MaterialQuantities => {
  const starterLength = summary.eaves + summary.rakes;
  const ridgeCapLength = summary.ridges;

  const shinglesBundles = totalAreaSqFt / SQ_FT_PER_SHINGLE_BUNDLE;

  const starter = starterLength;
  const ridgeCap = ridgeCapLength;

  const underlaymentSquares = totalAreaSqFt / SQ_FT_PER_UNDERLAYMENT_SQUARE;

  return {
    shingles: Math.ceil(shinglesBundles),
    starter: Math.ceil(starter),
    ridgeCap: Math.ceil(ridgeCap),
    underlayment: Math.ceil(underlaymentSquares),
  };
};
