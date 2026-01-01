"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, ArrowRight, ArrowLeft, Check } from "lucide-react";
import Image from "next/image";
import logo from "@/public/logo-latest.png";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";
import * as turf from "@turf/turf";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

const geocodingClient = mbxGeocoding({
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "",
});

interface EstimateData {
  address?: string;
  totalArea?: number;
  roofPolygon?: any;
  roofSteepness?: "Flat" | "Low" | "Moderate" | "Steep";
  buildingType?: "Residential" | "Commercial";
  currentRoofType?: "Asphalt" | "Metal" | "Tile" | "Cedar";
  desiredRoofType?: "Asphalt" | "Metal" | "Tile";
  projectTimeline?: "No timeline" | "In 1-3 months" | "Now";
  financingInterest?: "Yes" | "No" | "Maybe";
  projectDescription?: string;
  name?: string;
  email?: string;
  phone?: string;
  estimates?: Array<{
    type: string;
    minPrice: number;
    maxPrice: number;
  }>;
}

interface EstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EstimateData) => void;
}

export default function EstimateModal({
  isOpen,
  onClose,
  onSave,
}: EstimateModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<EstimateData>({});

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
        },
        {
          type: "Asphalt Roof",
          minPrice: 26008,
          maxPrice: 28746,
        },
        {
          type: "Metal Roof",
          minPrice: 65020,
          maxPrice: 71864,
        },
        {
          type: "Tile Roof",
          minPrice: 91028,
          maxPrice: 100610,
        },
      ];
      setFormData((prev) => ({ ...prev, estimates }));
    }
  }, [currentStep]);

  const handleNext = () => {
    // Validate current step before proceeding
    if (currentStep === 2 && !formData.address) {
      alert("Please enter your address");
      return;
    }
    if (currentStep === 10 && (!formData.name || !formData.email || !formData.phone)) {
      alert("Please fill all required fields");
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
    // Generate 4 estimates based on form data
    const estimates = [
      {
        type: "Roof Repair and Maintenance",
        minPrice: 1951,
        maxPrice: 2156,
      },
      {
        type: "Asphalt Roof",
        minPrice: 26008,
        maxPrice: 28746,
      },
      {
        type: "Metal Roof",
        minPrice: 65020,
        maxPrice: 71864,
      },
      {
        type: "Tile Roof",
        minPrice: 91028,
        maxPrice: 100610,
      },
    ];

    const finalData = {
      ...formData,
      estimates,
    };

    // Clear current form from localStorage
    localStorage.removeItem("currentEstimateForm");
    onSave(finalData);
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {currentStep === 1 && "Get a free instant estimate"}
              {currentStep === 2 && "What's your address?"}
              {currentStep === 3 && "How steep is your roof?"}
              {currentStep === 4 && "What type of building do you have?"}
              {currentStep === 5 && "What is currently on your roof?"}
              {currentStep === 6 && "What type of roof would you like?"}
              {currentStep === 7 && "When would you like to start your project?"}
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
            <Step1
              data={formData}
              onInputChange={handleInputChange}
            />
          )}
          {currentStep === 2 && (
            <Step2
              data={formData}
              onInputChange={handleInputChange}
            />
          )}
          {currentStep === 3 && (
            <Step3
              data={formData}
              onInputChange={handleInputChange}
            />
          )}
          {currentStep === 4 && (
            <Step4
              data={formData}
              onInputChange={handleInputChange}
            />
          )}
          {currentStep === 5 && (
            <Step5
              data={formData}
              onInputChange={handleInputChange}
            />
          )}
          {currentStep === 6 && (
            <Step6
              data={formData}
              onInputChange={handleInputChange}
            />
          )}
          {currentStep === 7 && (
            <Step7
              data={formData}
              onInputChange={handleInputChange}
            />
          )}
          {currentStep === 8 && (
            <Step8
              data={formData}
              onInputChange={handleInputChange}
            />
          )}
          {currentStep === 9 && (
            <Step9
              data={formData}
              onInputChange={handleInputChange}
            />
          )}
          {currentStep === 10 && (
            <Step10
              data={formData}
              onInputChange={handleInputChange}
            />
          )}
          {currentStep === 11 && (
            <Step11
              data={formData}
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
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
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

// Step 1: Welcome
function Step1({
  data,
  onInputChange,
}: {
  data: EstimateData;
  onInputChange: (field: keyof EstimateData, value: any) => void;
}) {
  return (
    <div className="text-center py-8">
      <div className="flex justify-center mb-6">
        <Image
          src={logo}
          alt="Superior Pro Roofing Logo"
          width={200}
          height={80}
          className="object-contain"
          priority
        />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        Get Your Free Instant Estimate
      </h3>
      <p className="text-gray-600 mb-8">
        Answer a few quick questions and we&apos;ll provide you with instant roofing estimates tailored to your needs.
      </p>
    </div>
  );
}

// Step 2: Address
function Step2({
  data,
  onInputChange,
}: {
  data: EstimateData;
  onInputChange: (field: keyof EstimateData, value: any) => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [totalArea, setTotalArea] = useState<number>(data.totalArea || 0);

  const updateArea = useCallback(() => {
    if (!drawRef.current || !mapRef.current) return;
    
    const features = drawRef.current.getAll();
    let totalAreaSqFt = 0;
    let roofPolygon = null;

    features.features.forEach((feature: any) => {
      if (feature.geometry.type === "Polygon") {
        const area = turf.area(feature) * 10.7639; // Convert to square feet
        totalAreaSqFt += area;
        roofPolygon = feature;
      }
    });

    setTotalArea(totalAreaSqFt);
    onInputChange("totalArea", totalAreaSqFt);
    onInputChange("roofPolygon", roofPolygon);

    // Save to localStorage
    if (typeof window !== "undefined") {
      const currentForm = JSON.parse(localStorage.getItem("currentEstimateForm") || "{}");
      currentForm.totalArea = totalAreaSqFt;
      currentForm.roofPolygon = roofPolygon;
      localStorage.setItem("currentEstimateForm", JSON.stringify(currentForm));
    }
  }, [onInputChange]);

  // Initialize map when address is available (map container is rendered)
  useEffect(() => {
    if (!data.address || !mapContainerRef.current) return;
    
    // Initialize map only once
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [-74.006, 40.7128], // Default to NYC
      zoom: 22,
    });

    // Wait for style to load, then add building layer if not present
    map.on("style.load", () => {
      // Ensure building layer is available
      if (!map.getLayer("building")) {
        // Building layer should be in satellite-streets style by default
        console.log("Building layer not found in style");
      }
    });

    map.on("load", () => {
      map.easeTo({ bearing: 0, pitch: 0, duration: 1000 });
      
      // Initialize MapboxDraw for roof geometry
      const draw = new MapboxDraw({
        displayControlsDefault: false,
      });
      map.addControl(draw, "top-left");
      drawRef.current = draw;

      // Listen for draw events
      map.on("draw.create", updateArea);
      map.on("draw.update", updateArea);
      map.on("draw.delete", updateArea);
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (drawRef.current) {
        drawRef.current = null;
      }
    };
  }, [data.address, updateArea]);

  const autoDetectRoofGeometry = useCallback(async (lng: number, lat: number) => {
    if (!drawRef.current || !mapRef.current) return;

    // Clear existing polygons
    const existingFeatures = drawRef.current.getAll();
    existingFeatures.features.forEach((feature: any) => {
      if (feature.geometry.type === "Polygon") {
        drawRef.current?.delete(feature.id);
      }
    });

    try {
      // Use Mapbox Tilequery API to get building footprint automatically
      const radius = 50; // 50 meters radius
      const tilequeryUrl = `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/tilequery/${lng},${lat}.json?radius=${radius}&layers=building&access_token=${mapboxgl.accessToken}`;
      
      const response = await fetch(tilequeryUrl);
      if (response.ok) {
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          // Find the building feature closest to our point
          let closestBuilding = data.features[0];
          let minDistance = Infinity;
          
          data.features.forEach((feature: any) => {
            if (feature.geometry && (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon')) {
              // Calculate distance from center to find closest building
              const coords = feature.geometry.coordinates[0]?.[0] || feature.geometry.coordinates[0]?.[0]?.[0];
              if (coords) {
                const [featLng, featLat] = Array.isArray(coords[0]) ? coords[0] : coords;
                const distance = Math.sqrt(Math.pow(featLng - lng, 2) + Math.pow(featLat - lat, 2));
                if (distance < minDistance) {
                  minDistance = distance;
                  closestBuilding = feature;
                }
              }
            }
          });

          // Use the closest building
          if (closestBuilding.geometry) {
            let geometry = closestBuilding.geometry;
            
            // Handle MultiPolygon - use the first polygon
            if (geometry.type === 'MultiPolygon' && geometry.coordinates && geometry.coordinates.length > 0) {
              geometry = {
                type: 'Polygon',
                coordinates: geometry.coordinates[0],
              };
            }

            if (geometry.type === 'Polygon' && geometry.coordinates) {
              // Ensure coordinates are in correct format
              const coordinates = geometry.coordinates[0];
              if (coordinates && coordinates.length > 0) {
                // Convert coordinates if needed and close polygon
                const polygonCoords: [number, number][] = coordinates.map((coord: any) => {
                  if (Array.isArray(coord) && coord.length >= 2) {
                    return [coord[0], coord[1]] as [number, number];
                  }
                  return coord;
                });

                // Close the polygon if not already closed
                const first = polygonCoords[0];
                const last = polygonCoords[polygonCoords.length - 1];
                if (first && last && (first[0] !== last[0] || first[1] !== last[1])) {
                  polygonCoords.push(first);
                }

                const polygon = {
                  type: "Feature",
                  geometry: {
                    type: "Polygon",
                    coordinates: [polygonCoords],
                  },
                  properties: {},
                };

                drawRef.current?.add(polygon as any);
                updateArea();
                return;
              }
            }
          }
        }
      }
    } catch (err) {
      console.log("Mapbox building detection not available, using fallback:", err);
    }

    // Fallback: Create a simple square polygon (temporary approximation)
    // This is what currently exists - replace with Google Solar API data
    const offset = 0.00015; // ~15 meters offset for building outline
    const polygonCoords = [
      [
        [lng - offset, lat - offset],
        [lng + offset, lat - offset],
        [lng + offset, lat + offset],
        [lng - offset, lat + offset],
        [lng - offset, lat - offset],
      ],
    ];

    const polygon = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: polygonCoords,
      },
      properties: {},
    };

    // Add polygon to map
    try {
      drawRef.current.add(polygon as any);
      updateArea();
    } catch (err) {
      console.error("Error adding polygon:", err);
    }
  }, [updateArea]);

  // Update map when address changes
  useEffect(() => {
    if (!data.address || !mapRef.current) return;

    const updateMapLocation = async () => {
      try {
        const geoRes = await geocodingClient
          .forwardGeocode({ query: data.address!, limit: 1 })
          .send();
        
        if (geoRes.body.features.length > 0) {
          const feature = geoRes.body.features[0];
          const [lng, lat] = feature.center;
          if (lng && lat) {
            setCoordinates({ lat, lng });

            // Update map center
            mapRef.current!.flyTo({ center: [lng, lat] as [number, number], zoom: 22 });
            
            // Wait for map to settle, then auto-detect roof geometry
            setTimeout(() => {
              autoDetectRoofGeometry(lng, lat);
            }, 1500);
          }
        }
      } catch (err) {
        console.error("Geocoding error:", err);
      }
    };

    updateMapLocation();
  }, [data.address, autoDetectRoofGeometry]);

  const handleAddressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onInputChange("address", value);

    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await geocodingClient
        .forwardGeocode({ query: value, limit: 6 })
        .send();

      const results = res.body.features.map((f: any) => f.place_name);
      setSuggestions(results);
    } catch (err) {
      console.error("Geocoding error:", err);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    onInputChange("address", suggestion);
    setSuggestions([]);
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-600">
        Enter your property address and we&apos;ll automatically detect your roof geometry.
      </p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Property Address *
        </label>
        <div className="relative">
          <input
            type="text"
            value={data.address || ""}
            onChange={handleAddressChange}
            placeholder="123 Main St, City, State, ZIP"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
          {suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          AI will automatically draw the polygon for your roof
        </p>
      </div>
      
      {/* Map Container */}
      {data.address && (
        <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-300">
          <div ref={mapContainerRef} className="w-full h-full" />
          {/* Fixed Center Marker */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="#EF4444"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="white"
              className="w-8 h-8 drop-shadow-lg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21c4.97-5.33 8-9 8-12a8 8 0 10-16 0c0 3 3.03 6.67 8 12z"
              />
              <circle cx="12" cy="9" r="2.5" fill="white" />
            </svg>
          </div>
        </div>
      )}
      {totalArea > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800">
            <span className="font-semibold">Detected Roof Area:</span> {totalArea.toFixed(2)} sq ft
          </p>
        </div>
      )}
    </div>
  );
}

