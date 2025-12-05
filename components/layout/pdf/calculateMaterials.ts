// components\layout\pdf\calculateMaterials.ts

import { GAFSummary } from "./processRoofData";

const WASTAGE_PERCENTAGES = [0, 0.08, 0.13, 0.18]; // 0%, 8%, 13%, 18%

// Coverage Rates (Units per Linear Foot (LF) or Square Foot (SF))
const SQ_FT_PER_SHINGLE_BUNDLE = 33.33; // ~3 bundles per square
const LF_PER_STARTER_BUNDLE = 100;      // Example LF/Bundle
const LF_PER_RIDGE_CAP_BUNDLE = 30;     // Example LF/Bundle
const SQ_FT_PER_UNDERLAYMENT_ROLL = 400; // Example 4-square roll
const LF_PER_DRIP_EDGE_PIECE = 10;      // Standard 10ft piece
const SQ_FT_PER_LEAK_BARRIER_ROLL = 200; // Example 2-square roll

export interface MaterialQuantity {
    q0: number; 
    q8: number; 
    q13: number;
    q18: number;
}

export interface MaterialQuantities {
    shingles: MaterialQuantity;
    starter: MaterialQuantity;
    ridgeCap: MaterialQuantity;
    underlayment: MaterialQuantity;
    dripEdge: MaterialQuantity;
    leakBarrier: MaterialQuantity;
}

const calculateQuantities = (basicQuantity: number): MaterialQuantity => {
    const quantities: any = {};
    
    // Math.ceil har calculation ke baad zaroori hai
    quantities.q0 = Math.ceil(basicQuantity * (1 + WASTAGE_PERCENTAGES[0]));
    quantities.q8 = Math.ceil(basicQuantity * (1 + WASTAGE_PERCENTAGES[1]));
    quantities.q13 = Math.ceil(basicQuantity * (1 + WASTAGE_PERCENTAGES[2]));
    quantities.q18 = Math.ceil(basicQuantity * (1 + WASTAGE_PERCENTAGES[3]));

    return quantities as MaterialQuantity;
};

export const calculateMaterialQuantities = (
    summary: GAFSummary,
    totalAreaSqFt: number // Net area of the roof
): MaterialQuantities => {
    // Inputs (from GAFSummary, which is derived from Mapbox Draw lines)
    const totalEaveRakeLength = summary.eaves + summary.rakes;
    const ridgeHipLength = summary.ridges + summary.hips;
    
    // Leak Barrier normally covers eaves, valleys, and some flashing areas.
    // Assuming a simple calculation based on eaves + valleys for this example.
    const leakBarrierLength = summary.eaves + summary.valleys; 
    
    // --- Basic Quantities (Q_basic = 0% waste before ceiling) ---

    // A. Shingles (Bundles)
    const basicShingleBundles = totalAreaSqFt / SQ_FT_PER_SHINGLE_BUNDLE;

    // B. Underlayment (Rolls) - Area based
    const basicUnderlaymentRolls = totalAreaSqFt / SQ_FT_PER_UNDERLAYMENT_ROLL;

    // C. Starter (Bundles) - Length based (Eaves + Rakes)
    const basicStarterUnits = totalEaveRakeLength / LF_PER_STARTER_BUNDLE;

    // D. Ridge Cap (Bundles) - Length based (Ridges + Hips)
    const basicRidgeCapUnits = ridgeHipLength / LF_PER_RIDGE_CAP_BUNDLE;

    // E. Drip Edge (Pieces) - Length based (Eaves + Rakes)
    const basicDripEdgePieces = totalEaveRakeLength / LF_PER_DRIP_EDGE_PIECE;
    
    // F. Leak Barrier (Rolls) - Area/Length based
    const basicLeakBarrierRolls = leakBarrierLength / (SQ_FT_PER_LEAK_BARRIER_ROLL / 10); // Simple LF approximation

    // --- Final Calculated Quantities (with Wastage) ---
    return {
        shingles: calculateQuantities(basicShingleBundles),
        starter: calculateQuantities(basicStarterUnits),
        ridgeCap: calculateQuantities(basicRidgeCapUnits),
        underlayment: calculateQuantities(basicUnderlaymentRolls),
        dripEdge: calculateQuantities(basicDripEdgePieces),
        leakBarrier: calculateQuantities(basicLeakBarrierRolls),
    };
};