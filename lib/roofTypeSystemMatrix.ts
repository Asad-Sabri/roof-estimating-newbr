/**
 * Phase 1: Roof Type → Roof System compatibility.
 * Prevents invalid pairings (e.g. Flat + Asphalt Shingles).
 * Ref: Delivery Requirements Outline Section 3.2.B
 */

export type RoofTypeCategory = "flat" | "steep" | "tile" | "metal";

export const ROOF_TYPE_CATEGORIES: { value: RoofTypeCategory; label: string }[] = [
  { value: "flat", label: "Flat / Low-Slope" },
  { value: "steep", label: "Steep-Slope Residential" },
  { value: "tile", label: "Tile (Residential)" },
  { value: "metal", label: "Metal (Res. / Comm.)" },
];

/** System values used in request-estimate (dropdown value sent to API) */
export const ROOF_SYSTEMS_BY_CATEGORY: Record<RoofTypeCategory, { value: string; label: string }[]> = {
  flat: [
    { value: "TPO", label: "TPO" },
    { value: "EPDM", label: "EPDM" },
    { value: "BUR", label: "Built-Up (BUR)" },
    { value: "PVC", label: "PVC" },
    { value: "modified_bitumen", label: "Modified Bitumen" },
  ],
  steep: [
    { value: "shingle", label: "Asphalt Shingles" },
    { value: "metal", label: "Metal" },
    { value: "Cedar", label: "Wood Shake" },
    { value: "Synthetic", label: "Synthetic" },
  ],
  tile: [
    { value: "tile", label: "Clay / Concrete Tile" },
    { value: "Synthetic Tile", label: "Synthetic Tile" },
  ],
  metal: [
    { value: "metal", label: "Standing Seam / Metal Shingles / Corrugated" },
  ],
};

/** All unique system values (for backward compat / full list) */
export const ALL_ROOF_SYSTEM_VALUES = Array.from(
  new Set(
    (Object.values(ROOF_SYSTEMS_BY_CATEGORY) as { value: string }[][]).flat().map((s) => s.value)
  )
);

export function getCompatibleSystems(category: RoofTypeCategory | ""): { value: string; label: string }[] {
  if (!category) return [];
  return ROOF_SYSTEMS_BY_CATEGORY[category as RoofTypeCategory] ?? [];
}

/** Which category a system belongs to (for filtering in estimating steps) */
export const SYSTEM_TO_CATEGORY: Record<string, RoofTypeCategory> = {
  TPO: "flat",
  EPDM: "flat",
  BUR: "flat",
  PVC: "flat",
  modified_bitumen: "flat",
  Asphalt: "steep",
  Metal: "steep",
  Cedar: "steep",
  Synthetic: "steep",
  shingle: "steep",
  metal: "steep",
  Tile: "tile",
  tile: "tile",
  "Synthetic Tile": "tile",
};

/** Estimating modal options (Step5/Step6): value matches existing options */
export const ESTIMATING_SYSTEMS_BY_CATEGORY: Record<RoofTypeCategory, { value: string; label: string; image?: string }[]> = {
  flat: [
    { value: "BUR", label: "BUR (Built-Up Roofing)", image: "https://pmsilicone.com/wp-content/uploads/2023/04/BUR1-1536x1098.jpg" },
    { value: "PVC", label: "PVC", image: "https://www.billraganroofing.com/hubfs/FlatRoofPVC.jpg" },
    { value: "TPO", label: "TPO", image: "https://pmsilicone.com/wp-content/uploads/2022/11/TPO-Roof-768x576.jpg" },
    { value: "EPDM", label: "EPDM", image: "https://colonyroofers.com/hs-fs/hubfs/EPDM%20Roofing%20Material.jpg?width=1350&height=600&name=EPDM%20Roofing%20Material.jpg" },
  ],
  steep: [
    { value: "Asphalt", label: "Asphalt", image: "https://app.roofr.com/images/instant-estimates/materials/asphalt.jpg" },
    { value: "Metal", label: "Metal", image: "https://app.roofr.com/images/instant-estimates/materials/metal.jpg" },
    { value: "Cedar", label: "Cedar", image: "https://app.roofr.com/images/instant-estimates/materials/cedar.jpg" },
  ],
  tile: [
    { value: "Tile", label: "Tile", image: "https://app.roofr.com/images/instant-estimates/materials/tile.jpg" },
  ],
  metal: [
    { value: "Metal", label: "Metal", image: "https://app.roofr.com/images/instant-estimates/materials/metal.jpg" },
  ],
};

export function getEstimatingSystemsForCategory(category: RoofTypeCategory | ""): { value: string; label: string; image?: string }[] {
  if (!category) return [];
  return ESTIMATING_SYSTEMS_BY_CATEGORY[category as RoofTypeCategory] ?? [];
}
