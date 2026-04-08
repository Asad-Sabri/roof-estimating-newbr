"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, Save, Edit2, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import SubscriberLayout from "@/components/layout/SubscriberLayout";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";

type PitchType = "flat" | "low" | "medium" | "steep" | "very_steep";

type MaterialPitchPricing = {
  pitch: PitchType;
  basePricePerSqFt: number;
  repairPricePerSqFt: number;
  maintenancePricePerSqFt: number;
  isCompatible: boolean;
};

type PricingItem = {
  id: string;
  material: string;
  // Default base pricing (for reference)
  basePricePerSqFt: number;
  maxPricePerSqFt: number;
  enabled: boolean;
  // Pitch-specific pricing
  pitchPricing: MaterialPitchPricing[];
};

const pitchTypes: PitchType[] = ["flat", "low", "medium", "steep", "very_steep"];
const pitchLabels: Record<PitchType, string> = {
  flat: "Flat",
  low: "Low",
  medium: "Medium",
  steep: "Steep",
  very_steep: "Very Steep",
};

// Initial pricing with pitch modifiers and compatibility
const initialPricing: PricingItem[] = [
  {
    id: "1",
    material: "Asphalt",
    basePricePerSqFt: 3.50,
    maxPricePerSqFt: 7.00,
    enabled: true,
    pitchPricing: [
      { pitch: "flat", basePricePerSqFt: 0, repairPricePerSqFt: 1.50, maintenancePricePerSqFt: 1.00, isCompatible: false },
      { pitch: "low", basePricePerSqFt: 3.50, repairPricePerSqFt: 1.50, maintenancePricePerSqFt: 1.00, isCompatible: true },
      { pitch: "medium", basePricePerSqFt: 4.50, repairPricePerSqFt: 1.75, maintenancePricePerSqFt: 1.25, isCompatible: true },
      { pitch: "steep", basePricePerSqFt: 5.50, repairPricePerSqFt: 2.00, maintenancePricePerSqFt: 1.50, isCompatible: true },
      { pitch: "very_steep", basePricePerSqFt: 7.00, repairPricePerSqFt: 2.25, maintenancePricePerSqFt: 1.75, isCompatible: true },
    ],
  },
  {
    id: "2",
    material: "Metal",
    basePricePerSqFt: 8.00,
    maxPricePerSqFt: 15.00,
    enabled: true,
    pitchPricing: [
      { pitch: "flat", basePricePerSqFt: 8.00, repairPricePerSqFt: 2.50, maintenancePricePerSqFt: 2.00, isCompatible: true },
      { pitch: "low", basePricePerSqFt: 9.00, repairPricePerSqFt: 2.75, maintenancePricePerSqFt: 2.25, isCompatible: true },
      { pitch: "medium", basePricePerSqFt: 11.00, repairPricePerSqFt: 3.00, maintenancePricePerSqFt: 2.50, isCompatible: true },
      { pitch: "steep", basePricePerSqFt: 13.00, repairPricePerSqFt: 3.50, maintenancePricePerSqFt: 3.00, isCompatible: true },
      { pitch: "very_steep", basePricePerSqFt: 15.00, repairPricePerSqFt: 4.00, maintenancePricePerSqFt: 3.50, isCompatible: true },
    ],
  },
  {
    id: "3",
    material: "Tile",
    basePricePerSqFt: 10.00,
    maxPricePerSqFt: 18.00,
    enabled: true,
    pitchPricing: [
      { pitch: "flat", basePricePerSqFt: 0, repairPricePerSqFt: 3.00, maintenancePricePerSqFt: 2.50, isCompatible: false },
      { pitch: "low", basePricePerSqFt: 10.00, repairPricePerSqFt: 3.00, maintenancePricePerSqFt: 2.50, isCompatible: true },
      { pitch: "medium", basePricePerSqFt: 12.00, repairPricePerSqFt: 3.50, maintenancePricePerSqFt: 3.00, isCompatible: true },
      { pitch: "steep", basePricePerSqFt: 15.00, repairPricePerSqFt: 4.00, maintenancePricePerSqFt: 3.50, isCompatible: true },
      { pitch: "very_steep", basePricePerSqFt: 18.00, repairPricePerSqFt: 4.50, maintenancePricePerSqFt: 4.00, isCompatible: true },
    ],
  },
  {
    id: "4",
    material: "Cedar",
    basePricePerSqFt: 6.00,
    maxPricePerSqFt: 12.00,
    enabled: true,
    pitchPricing: [
      { pitch: "flat", basePricePerSqFt: 0, repairPricePerSqFt: 0, maintenancePricePerSqFt: 0, isCompatible: false }, // NOT ALLOWED
      { pitch: "low", basePricePerSqFt: 6.00, repairPricePerSqFt: 2.00, maintenancePricePerSqFt: 1.75, isCompatible: true },
      { pitch: "medium", basePricePerSqFt: 8.00, repairPricePerSqFt: 2.50, maintenancePricePerSqFt: 2.00, isCompatible: true },
      { pitch: "steep", basePricePerSqFt: 10.00, repairPricePerSqFt: 3.00, maintenancePricePerSqFt: 2.50, isCompatible: true },
      { pitch: "very_steep", basePricePerSqFt: 12.00, repairPricePerSqFt: 3.50, maintenancePricePerSqFt: 3.00, isCompatible: true },
    ],
  },
  {
    id: "5",
    material: "BUR",
    basePricePerSqFt: 4.00,
    maxPricePerSqFt: 8.00,
    enabled: true,
    pitchPricing: [
      { pitch: "flat", basePricePerSqFt: 4.00, repairPricePerSqFt: 1.50, maintenancePricePerSqFt: 1.25, isCompatible: true },
      { pitch: "low", basePricePerSqFt: 4.50, repairPricePerSqFt: 1.75, maintenancePricePerSqFt: 1.50, isCompatible: true },
      { pitch: "medium", basePricePerSqFt: 5.50, repairPricePerSqFt: 2.00, maintenancePricePerSqFt: 1.75, isCompatible: true },
      { pitch: "steep", basePricePerSqFt: 7.00, repairPricePerSqFt: 2.25, maintenancePricePerSqFt: 2.00, isCompatible: true },
      { pitch: "very_steep", basePricePerSqFt: 8.00, repairPricePerSqFt: 2.50, maintenancePricePerSqFt: 2.25, isCompatible: true },
    ],
  },
  {
    id: "6",
    material: "PVC",
    basePricePerSqFt: 5.00,
    maxPricePerSqFt: 10.00,
    enabled: true,
    pitchPricing: [
      { pitch: "flat", basePricePerSqFt: 5.00, repairPricePerSqFt: 2.00, maintenancePricePerSqFt: 1.75, isCompatible: true },
      { pitch: "low", basePricePerSqFt: 5.50, repairPricePerSqFt: 2.25, maintenancePricePerSqFt: 2.00, isCompatible: true },
      { pitch: "medium", basePricePerSqFt: 7.00, repairPricePerSqFt: 2.50, maintenancePricePerSqFt: 2.25, isCompatible: true },
      { pitch: "steep", basePricePerSqFt: 8.50, repairPricePerSqFt: 3.00, maintenancePricePerSqFt: 2.75, isCompatible: true },
      { pitch: "very_steep", basePricePerSqFt: 10.00, repairPricePerSqFt: 3.50, maintenancePricePerSqFt: 3.00, isCompatible: true },
    ],
  },
  {
    id: "7",
    material: "TPO",
    basePricePerSqFt: 4.50,
    maxPricePerSqFt: 9.00,
    enabled: true,
    pitchPricing: [
      { pitch: "flat", basePricePerSqFt: 4.50, repairPricePerSqFt: 1.75, maintenancePricePerSqFt: 1.50, isCompatible: true },
      { pitch: "low", basePricePerSqFt: 5.00, repairPricePerSqFt: 2.00, maintenancePricePerSqFt: 1.75, isCompatible: true },
      { pitch: "medium", basePricePerSqFt: 6.50, repairPricePerSqFt: 2.25, maintenancePricePerSqFt: 2.00, isCompatible: true },
      { pitch: "steep", basePricePerSqFt: 8.00, repairPricePerSqFt: 2.75, maintenancePricePerSqFt: 2.50, isCompatible: true },
      { pitch: "very_steep", basePricePerSqFt: 9.00, repairPricePerSqFt: 3.00, maintenancePricePerSqFt: 2.75, isCompatible: true },
    ],
  },
  {
    id: "8",
    material: "EPDM",
    basePricePerSqFt: 4.00,
    maxPricePerSqFt: 8.50,
    enabled: true,
    pitchPricing: [
      { pitch: "flat", basePricePerSqFt: 4.00, repairPricePerSqFt: 1.50, maintenancePricePerSqFt: 1.25, isCompatible: true },
      { pitch: "low", basePricePerSqFt: 4.50, repairPricePerSqFt: 1.75, maintenancePricePerSqFt: 1.50, isCompatible: true },
      { pitch: "medium", basePricePerSqFt: 6.00, repairPricePerSqFt: 2.00, maintenancePricePerSqFt: 1.75, isCompatible: true },
      { pitch: "steep", basePricePerSqFt: 7.50, repairPricePerSqFt: 2.50, maintenancePricePerSqFt: 2.25, isCompatible: true },
      { pitch: "very_steep", basePricePerSqFt: 8.50, repairPricePerSqFt: 3.00, maintenancePricePerSqFt: 2.75, isCompatible: true },
    ],
  },
];

