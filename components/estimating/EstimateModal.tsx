"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
import Image from "next/image";
import logo from "@/public/logo-latest.png";
import { EstimateData, EstimateModalProps } from "./types";
import { createInstantEstimateAPI } from "@/services/instantEstimateAPI";
import { toast } from "react-toastify";
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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


      // Load assignment data from URL params (QR code/link tracking)
      const assignmentDataStr = localStorage.getItem("assignmentData");
      if (assignmentDataStr) {
        try {
          const assignmentData = JSON.parse(assignmentDataStr);
          setFormData((prev) => ({
            ...prev,
            promoter_id: assignmentData.promoter_id,
            sales_rep_id: assignmentData.sales_rep_id,
            marketing_channel: assignmentData.marketing_channel,
            assignment_source: assignmentData.assignment_source,
          }));
        } catch (error) {
          console.error("Error parsing assignment data:", error);
        }
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

  // Validation function to check if current step is valid
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.address && formData.pinConfirmed);
      case 2:
        return !!formData.roofSteepness;
      case 3:
        return !!formData.buildingType;
      case 4:
        return !!formData.currentRoofType;
      case 5:
        return !!formData.roofLayers;
      case 6:
        return !!formData.desiredRoofType;
      case 7:
        return !!formData.projectTimeline;
      case 8:
        return !!formData.financingInterest;
      case 9:
        return true; // Project description is optional
      case 10:
        return !!(
          formData.firstName &&
          formData.lastName &&
          formData.email &&
          formData.phone
        );
      case 11:
        return true; // Review step, no validation needed
      default:
        return false;
    }
  };

  const handleNext = () => {
    // Validate current step before proceeding
    if (!isStepValid(currentStep)) {
      // Show appropriate error messages
      if (currentStep === 1) {
        if (!formData.address) {
          alert("Please enter your address");
        } else if (!formData.pinConfirmed) {
          alert(
            "Please confirm the pin drop location on the building before proceeding"
          );
        }
      } else if (currentStep === 10) {
        alert(
          "Please fill all required fields (First Name, Last Name, Email, and Phone)"
        );
      } else {
        alert("Please select an option before proceeding");
      }
      return;
    }

    // Just move to next step - API call will happen only at final step
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
    // Step 11 is review, so no next action needed here
  };

  const handleGetEstimates = async () => {
    // Final step - generate and save estimates via API
    await handleGenerateEstimates();
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field: keyof EstimateData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Helper function to parse address string into address object
  const parseAddress = (addressString: string | any) => {
    // Try to parse address - if it's already an object, return it
    if (typeof addressString === "object" && addressString !== null) {
      // Check if it already has the required structure
      if (addressString.street || addressString.city) {
        return addressString;
      }
    }

    // If it's a string, try to extract components
    // Mapbox address format: "123 Main St, City, State ZIP, Country"
    if (typeof addressString === "string") {
      const parts = addressString.split(",").map((p) => p.trim());
      
      // Try to extract ZIP code from state part (e.g., "CA 90210")
      let state = "";
      let zip_code = "";
      if (parts.length >= 3) {
        const stateZip = parts[2]?.split(" ") || [];
        state = stateZip[0] || parts[2] || "";
        zip_code = stateZip.slice(1).join(" ") || "";
      }
      
      return {
        street: parts[0] || "",
        city: parts[1] || "",
        state: state || parts[2] || "",
        country: parts[3] || parts[parts.length - 1] || "USA",
        zip_code: zip_code || "",
      };
    }
    
    // Default fallback
    return {
      street: "",
      city: "",
      state: "",
      country: "USA",
      zip_code: "",
    };
  };

  // Helper function to convert timeline value
  const mapTimeline = (timeline?: string) => {
    if (!timeline) return "";
    const mapping: Record<string, string> = {
      "No timeline": "",
      "In 1-3 months": "1-3 months",
      "Now": "immediately",
    };
    return mapping[timeline] || timeline;
  };

  // Helper function to convert financing interest to boolean
  const mapFinancingInterest = (interest?: string) => {
    if (interest === "Yes") return true;
    if (interest === "No") return false;
    return false; // Default to false for "Maybe" or undefined
  };

  // Helper function to convert estimates to estimate_price format
  const convertEstimatesToPriceArray = (estimates: any[]) => {
    return estimates
      .filter((est) => est.enabled !== false)
      .map((est) => ({
        title: est.type || est.title,
        price_range: `$${est.minPrice?.toLocaleString() || 0}-${est.maxPrice?.toLocaleString() || 0}`,
        description: est.description || `${est.type} estimate`,
      }));
  };


  const handleGenerateEstimates = async () => {
    setIsSubmitting(true);
    try {
      // Parse address - ensure it has proper structure with all required fields
      let addressObj = parseAddress(formData.address || "");
      
      // Ensure address object has all required fields
      addressObj = {
        street: addressObj.street || (formData.address || ""),
        city: addressObj.city || "",
        state: addressObj.state || "",
        country: addressObj.country || "USA",
        zip_code: addressObj.zip_code || "",
      };

      // Convert estimates to API format
      const estimatePriceArray = formData.estimates
        ? convertEstimatesToPriceArray(formData.estimates)
        : [
            {
              title: "Roof Repair and Maintenance",
              price_range: "$1,951-2,156",
              description: "Roof Repair and Maintenance estimate",
            },
            {
              title: "Asphalt Roof",
              price_range: "$26,008-28,746",
              description: "Asphalt Roof estimate",
            },
            {
              title: "Metal Roof",
              price_range: "$65,020-71,864",
              description: "Metal Roof estimate",
            },
            {
              title: "Tile Roof",
              price_range: "$91,028-100,610",
              description: "Tile Roof estimate",
            },
          ];

      // Prepare API payload according to exact API structure
      const apiPayload = {
        first_name: formData.firstName || "",
        last_name: formData.lastName || "",
        email: formData.email || "",
        mobile_number: formData.phone || "",
        address: addressObj,
        area: String(formData.totalArea || 0),
        roof_teep: formData.roofSteepness || "", // Note: API uses "roof_teep" (typo)
        building_type: formData.buildingType || "",
        current_roof_material: formData.currentRoofType || "",
        current_roof_layer: formData.roofLayers === "I do not know" ? "" : formData.roofLayers || "",
        roof_material: formData.desiredRoofType || "",
        timeline: mapTimeline(formData.projectTimeline),
        interested_in_financing: mapFinancingInterest(formData.financingInterest),
        estimate_price: estimatePriceArray,
      };

      // Call backend API
      toast.info("Submitting your estimate request...");
      const response = await createInstantEstimateAPI(apiPayload);

      // Handle response - API returns { message, data }
      const responseData = response.data || response;

      // Convert estimate_price back to estimates format for UI
      const estimates = responseData.estimate_price
        ? responseData.estimate_price.map((est: any) => {
            // Parse price_range like "$ 2500-3000" or "$1,951-2,156"
            const priceMatch = est.price_range?.match(/\$?\s*([\d,]+)\s*-\s*([\d,]+)/);
            const minPrice = priceMatch ? parseInt(priceMatch[1].replace(/,/g, "")) : 0;
            const maxPrice = priceMatch ? parseInt(priceMatch[2].replace(/,/g, "")) : 0;

            return {
              type: est.title,
              minPrice: minPrice,
              maxPrice: maxPrice,
              enabled: true,
              description: est.description,
            };
          })
        : formData.estimates || [];

      const finalData = {
        ...formData,
        estimates: estimates,
        project_id: responseData._id || responseData.id, // Store project ID from API
        user_id: responseData.user_id, // Store user_id if available
        // Ensure name is set for backward compatibility
        name:
          formData.firstName && formData.lastName
            ? `${formData.firstName} ${formData.lastName}`
            : formData.name,
      };

      // Clear current form from localStorage
      localStorage.removeItem("currentEstimateForm");
      
      toast.success(response.message || "Estimate submitted successfully!");
      onSave(finalData);

      // Close modal - let parent component handle redirect
      onClose();
    } catch (error: any) {
      console.error("Error submitting estimate:", error);
      const errorMessage = error?.response?.data?.message || error?.response?.data?.detail || error?.message || "Failed to submit estimate";
      toast.error(errorMessage);
      
      // Still save locally as fallback
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

      const enabledEstimates = formData.estimates
        ? formData.estimates.filter((est) => est.enabled !== false)
        : estimates.filter((est) => est.enabled !== false);

      const finalData = {
        ...formData,
        estimates: enabledEstimates,
        name:
          formData.firstName && formData.lastName
            ? `${formData.firstName} ${formData.lastName}`
            : formData.name,
      };

      localStorage.removeItem("currentEstimateForm");
      onSave(finalData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
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
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="w-full min-h-full max-w-5xl mx-auto my-10 flex flex-col rounded-lg border border-gray-200 shadow-lg" style={{ backgroundColor: "#ffffff" }}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Image
                src={logo}
                alt="Superior Pro Roofing Logo"
                width={200}
                height={50}
                className="object-contain"
              />
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600"
            >
            </button>
          </div>
          {/* Progress Bar */}
          
        </div>
        <div className="pb-3">
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className="h-1 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%`, backgroundColor: "#8b0e0f" }}
              />
            </div>
          </div>
        {/* Content */}
        <div className="px-6 flex-1">
          {/* Heading */}
          <div className="relative">
            {/* <p className="text-md text-gray-500 mb-2 text-left pb-5">
              Step {currentStep} of {totalSteps}
            </p> */}
            <h1 className="text-3xl font-bold text-gray-900 text-center py-5">  
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
            </h1>
          </div>
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
        <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
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
              disabled={isSubmitting}
              className="px-6 py-2 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#8b0e0f" }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = "#6d0b0c";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = "#8b0e0f";
                }
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                "Get My Estimates"
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
              className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
                !isStepValid(currentStep)
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "text-white"
              }`}
              style={isStepValid(currentStep) ? { backgroundColor: "#8b0e0f" } : {}}
              onMouseEnter={(e) => {
                if (isStepValid(currentStep)) {
                  e.currentTarget.style.backgroundColor = "#6d0b0c";
                }
              }}
              onMouseLeave={(e) => {
                if (isStepValid(currentStep)) {
                  e.currentTarget.style.backgroundColor = "#8b0e0f";
                }
              }}
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
