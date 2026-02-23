"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import EstimateModal from "@/components/estimating/EstimateModal";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";

export default function MeasurementsPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(true);
  const { isAuthenticated, isChecking } = useProtectedRoute();

  // On load/refresh: clear saved form so modal starts at step 1 with empty fields
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentEstimateForm");
    }
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    router.push("/instant-estimate");
  };

  const handleSaveEstimate = (data: any) => {
    if (typeof window !== "undefined") {
      const existingEstimates = JSON.parse(
        localStorage.getItem("customerEstimates") || "[]"
      );
      const newEstimate = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date().toISOString(),
      };
      existingEstimates.push(newEstimate);
      localStorage.setItem("customerEstimates", JSON.stringify(existingEstimates));
    }

    setIsModalOpen(false);
    // Redirect to Measurements page (estimates list) - not dashboard
    router.replace("/customer-panel/estimating");
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8b0e0f] mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EstimateModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEstimate}
        resetFormOnMount
      />
    </div>
  );
}
