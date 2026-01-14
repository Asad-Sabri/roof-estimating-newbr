"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, Save, Edit2 } from "lucide-react";
import AdminDashboardLayout from "@/app/dashboard/admin/page";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";

type PricingItem = {
  id: string;
  material: string;
  minPricePerSqFt: number;
  maxPricePerSqFt: number;
  enabled: boolean;
};

const initialPricing: PricingItem[] = [
  { id: "1", material: "Asphalt", minPricePerSqFt: 3.50, maxPricePerSqFt: 7.00, enabled: true },
  { id: "2", material: "Metal", minPricePerSqFt: 8.00, maxPricePerSqFt: 15.00, enabled: true },
  { id: "3", material: "Tile", minPricePerSqFt: 10.00, maxPricePerSqFt: 18.00, enabled: true },
  { id: "4", material: "Cedar", minPricePerSqFt: 6.00, maxPricePerSqFt: 12.00, enabled: true },
  { id: "5", material: "BUR", minPricePerSqFt: 4.00, maxPricePerSqFt: 8.00, enabled: true },
  { id: "6", material: "PVC", minPricePerSqFt: 5.00, maxPricePerSqFt: 10.00, enabled: true },
  { id: "7", material: "TPO", minPricePerSqFt: 4.50, maxPricePerSqFt: 9.00, enabled: true },
  { id: "8", material: "EPDM", minPricePerSqFt: 4.00, maxPricePerSqFt: 8.50, enabled: true },
  { id: "9", material: "Roof Repair and Maintenance", minPricePerSqFt: 1.50, maxPricePerSqFt: 3.00, enabled: true },
];

export default function EstimatingPricingPage() {
  useProtectedRoute();
  const [pricing, setPricing] = useState<PricingItem[]>(initialPricing);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<{ min: number; max: number } | null>(null);
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

  const handleEdit = (id: string) => {
    const item = pricing.find((p) => p.id === id);
    if (item) {
      setIsEditing(id);
      setTempValues({ min: item.minPricePerSqFt, max: item.maxPricePerSqFt });
    }
  };

  const handleSave = (id: string) => {
    if (tempValues) {
      setPricing((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, minPricePerSqFt: tempValues.min, maxPricePerSqFt: tempValues.max }
            : p
        )
      );
      setIsEditing(null);
      setTempValues(null);
      setHasChanges(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(null);
    setTempValues(null);
  };

  const handleToggle = (id: string) => {
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
    <AdminDashboardLayout>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-gray-900"
      >
        {/* Header */}
        <header className="text-white py-5 px-2 md:px-6 flex md:items-center justify-between" style={{ backgroundColor: "#8b0e0f" }}>
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
          <p className="text-sm text-gray-700">
            Manage pricing per square foot for different roofing materials. These prices will be used to calculate instant estimates for customers.
          </p>
        </div>

        {/* Pricing Table */}
        <section className="my-8 mx-2 md:mx-6">
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="w-full border border-gray-300 rounded-lg text-sm min-w-[800px]">
              <thead className="text-white rounded-t-lg" style={{ backgroundColor: "#8b0e0f" }}>
                <tr>
                  <th className="p-4 text-left font-bold">Material</th>
                  <th className="p-4 text-left font-bold">Min Price (per sqft)</th>
                  <th className="p-4 text-left font-bold">Max Price (per sqft)</th>
                  <th className="p-4 text-left font-bold">Status</th>
                  <th className="p-4 text-left font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pricing.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-gray-300 hover:bg-gray-50 transition"
                  >
                    <td className="p-4 font-medium">{item.material}</td>
                    <td className="p-4">
                      {isEditing === item.id ? (
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={tempValues?.min || 0}
                          onChange={(e) =>
                            setTempValues({
                              ...tempValues!,
                              min: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      ) : (
                        <span className="text-gray-700">${item.minPricePerSqFt.toFixed(2)}</span>
                      )}
                    </td>
                    <td className="p-4">
                      {isEditing === item.id ? (
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={tempValues?.max || 0}
                          onChange={(e) =>
                            setTempValues({
                              ...tempValues!,
                              max: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      ) : (
                        <span className="text-gray-700">${item.maxPricePerSqFt.toFixed(2)}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={() => handleToggle(item.id)}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span className={`ml-2 text-sm ${item.enabled ? "text-green-600" : "text-gray-400"}`}>
                          {item.enabled ? "Enabled" : "Disabled"}
                        </span>
                      </label>
                    </td>
                    <td className="p-4">
                      {isEditing === item.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSave(item.id)}
                            className="px-3 py-1 text-sm text-white rounded-md transition-all"
                            style={{ backgroundColor: "#8b0e0f" }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#6d0b0c"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#8b0e0f"}
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancel}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(item.id)}
                          className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition"
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Info Section */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">How it works:</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Pricing is set per square foot for each roofing material</li>
              <li>When customers request an instant estimate, prices are calculated based on roof area × price per sqft</li>
              <li>You can enable/disable materials to control which options appear to customers</li>
              <li>Changes are saved automatically to localStorage (will be connected to backend API later)</li>
            </ul>
          </div>
        </section>
      </motion.main>
    </AdminDashboardLayout>
  );
}