export default function EstimatingPricingPage() {
  useProtectedRoute();
  const [pricing, setPricing] = useState<PricingItem[]>(initialPricing);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isEditing, setIsEditing] = useState<{ materialId: string; pitch?: PitchType } | null>(null);
  const [tempValues, setTempValues] = useState<{ base?: number; repair?: number; maintenance?: number; isCompatible?: boolean } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load saved pricing from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("estimating_pricing");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setPricing(parsed);
        } catch (e) {
          console.error("Error loading pricing:", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    // Save pricing to localStorage whenever it changes
    if (typeof window !== "undefined" && pricing.length > 0) {
      localStorage.setItem("estimating_pricing", JSON.stringify(pricing));
    }
  }, [pricing]);

  const toggleRow = (materialId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(materialId)) {
        newSet.delete(materialId);
      } else {
        newSet.add(materialId);
      }
      return newSet;
    });
  };

  const handleEditPitch = (materialId: string, pitch: PitchType) => {
    const material = pricing.find((p) => p.id === materialId);
    const pitchPricing = material?.pitchPricing.find((p) => p.pitch === pitch);
    if (pitchPricing) {
      setIsEditing({ materialId, pitch });
      setTempValues({
        base: pitchPricing.basePricePerSqFt,
        repair: pitchPricing.repairPricePerSqFt,
        maintenance: pitchPricing.maintenancePricePerSqFt,
        isCompatible: pitchPricing.isCompatible,
      });
    }
  };

  const handleSavePitch = (materialId: string, pitch: PitchType) => {
    if (tempValues) {
      setPricing((prev) =>
        prev.map((material) =>
          material.id === materialId
            ? {
                ...material,
                pitchPricing: material.pitchPricing.map((p) =>
                  p.pitch === pitch
                    ? {
                        ...p,
                        basePricePerSqFt: tempValues.base ?? p.basePricePerSqFt,
                        repairPricePerSqFt: tempValues.repair ?? p.repairPricePerSqFt,
                        maintenancePricePerSqFt: tempValues.maintenance ?? p.maintenancePricePerSqFt,
                        isCompatible: tempValues.isCompatible ?? p.isCompatible,
                      }
                    : p
                ),
              }
            : material
        )
      );
      setIsEditing(null);
      setTempValues(null);
      setHasChanges(true);
    }
  };

  const handleToggleCompatibility = (materialId: string, pitch: PitchType) => {
    setPricing((prev) =>
      prev.map((material) =>
        material.id === materialId
          ? {
              ...material,
              pitchPricing: material.pitchPricing.map((p) =>
                p.pitch === pitch
                  ? { ...p, isCompatible: !p.isCompatible }
                  : p
              ),
            }
          : material
      )
    );
    setHasChanges(true);
  };

  const handleToggleMaterial = (id: string) => {
    setPricing((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
    setHasChanges(true);
  };

  const handleSaveAll = () => {
    // Here you would typically make an API call to save pricing
    console.log("Saving pricing:", pricing);
    alert("Pricing saved successfully!");
    setHasChanges(false);
  };

  return (
    <SubscriberLayout>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-gray-900"
      >
        {/* Header */}
        <header className="text-black bg-gray-200 py-5 px-2 md:px-6 flex md:items-center justify-between">
          <h1 className="md:text-2xl font-bold flex items-center gap-2">
            <DollarSign size={28} />
            Estimating Pricing
          </h1>
          {hasChanges && (
            <button
              onClick={handleSaveAll}
              className="flex items-center gap-2 bg-white text-white px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition"
              style={{ color: "#8b0e0f" }}
            >
              <Save size={18} />
              Save All Changes
            </button>
          )}
        </header>

        {/* Description */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6 mx-2 md:mx-6">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Pricing Structure:</strong> Configure base pricing per square foot by material, with pitch modifiers and separate repair/maintenance pricing.
          </p>
          <p className="text-sm text-gray-700">
            <strong>Compatibility:</strong> Set material-pitch compatibility (e.g., Cedar/Shingle on flat roofs = NOT ALLOWED).
          </p>
        </div>

        {/* Pricing Table */}
        <section className="my-8 mx-2 md:mx-6">
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="w-full border border-gray-300 rounded-lg text-sm min-w-[1200px]">
              <thead className="text-white rounded-t-lg" style={{ backgroundColor: "#8b0e0f" }}>
                <tr>
                  <th className="p-4 text-left font-bold w-32">Material</th>
                  <th className="p-4 text-left font-bold w-24">Status</th>
                  <th className="p-4 text-left font-bold">Pitch Pricing</th>
                  <th className="p-4 text-left font-bold w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pricing.map((item) => {
                  const isExpanded = expandedRows.has(item.id);
                  return (
                    <React.Fragment key={item.id}>
                      {/* Main Material Row */}
                      <tr className="border-t border-gray-300 hover:bg-gray-50 transition">
                        <td className="p-4 font-medium">{item.material}</td>
                        <td className="p-4">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.enabled}
                              onChange={() => handleToggleMaterial(item.id)}
                              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                            />
                            <span className={`ml-2 text-sm ${item.enabled ? "text-green-600" : "text-gray-400"}`}>
                              {item.enabled ? "Enabled" : "Disabled"}
                            </span>
                          </label>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-gray-600">
                              {item.pitchPricing.filter((p) => p.isCompatible).length} of {item.pitchPricing.length} pitches compatible
                            </span>
                            <button
                              onClick={() => toggleRow(item.id)}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp size={16} />
                                  Hide Details
                                </>
                              ) : (
                                <>
                                  <ChevronDown size={16} />
                                  Show Details
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => toggleRow(item.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            {isExpanded ? "Collapse" : "Expand"}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Pitch Pricing Rows */}
                      {isExpanded && (
                        <>
                          <tr className="bg-gray-50">
                            <td colSpan={4} className="p-4">
                              <div className="space-y-4">
                                <h4 className="font-semibold text-gray-900 mb-3">Pitch-Specific Pricing</h4>
                                <div className="overflow-x-auto">
                                  <table className="w-full border border-gray-200 rounded">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium">Pitch</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium">Base Price ($/sqft)</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium">Repair Price ($/sqft)</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium">Maintenance ($/sqft)</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium">Compatible</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {item.pitchPricing.map((pitchPrice) => {
                                        const isEditingPitch = isEditing?.materialId === item.id && isEditing?.pitch === pitchPrice.pitch;
                                        return (
                                          <tr
                                            key={pitchPrice.pitch}
                                            className={`border-t border-gray-200 ${!pitchPrice.isCompatible ? "bg-red-50" : ""}`}
                                          >
                                            <td className="px-4 py-2 font-medium">
                                              {pitchLabels[pitchPrice.pitch]}
                                              {!pitchPrice.isCompatible && (
                                                <AlertCircle className="inline-block ml-2 text-red-600" size={16} />
                                              )}
                                            </td>
                                            <td className="px-4 py-2">
                                              {isEditingPitch ? (
                                                <input
                                                  type="number"
                                                  step="0.01"
                                                  min="0"
                                                  value={tempValues?.base ?? 0}
                                                  onChange={(e) =>
                                                    setTempValues({
                                                      ...tempValues!,
                                                      base: parseFloat(e.target.value) || 0,
                                                    })
                                                  }
                                                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                  disabled={!pitchPrice.isCompatible}
                                                />
                                              ) : (
                                                <span className={!pitchPrice.isCompatible ? "text-gray-400" : ""}>
                                                  ${pitchPrice.basePricePerSqFt.toFixed(2)}
                                                </span>
                                              )}
                                            </td>
                                            <td className="px-4 py-2">
                                              {isEditingPitch ? (
                                                <input
                                                  type="number"
                                                  step="0.01"
                                                  min="0"
                                                  value={tempValues?.repair ?? 0}
                                                  onChange={(e) =>
                                                    setTempValues({
                                                      ...tempValues!,
                                                      repair: parseFloat(e.target.value) || 0,
                                                    })
                                                  }
                                                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                  disabled={!pitchPrice.isCompatible}
                                                />
                                              ) : (
                                                <span className={!pitchPrice.isCompatible ? "text-gray-400" : ""}>
                                                  ${pitchPrice.repairPricePerSqFt.toFixed(2)}
                                                </span>
                                              )}
                                            </td>
                                            <td className="px-4 py-2">
                                              {isEditingPitch ? (
                                                <input
                                                  type="number"
                                                  step="0.01"
                                                  min="0"
                                                  value={tempValues?.maintenance ?? 0}
                                                  onChange={(e) =>
                                                    setTempValues({
                                                      ...tempValues!,
                                                      maintenance: parseFloat(e.target.value) || 0,
                                                    })
                                                  }
                                                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                  disabled={!pitchPrice.isCompatible}
                                                />
                                              ) : (
                                                <span className={!pitchPrice.isCompatible ? "text-gray-400" : ""}>
                                                  ${pitchPrice.maintenancePricePerSqFt.toFixed(2)}
                                                </span>
                                              )}
                                            </td>
                                            <td className="px-4 py-2">
                                              <label className="flex items-center cursor-pointer">
                                                <input
                                                  type="checkbox"
                                                  checked={pitchPrice.isCompatible}
                                                  onChange={() => handleToggleCompatibility(item.id, pitchPrice.pitch)}
                                                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                                />
                                                <span className={`ml-2 text-xs ${pitchPrice.isCompatible ? "text-green-600" : "text-red-600"}`}>
                                                  {pitchPrice.isCompatible ? "Yes" : "No"}
                                                </span>
                                              </label>
                                            </td>
                                            <td className="px-4 py-2">
                                              {isEditingPitch ? (
                                                <div className="flex gap-2">
                                                  <button
                                                    onClick={() => handleSavePitch(item.id, pitchPrice.pitch)}
                                                    className="px-2 py-1 text-xs text-white rounded transition"
                                                    style={{ backgroundColor: "#8b0e0f" }}
                                                  >
                                                    Save
                                                  </button>
                                                  <button
                                                    onClick={() => {
                                                      setIsEditing(null);
                                                      setTempValues(null);
                                                    }}
                                                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                                                  >
                                                    Cancel
                                                  </button>
                                                </div>
                                              ) : (
                                                <button
                                                  onClick={() => handleEditPitch(item.id, pitchPrice.pitch)}
                                                  className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                                                >
                                                  <Edit2 size={12} />
                                                  Edit
                                                </button>
                                              )}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        </>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Info Section */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">How it works:</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li><strong>Base Price:</strong> Per square foot pricing for installation by material and pitch</li>
              <li><strong>Repair Price:</strong> Separate pricing for repair work per material-pitch combination</li>
              <li><strong>Maintenance Price:</strong> Separate pricing for maintenance work per material-pitch combination</li>
              <li><strong>Compatibility:</strong> Mark incompatible combinations (e.g., Cedar/Shingle on flat roofs) - these won&apos;t appear to customers</li>
              <li><strong>Pitch Modifiers:</strong> Different pricing based on roof pitch (flat, low, medium, steep, very steep)</li>
              <li>Changes are saved automatically to localStorage (will be connected to backend API later)</li>
            </ul>
          </div>
        </section>
      </motion.main>
    </SubscriberLayout>
  );
}
