"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EstimateModal from "@/components/estimating/EstimateModal";

export default function MeasurementsPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Optionally redirect back to instant estimate page
    router.push("/instant-estimate");
  };

  const handleSaveEstimate = (estimateData: any) => {
    // Save to localStorage
    if (typeof window !== "undefined") {
      const existingEstimates = JSON.parse(
        localStorage.getItem("customerEstimates") || "[]"
      );
      const newEstimate = {
        id: Date.now().toString(),
        ...estimateData,
        createdAt: new Date().toISOString(),
      };
      existingEstimates.push(newEstimate);
      localStorage.setItem("customerEstimates", JSON.stringify(existingEstimates));
    }
    
    // Close modal and redirect to dashboard if user is logged in, otherwise to instant estimate
    setIsModalOpen(false);
    
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/customer-panel/dashboard");
    } else {
      router.push("/instant-estimate");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <EstimateModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEstimate}
      />
    </div>
  );
}
