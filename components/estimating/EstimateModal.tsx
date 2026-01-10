"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
import { EstimateData, EstimateModalProps } from "./types";
import Step2Address from "./steps/Step2Address";
import Step3RoofSteepness from "./steps/Step3RoofSteepness";
import Step4BuildingType from "./steps/Step4BuildingType";
import Step5CurrentRoofType from "./steps/Step5CurrentRoofType";
import Step5Layers from "./steps/Step5Layers";
import Step6DesiredRoofType from "./steps/Step6DesiredRoofType";
import Step7ProjectTimeline from "./steps/Step7ProjectTimeline";
import Step8Financing from "./steps/Step8Financing";
import Step9ProjectDescription from "./steps/Step9ProjectDescription";
import Step10ContactInfo from "./steps/Step10ContactInfo";
import Step11ReviewEstimates from "./steps/Step11ReviewEstimates";

export default function EstimateModal({
  isOpen,
  onClose,
  onSave,
}: EstimateModalProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<EstimateData>({});

  // Start at step 1 (address entry) - removed welcome screen
  // Total steps: 11 (address, steepness, building, current roof, layers, desired roof, timeline, financing, description, contact, review)
  const totalSteps = 11;

  useEffect(() => {
    // Load saved data from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("currentEstimateForm");
      if (saved) {
        setFormData(JSON.parse(saved));
      }
    }
  }, []);

  useEffect(() => {
    // Save form data to localStorage on each change
    if (typeof window !== "undefined" && Object.keys(formData).length > 0) {
      localStorage.setItem("currentEstimateForm", JSON.stringify(formData));
    }
  }, [formData]);

  // Generate estimates when reaching step 11
  useEffect(() => {
    if (currentStep === 11 && !formData.estimates) {
      const estimates = [
        {
          type: "Roof Repair and Maintenance",
          minPrice: 1951,
          maxPrice: 2156,
          enabled: true,
        },
        {
          type: "Asphalt Roof",
          minPrice: 26008,
          maxPrice: 28746,
          enabled: true,
        },
        {
          type: "Metal Roof",
          minPrice: 65020,
          maxPrice: 71864,
          enabled: true,
        },
        {
          type: "Tile Roof",
          minPrice: 91028,
          maxPrice: 100610,
          enabled: true,
        },
      ];
      setFormData((prev) => ({ ...prev, estimates }));
    }
  }, [currentStep]);

  const handleNext = () => {
    // Validate current step before proceeding
    // Step 1: Address (was Step 2)
    if (currentStep === 1 && (!formData.address || !formData.pinConfirmed)) {
      if (!formData.address) {
        alert("Please enter your address");
      } else if (!formData.pinConfirmed) {
        alert(
          "Please confirm the pin drop location on the building before proceeding"
        );
      }
      return;
    }
    // Step 10: Contact Info (validation updated)
    if (
      currentStep === 10 &&
      (!formData.firstName ||
        !formData.lastName ||
        !formData.email ||
        !formData.phone)
    ) {
      alert(
        "Please fill all required fields (First Name, Last Name, Email, and Phone)"
      );
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
    // Step 11 is review, so no next action needed here
  };

  const handleGetEstimates = () => {
    // Final step - generate and save estimates
    handleGenerateEstimates();
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field: keyof EstimateData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerateEstimates = () => {
    // Generate estimates based on form data
    // Filter estimates based on enabled toggles from Step 11
    const estimates = [
      {
        type: "Roof Repair and Maintenance",
        minPrice: 1951,
        maxPrice: 2156,
        enabled: true,
      },
      {
        type: "Asphalt Roof",
        minPrice: 26008,
        maxPrice: 28746,
        enabled: true,
      },
      {
        type: "Metal Roof",
        minPrice: 65020,
        maxPrice: 71864,
        enabled: true,
      },
      {
        type: "Tile Roof",
        minPrice: 91028,
        maxPrice: 100610,
        enabled: true,
      },
    ];

    // Filter by enabled status if toggles were set
    const enabledEstimates = formData.estimates
      ? formData.estimates.filter((est) => est.enabled !== false)
      : estimates.filter((est) => est.enabled !== false);

    const finalData = {
      ...formData,
      estimates: enabledEstimates,
      // Ensure name is set for backward compatibility
      name:
        formData.firstName && formData.lastName
          ? `${formData.firstName} ${formData.lastName}`
          : formData.name,
    };

    // Clear current form from localStorage
    localStorage.removeItem("currentEstimateForm");
    onSave(finalData);

    // Close modal and redirect to dashboard
    onClose();
    router.push("/customer-panel/dashboard");
  };

  const handleClose = () => {
    // Save progress before closing
    if (Object.keys(formData).length > 0) {
      localStorage.setItem("currentEstimateForm", JSON.stringify(formData));
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-95">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {currentStep === 1 && "What's your address?"}
              {currentStep === 2 && "How steep is your roof?"}
              {currentStep === 3 && "What type of building do you have?"}
              {currentStep === 4 && "What is currently on your roof?"}
              {currentStep === 5 && "How many layers currently on your roof?"}
              {currentStep === 6 && "What type of roof would you like?"}
              {currentStep === 7 &&
                "When would you like to start your project?"}
              {currentStep === 8 && "Are you interested in financing?"}
              {currentStep === 9 && "Tell us about your project"}
              {currentStep === 10 && "Where should we send your estimates?"}
              {currentStep === 11 && "Review your estimates"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          {currentStep === 1 && (
            <Step2Address data={formData} onInputChange={handleInputChange} />
          )}
          {currentStep === 2 && (
            <Step3RoofSteepness
              data={formData}
              onInputChange={handleInputChange}
            />
          )}
          {currentStep === 3 && (
            <Step4BuildingType
              data={formData}
              onInputChange={handleInputChange}
            />
          )}
          {currentStep === 4 && (
            <Step5CurrentRoofType
              data={formData}
              onInputChange={handleInputChange}
            />
          )}
          {currentStep === 5 && (
            <Step5Layers data={formData} onInputChange={handleInputChange} />
          )}
          {currentStep === 6 && (
            <Step6DesiredRoofType
              data={formData}
              onInputChange={handleInputChange}
            />
          )}
          {currentStep === 7 && (
            <Step7ProjectTimeline
              data={formData}
              onInputChange={handleInputChange}
            />
          )}
          {currentStep === 8 && (
            <Step8Financing
              data={formData}
              onInputChange={handleInputChange}
            />
          )}
          {currentStep === 9 && (
            <Step9ProjectDescription
              data={formData}
              onInputChange={handleInputChange}
            />
          )}
          {currentStep === 10 && (
            <Step10ContactInfo
              data={formData}
              onInputChange={handleInputChange}
            />
          )}
          {currentStep === 11 && (
            <Step11ReviewEstimates
              data={formData}
              onInputChange={handleInputChange}
            />
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          {currentStep === totalSteps ? (
            <button
              onClick={handleGetEstimates}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              Get My Estimates
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={
                currentStep === 1 &&
                (!formData.address || !formData.pinConfirmed)
              }
              className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
                currentStep === 1 &&
                (!formData.address || !formData.pinConfirmed)
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
