"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EstimateModal from "@/components/estimating/EstimateModal";
import { CheckCircle, X } from "lucide-react";

export default function MeasurementsPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [estimateData, setEstimateData] = useState<any>(null);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Optionally redirect back to instant estimate page
    router.push("/instant-estimate");
  };

  const handleSaveEstimate = (data: any) => {
    // Save to localStorage
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

    // Store estimate data
    setEstimateData(data);
    
    // Close estimate modal and show success screen
    setIsModalOpen(false);
    
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (token) {
      // Already logged in - go to dashboard
      router.push("/customer-panel/dashboard");
    } else {
      // Not logged in - show success screen with optional account creation
      setShowSuccessScreen(true);
    }
  };

  const handleCreateAccount = () => {
    // Store estimate data in localStorage for signup flow
    if (estimateData) {
      localStorage.setItem("estimateSignupData", JSON.stringify(estimateData));
    }
    // Redirect to signup page with pre-filled data
    router.push("/signup?from_estimate=true");
  };

  const handleSkipAccount = () => {
    // Clear assignment data
    localStorage.removeItem("assignmentData");
    // Redirect to instant estimate landing
    router.push("/instant-estimate");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <EstimateModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEstimate}
      />

      {/* Success Screen with Optional Account Creation */}
      {showSuccessScreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-8 relative">
            <button
              onClick={handleSkipAccount}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 rounded-full p-3">
                  <CheckCircle className="text-green-600" size={48} />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Estimate Sent Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                Your preliminary estimates have been sent to{" "}
                {estimateData?.email || "your email"}. Check your inbox for details.
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleCreateAccount}
                  className="w-full px-6 py-3 text-white rounded-lg font-semibold transition-colors"
                  style={{ backgroundColor: "#8b0e0f" }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#6d0b0c"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#8b0e0f"}
                >
                  Create Free Account 
                </button>
                <button
                  onClick={handleSkipAccount}
                  className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Maybe Later
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Creating an account lets you track your projects and manage your estimates easily.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