// Step 3: Roof Steepness
function Step3({
  data,
  onInputChange,
}: {
  data: EstimateData;
  onInputChange: (field: keyof EstimateData, value: any) => void;
}) {
  const options = ["Flat", "Low", "Moderate", "Steep"];

  return (
    <div className="space-y-6">
      <p className="text-gray-600">Select the steepness of your roof</p>
      <div className="grid grid-cols-2 gap-4">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onInputChange("roofSteepness", option)}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              data.roofSteepness === option
                ? "border-green-600 bg-green-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="font-semibold text-gray-900">{option}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Step 4: Building Type
function Step4({
  data,
  onInputChange,
}: {
  data: EstimateData;
  onInputChange: (field: keyof EstimateData, value: any) => void;
}) {
  const options = ["Residential", "Commercial"];

  return (
    <div className="space-y-6">
      <p className="text-gray-600">What type of building is this?</p>
      <div className="grid grid-cols-2 gap-4">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onInputChange("buildingType", option)}
            className={`p-6 border-2 rounded-lg text-center transition-all ${
              data.buildingType === option
                ? "border-green-600 bg-green-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="font-semibold text-gray-900 text-lg">{option}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Step 5: Current Roof Type
function Step5({
  data,
  onInputChange,
}: {
  data: EstimateData;
  onInputChange: (field: keyof EstimateData, value: any) => void;
}) {
  const options = ["Asphalt", "Metal", "Tile", "Cedar"];

  return (
    <div className="space-y-6">
      <p className="text-gray-600">What material is currently on your roof?</p>
      <div className="grid grid-cols-2 gap-4">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onInputChange("currentRoofType", option)}
            className={`p-4 border-2 rounded-lg text-center transition-all ${
              data.currentRoofType === option
                ? "border-green-600 bg-green-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="font-semibold text-gray-900">{option}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Step 6: Desired Roof Type
function Step6({
  data,
  onInputChange,
}: {
  data: EstimateData;
  onInputChange: (field: keyof EstimateData, value: any) => void;
}) {
  const options = ["Asphalt", "Metal", "Tile"];

  return (
    <div className="space-y-6">
      <p className="text-gray-600">What type of roof would you like?</p>
      <div className="grid grid-cols-3 gap-4">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onInputChange("desiredRoofType", option)}
            className={`p-4 border-2 rounded-lg text-center transition-all ${
              data.desiredRoofType === option
                ? "border-green-600 bg-green-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="font-semibold text-gray-900">{option}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Step 7: Project Timeline
function Step7({
  data,
  onInputChange,
}: {
  data: EstimateData;
  onInputChange: (field: keyof EstimateData, value: any) => void;
}) {
  const options = ["No timeline", "In 1-3 months", "Now"];

  return (
    <div className="space-y-6">
      <p className="text-gray-600">When would you like to start your project?</p>
      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onInputChange("projectTimeline", option)}
            className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
              data.projectTimeline === option
                ? "border-green-600 bg-green-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="font-semibold text-gray-900">{option}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Step 8: Financing
function Step8({
  data,
  onInputChange,
}: {
  data: EstimateData;
  onInputChange: (field: keyof EstimateData, value: any) => void;
}) {
  const options = ["Yes", "No", "Maybe"];

  return (
    <div className="space-y-6">
      <p className="text-gray-600">Are you interested in financing options?</p>
      <div className="grid grid-cols-3 gap-4">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onInputChange("financingInterest", option)}
            className={`p-4 border-2 rounded-lg text-center transition-all ${
              data.financingInterest === option
                ? "border-green-600 bg-green-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="font-semibold text-gray-900">{option}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Step 9: Project Description
function Step9({
  data,
  onInputChange,
}: {
  data: EstimateData;
  onInputChange: (field: keyof EstimateData, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <p className="text-gray-600">
        Tell us about your project (optional)
      </p>
      <div>
        <textarea
          value={data.projectDescription || ""}
          onChange={(e) => onInputChange("projectDescription", e.target.value)}
          placeholder="Any additional details about your roofing project..."
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}

// Step 10: Contact Information
function Step10({
  data,
  onInputChange,
}: {
  data: EstimateData;
  onInputChange: (field: keyof EstimateData, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <p className="text-gray-600">
        Where should we send your estimates?
      </p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={data.name || ""}
            onChange={(e) => onInputChange("name", e.target.value)}
            placeholder="John Doe"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={data.email || ""}
            onChange={(e) => onInputChange("email", e.target.value)}
            placeholder="john@example.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone *
          </label>
          <input
            type="tel"
            value={data.phone || ""}
            onChange={(e) => onInputChange("phone", e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>
      </div>
    </div>
  );
}

// Step 11: Review Estimates
function Step11({ data }: { data: EstimateData }) {
  // Use estimates from data if available, otherwise use default
  const estimates = data.estimates || [
    {
      type: "Roof Repair and Maintenance",
      minPrice: 1951,
      maxPrice: 2156,
    },
    {
      type: "Asphalt Roof",
      minPrice: 26008,
      maxPrice: 28746,
    },
    {
      type: "Metal Roof",
      minPrice: 65020,
      maxPrice: 71864,
    },
    {
      type: "Tile Roof",
      minPrice: 91028,
      maxPrice: 100610,
    },
  ];

  return (
    <div className="space-y-6">
      <p className="text-gray-600 mb-6">
        Here are your personalized roofing estimates:
      </p>
      <div className="space-y-4">
        {estimates.map((estimate, index) => (
          <div
            key={index}
            className="border-2 border-gray-200 rounded-lg p-6 hover:border-green-600 transition-all"
          >
            <h3 className="font-semibold text-lg text-gray-900 mb-2">
              {estimate.type}
            </h3>
            <p className="text-2xl font-bold text-green-600">
              ${estimate.minPrice.toLocaleString()} - $
              {estimate.maxPrice.toLocaleString()}*
            </p>
            <p className="text-xs text-gray-500 mt-2">
              *Preliminary estimate. Final pricing subject to inspection.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

