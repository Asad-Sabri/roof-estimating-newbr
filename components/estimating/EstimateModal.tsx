"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  coordinates?: { lat: number; lng: number }; // Pin coordinates for runtime updates
  totalArea?: number;
  roofPolygon?: any;
  pinConfirmed?: boolean; // Pin drop confirmation on building
  roofSteepness?: "Flat" | "Low" | "Moderate" | "Steep" | "Very Steep";
  buildingType?: "Residential" | "Commercial";
  currentRoofType?:
    | "Asphalt"
    | "Metal"
    | "Tile"
    | "Cedar"
    | "BUR"
    | "PVC"
    | "TPO"
    | "EPDM";
  roofLayers?: "1" | "2" | "3" | "I do not know";
  desiredRoofType?: string; // Can be any material from available materials list
  projectTimeline?: "No timeline" | "In 1-3 months" | "Now";
  financingInterest?: "Yes" | "No" | "Maybe";
  projectDescription?: string;
  firstName?: string;
  lastName?: string;
  name?: string; // Keep for backward compatibility
  email?: string;
  phone?: string;
  estimates?: Array<{
    type: string;
    minPrice: number;
    maxPrice: number;
    enabled?: boolean; // For admin toggle
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
            <Step2 data={formData} onInputChange={handleInputChange} />
          )}
          {currentStep === 2 && (
            <Step3 data={formData} onInputChange={handleInputChange} />
          )}
          {currentStep === 3 && (
            <Step4 data={formData} onInputChange={handleInputChange} />
          )}
          {currentStep === 4 && (
            <Step5 data={formData} onInputChange={handleInputChange} />
          )}
          {currentStep === 5 && (
            <Step5Layers data={formData} onInputChange={handleInputChange} />
          )}
          {currentStep === 6 && (
            <Step6 data={formData} onInputChange={handleInputChange} />
          )}
          {currentStep === 7 && (
            <Step7 data={formData} onInputChange={handleInputChange} />
          )}
          {currentStep === 8 && (
            <Step8 data={formData} onInputChange={handleInputChange} />
          )}
          {currentStep === 9 && (
            <Step9 data={formData} onInputChange={handleInputChange} />
          )}
          {currentStep === 10 && (
            <Step10 data={formData} onInputChange={handleInputChange} />
          )}
          {currentStep === 11 && (
            <Step11 data={formData} onInputChange={handleInputChange} />
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

// Step 1: Address (Welcome screen removed - starts directly here)
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
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [totalArea, setTotalArea] = useState<number>(data.totalArea || 0);
  const [pinConfirmed, setPinConfirmed] = useState<boolean>(
    data.pinConfirmed || false
  );
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const addressRef = useRef<string>(data.address || ""); // Track previous address to prevent unnecessary reloads

  // Update pinConfirmed when data changes
  useEffect(() => {
    if (data.pinConfirmed !== undefined) {
      setPinConfirmed(data.pinConfirmed);
    }
  }, [data.pinConfirmed]);

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
      const currentForm = JSON.parse(
        localStorage.getItem("currentEstimateForm") || "{}"
      );
      currentForm.totalArea = totalAreaSqFt;
      currentForm.roofPolygon = roofPolygon;
      localStorage.setItem("currentEstimateForm", JSON.stringify(currentForm));
    }
  }, [onInputChange]);

  // Initialize map only once when map container is available (regardless of address)
  useEffect(() => {
    // Only initialize if container exists and map not already initialized
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [0, 0], // World view center
      zoom: 2, // Full zoom out
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
      // Only cleanup on unmount - map should persist across address changes
      // Cleanup will only run when component unmounts
    };
  }, [updateArea]); // Initialize map only once, don't depend on address

  const autoDetectRoofGeometry = useCallback(
    async (lng: number, lat: number) => {
      if (!drawRef.current || !mapRef.current) return;

      // Clear existing polygons
      const existingFeatures = drawRef.current.getAll();
      existingFeatures.features.forEach((feature: any) => {
        if (feature.geometry.type === "Polygon") {
          drawRef.current?.delete(feature.id);
        }
      });

      // Try Google Solar API first (if available) for best roof detection
      try {
        const solarResponse = await fetch(
          "/api/google-solar/building-insights",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat, lng }),
          }
        );

        if (solarResponse.ok) {
          const solarData = await solarResponse.json();
          if (
            solarData.success &&
            solarData.data?.roofSegments &&
            solarData.data.roofSegments.length > 0
          ) {
            // Use the largest roof segment (main roof)
            const roofSegments = solarData.data.roofSegments;
            const mainSegment = roofSegments.reduce((prev: any, curr: any) =>
              curr.areaMeters2 > prev.areaMeters2 ? curr : prev
            );

            if (mainSegment.polygon?.exterior?.vertices) {
              const vertices = mainSegment.polygon.exterior.vertices;
              const polygonCoords: [number, number][] = vertices.map(
                (v: any) => [v.longitude, v.latitude]
              );

              // Close polygon
              if (
                polygonCoords.length > 0 &&
                (polygonCoords[0][0] !==
                  polygonCoords[polygonCoords.length - 1][0] ||
                  polygonCoords[0][1] !==
                    polygonCoords[polygonCoords.length - 1][1])
              ) {
                polygonCoords.push(polygonCoords[0]);
              }

              const polygon = {
                type: "Feature",
                geometry: {
                  type: "Polygon",
                  coordinates: [polygonCoords],
                },
                properties: {},
              };

              try {
                drawRef.current?.add(polygon as any);
                setTimeout(() => updateArea(), 100);
                return; // Successfully used Google Solar API
              } catch (err) {
                console.error("Error adding Google Solar polygon:", err);
              }
            }
          }
        }
      } catch (err) {
        console.log(
          "Google Solar API not available, trying other methods:",
          err
        );
      }

      // Try OpenStreetMap Overpass API (FREE, no API key needed) for building detection
      try {
        // Search radius in degrees (approximately 100 meters)
        const radius = 0.001; // ~100 meters
        const bbox = `${lng - radius},${lat - radius},${lng + radius},${
          lat + radius
        }`;

        // Overpass API query to find buildings near the point
        const overpassQuery = `
        [out:json][timeout:25];
        (
          way["building"](around:50,${lat},${lng});
          relation["building"](around:50,${lat},${lng});
        );
        out geom;
      `;

        const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
          overpassQuery
        )}`;

        const osmResponse = await fetch(overpassUrl);
        if (osmResponse.ok) {
          const osmData = await osmResponse.json();
          if (osmData.elements && osmData.elements.length > 0) {
            // Find the building closest to our point
            let closestBuilding: any = null;
            let minDistance = Infinity;

            osmData.elements.forEach((element: any) => {
              if (element.type === "way" && element.geometry) {
                try {
                  // Convert OSM way to polygon coordinates
                  const coords = element.geometry.map((point: any) => [
                    point.lon,
                    point.lat,
                  ]);

                  if (coords.length >= 3) {
                    // Calculate centroid for distance
                    let centerLng = 0,
                      centerLat = 0;
                    coords.forEach((coord: any) => {
                      centerLng += coord[0];
                      centerLat += coord[1];
                    });
                    centerLng /= coords.length;
                    centerLat /= coords.length;

                    const distance = Math.sqrt(
                      Math.pow(centerLng - lng, 2) +
                        Math.pow(centerLat - lat, 2)
                    );

                    // Check if point is inside polygon
                    let isInside = false;
                    let inside = false;
                    for (
                      let i = 0, j = coords.length - 1;
                      i < coords.length;
                      j = i++
                    ) {
                      const xi = coords[i][0],
                        yi = coords[i][1];
                      const xj = coords[j][0],
                        yj = coords[j][1];
                      const intersect =
                        yi > lat !== yj > lat &&
                        lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
                      if (intersect) inside = !inside;
                    }
                    isInside = inside;

                    // Prefer buildings where point is inside
                    if (
                      isInside ||
                      (!closestBuilding && distance < minDistance)
                    ) {
                      if (isInside || distance < minDistance) {
                        minDistance = distance;
                        closestBuilding = { coords, element };
                      }
                    }
                  }
                } catch (e) {
                  // Skip if conversion fails
                }
              }
            });

            if (closestBuilding && closestBuilding.coords) {
              const polygonCoords: [number, number][] = closestBuilding.coords;

              // Close polygon if not already closed
              const first = polygonCoords[0];
              const last = polygonCoords[polygonCoords.length - 1];
              if (
                first &&
                last &&
                (first[0] !== last[0] || first[1] !== last[1])
              ) {
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

              try {
                drawRef.current?.add(polygon as any);
                setTimeout(() => updateArea(), 100);
                return; // Successfully used OpenStreetMap
              } catch (err) {
                console.error("Error adding OSM polygon:", err);
              }
            }
          }
        }
      } catch (err) {
        console.log(
          "OpenStreetMap Overpass API not available, using Mapbox:",
          err
        );
      }

      // Fallback to Mapbox Tilequery API for building detection
      try {
        // Try multiple radii and layers for better detection
        const radii = [50, 100, 150]; // Try different search radii
        let bestBuilding: any = null;
        let bestDistance = Infinity;

        for (const radius of radii) {
          const tilequeryUrl = `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/tilequery/${lng},${lat}.json?radius=${radius}&layers=building&access_token=${mapboxgl.accessToken}`;

          const response = await fetch(tilequeryUrl);
          if (response.ok) {
            const data = await response.json();
            if (data.features && data.features.length > 0) {
              // Find the building feature closest to our point
              data.features.forEach((feature: any) => {
                if (
                  feature.geometry &&
                  (feature.geometry.type === "Polygon" ||
                    feature.geometry.type === "MultiPolygon")
                ) {
                  try {
                    const geometry = feature.geometry;
                    let centerLng = 0,
                      centerLat = 0,
                      pointCount = 0;

                    // Calculate centroid of polygon for distance calculation
                    if (
                      geometry.type === "Polygon" &&
                      geometry.coordinates &&
                      geometry.coordinates[0]
                    ) {
                      geometry.coordinates[0].forEach((coord: any) => {
                        if (Array.isArray(coord) && coord.length >= 2) {
                          centerLng += coord[0];
                          centerLat += coord[1];
                          pointCount++;
                        }
                      });
                    } else if (
                      geometry.type === "MultiPolygon" &&
                      geometry.coordinates
                    ) {
                      geometry.coordinates.forEach((poly: any) => {
                        if (poly && poly[0]) {
                          poly[0].forEach((coord: any) => {
                            if (Array.isArray(coord) && coord.length >= 2) {
                              centerLng += coord[0];
                              centerLat += coord[1];
                              pointCount++;
                            }
                          });
                        }
                      });
                    }

                    if (pointCount > 0) {
                      centerLng /= pointCount;
                      centerLat /= pointCount;
                      const distance = Math.sqrt(
                        Math.pow(centerLng - lng, 2) +
                          Math.pow(centerLat - lat, 2)
                      );

                      // Check if this point is inside the polygon (better match)
                      let isInside = false;
                      if (
                        geometry.type === "Polygon" &&
                        geometry.coordinates &&
                        geometry.coordinates[0]
                      ) {
                        const coords = geometry.coordinates[0];
                        // Simple point-in-polygon check
                        let inside = false;
                        for (
                          let i = 0, j = coords.length - 1;
                          i < coords.length;
                          j = i++
                        ) {
                          const xi = coords[i][0],
                            yi = coords[i][1];
                          const xj = coords[j][0],
                            yj = coords[j][1];
                          const intersect =
                            yi > lat !== yj > lat &&
                            lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
                          if (intersect) inside = !inside;
                        }
                        isInside = inside;
                      }

                      // Prefer buildings where point is inside, or closest building
                      if (
                        isInside ||
                        (!bestBuilding && distance < bestDistance)
                      ) {
                        if (isInside || distance < bestDistance) {
                          bestDistance = distance;
                          bestBuilding = feature;
                        }
                      }
                    }
                  } catch (e) {
                    // Skip this feature if calculation fails
                  }
                }
              });
            }
          }
        }

        // Use the best building found
        if (bestBuilding && bestBuilding.geometry) {
          let geometry = bestBuilding.geometry;

          // Handle MultiPolygon - use the first polygon
          if (
            geometry.type === "MultiPolygon" &&
            geometry.coordinates &&
            geometry.coordinates.length > 0
          ) {
            geometry = {
              type: "Polygon",
              coordinates: geometry.coordinates[0],
            };
          }

          if (geometry.type === "Polygon" && geometry.coordinates) {
            // Ensure coordinates are in correct format
            const coordinates = geometry.coordinates[0];
            if (coordinates && coordinates.length > 0) {
              // Convert coordinates if needed and close polygon
              const polygonCoords: [number, number][] = coordinates.map(
                (coord: any) => {
                  if (Array.isArray(coord) && coord.length >= 2) {
                    return [coord[0], coord[1]] as [number, number];
                  }
                  return coord;
                }
              );

              // Close the polygon if not already closed
              const first = polygonCoords[0];
              const last = polygonCoords[polygonCoords.length - 1];
              if (
                first &&
                last &&
                (first[0] !== last[0] || first[1] !== last[1])
              ) {
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

              try {
                drawRef.current?.add(polygon as any);
                // Small delay to ensure polygon is added before calculating area
                setTimeout(() => {
                  updateArea();
                }, 100);
                return; // Successfully used Mapbox detection
              } catch (err) {
                console.error("Error adding detected polygon:", err);
              }
            }
          }
        }
      } catch (err) {
        console.log(
          "Mapbox building detection not available, using fallback:",
          err
        );
      }

      // Fallback: Create a simple square polygon (temporary approximation)
      // This is what currently exists - replace with Google Solar API data
      const offset = 0; // ~15 meters offset for building outline
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
        // Small delay to ensure polygon is added before calculating area
        setTimeout(() => {
          updateArea();
        }, 100);
      } catch (err) {
        console.error("Error adding fallback polygon:", err);
      }
    },
    [updateArea]
  );

  // Update map location when address changes (only when address actually changes, not on marker drag)
  useEffect(() => {
    if (!data.address) return;

    // Only update if address actually changed (not just coordinate update from drag)
    if (addressRef.current === data.address) {
      return; // Address hasn't changed, don't reload
    }

    // Update the tracked address
    addressRef.current = data.address;

    const updateMapLocation = async () => {
      // Wait for map to be initialized
      if (!mapRef.current) {
        // Wait a bit and try again
        setTimeout(() => updateMapLocation(), 200);
        return;
      }

      // Wait for map to be loaded
      if (!mapRef.current.loaded()) {
        mapRef.current.once("load", updateMapLocation);
        return;
      }
      try {
        const geoRes = await geocodingClient
          .forwardGeocode({ query: data.address!, limit: 1 })
          .send();

        if (geoRes.body.features.length > 0) {
          const feature = geoRes.body.features[0];
          // Use geometry center for more accurate location if available
          let lng: number, lat: number;
          if (
            feature.geometry &&
            feature.geometry.type === "Point" &&
            feature.geometry.coordinates
          ) {
            [lng, lat] = feature.geometry.coordinates;
          } else {
            [lng, lat] = feature.center;
          }

          if (lng && lat) {
            // Save address and coordinates to localStorage immediately
            if (typeof window !== "undefined") {
              const currentForm = JSON.parse(
                localStorage.getItem("currentEstimateForm") || "{}"
              );
              currentForm.address = data.address;
              currentForm.coordinates = { lat, lng };
              localStorage.setItem(
                "currentEstimateForm",
                JSON.stringify(currentForm)
              );
            }

            // Remove existing marker if any
            if (markerRef.current) {
              try {
                (markerRef.current as mapboxgl.Marker).remove();
              } catch (e) {
                // Ignore errors
              }
              markerRef.current = null;
            }

            // Store exact coordinates for marker (fixed location from address)
            const markerLng = lng;
            const markerLat = lat;

            // Update map center first - use geometry center for better accuracy
            mapRef.current!.flyTo({
              center: [markerLng, markerLat] as [number, number],
              zoom: 21,
            });

            // Wait for map to finish moving, then add marker at exact location
            mapRef.current.once("moveend", () => {
              if (!mapRef.current) return;

              // Use Mapbox default marker (no color property = default blue pin)
              // This ensures marker stays at exact coordinates during zoom/pan
              const marker = new mapboxgl.Marker({
                draggable: false, // Marker is fixed, cannot be moved
              })
                .setLngLat([markerLng, markerLat]) // Exact coordinates from address - Mapbox handles positioning
                .addTo(mapRef.current!);

              markerRef.current = marker;

              // Update coordinates state for display
              const initialCoords = { lat: markerLat, lng: markerLng };
              setCoordinates(initialCoords);

              // Update coordinates in formData
              onInputChange("coordinates", initialCoords);

              // Auto-detect roof geometry after marker is added
              setTimeout(() => {
                if (drawRef.current && mapRef.current) {
                  autoDetectRoofGeometry(markerLng, markerLat);
                }
              }, 500);
            });
          }
        }
      } catch (err) {
        console.error("Geocoding error:", err);
      }
    };

    // Wait for map to be fully loaded before updating location
    const waitForMapAndUpdate = () => {
      if (mapRef.current && mapRef.current.loaded()) {
        updateMapLocation();
      } else if (mapRef.current) {
        // Wait for map to load if not ready yet
        mapRef.current.once("load", () => {
          updateMapLocation();
        });
      } else {
        // Map not initialized yet, try again after a short delay
        setTimeout(() => {
          if (mapRef.current && mapRef.current.loaded()) {
            updateMapLocation();
          }
        }, 500);
      }
    };

    waitForMapAndUpdate();
  }, [data.address]); // Only depend on address, not autoDetectRoofGeometry to prevent reload on drag

  const handleAddressChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    onInputChange("address", value);
    // Don't update addressRef here - let useEffect handle it when address is actually set

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
    // Address will be updated, useEffect will handle the map update
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-600">
        Enter your property address and we&apos;ll automatically detect your
        roof geometry.
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

      {/* Map Container - Always render for map initialization */}
      <div className="relative w-full h-96 md:h-[500px] rounded-lg overflow-hidden border border-gray-300">
        <div ref={mapContainerRef} className="w-full h-full" />
        {/* Default Mapbox pin marker will be shown via markerRef */}
        {!data.address && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <p className="text-gray-500 text-sm">
              Enter address above to view map
            </p>
          </div>
        )}
      </div>
      {/* Confirm Button and Area Display - Below Map */}
      {coordinates && (
        <div className="flex items-center justify-between gap-4 mt-4">
          {/* Roof Area Display - Show next to button */}
          {totalArea > 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex-1">
              <p className="text-xs font-semibold text-green-900 mb-1">
                AI Detected Roof Area
              </p>
              <p className="text-xl font-bold text-green-600">
                {totalArea.toFixed(2)}{" "}
                <span className="text-base font-normal text-gray-600">
                  sq ft
                </span>
              </p>
            </div>
          ) : (
            <div className="flex-1 text-sm text-gray-500">
              Detecting building roof...
            </div>
          )}

          <button
            onClick={() => {
              setPinConfirmed(true);
              onInputChange("pinConfirmed", true);
            }}
            className={`px-8 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              pinConfirmed
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-blue-800 text-white hover:bg-blue-900"
            }`}
          >
            {pinConfirmed ? "✓ Location Confirmed" : "Confirm Location"}
          </button>
        </div>
      )}
    </div>
  );
}

// Step 2: Roof Steepness (Updated with new options)
function Step3({
  data,
  onInputChange,
}: {
  data: EstimateData;
  onInputChange: (field: keyof EstimateData, value: any) => void;
}) {
  const options = [
    {
      value: "Flat",
      label: "Flat",
      description: "Very easy to walk on",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="34"
          viewBox="0 0 40 34"
          fill="none"
          className="w-10 h-10"
        >
          <path
            d="M3.25244 25.1586V14.6086L16.559 22.3873V33.0638L3.25244 25.1586Z"
            fill="transparent"
          ></path>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M2.98762 14.149C3.15242 14.0544 3.3552 14.0552 3.51923 14.1511L16.8258 21.9298C16.9885 22.0249 17.0885 22.1992 17.0885 22.3877V33.0641C17.0885 33.2548 16.9862 33.4308 16.8205 33.5251C16.6548 33.6194 16.4512 33.6175 16.2873 33.5201L2.98068 25.6149C2.8198 25.5193 2.72119 25.3461 2.72119 25.1589V14.609C2.72119 14.419 2.82282 14.2435 2.98762 14.149ZM3.78194 15.5334V24.8571L16.0278 32.1321V22.692L3.78194 15.5334Z"
            fill="#4B5563"
          ></path>
          <path
            d="M36.7885 21.2807L16.5586 33.0648V22.5651L36.7885 11.0676V21.2807Z"
            fill="transparent"
          ></path>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M37.0544 10.6096C37.2176 10.7045 37.318 10.8791 37.318 11.068V21.281C37.318 21.4698 37.2177 21.6443 37.0546 21.7393L16.8247 33.5234C16.6606 33.619 16.458 33.6196 16.2934 33.525C16.1288 33.4304 16.0273 33.255 16.0273 33.0651V22.5655C16.0273 22.3747 16.1298 22.1986 16.2957 22.1043L36.5256 10.6069C36.6898 10.5136 36.8912 10.5146 37.0544 10.6096ZM17.0881 22.8741V32.1424L36.2573 20.9762V11.9795L17.0881 22.8741Z"
            fill="#4B5563"
          ></path>
          <path
            d="M16.6869 22.811L1.34424 13.9144L23.285 0.93457L38.6579 9.96152L16.6869 22.811Z"
            fill="#10B981"
          ></path>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M23.0141 0.478681C23.1801 0.380468 23.3863 0.380132 23.5527 0.477805L38.9255 9.50475C39.0879 9.60008 39.1875 9.77432 39.1874 9.96257C39.1872 10.1508 39.0872 10.3249 38.9247 10.4199L16.9538 23.2694C16.789 23.3657 16.5851 23.3661 16.4199 23.2703L1.07731 14.3738C0.914416 14.2793 0.813815 14.1056 0.812993 13.9173C0.812171 13.729 0.911251 13.5544 1.07332 13.4585L23.0141 0.478681ZM23.2851 1.5508L2.39277 13.9104L16.6849 22.1978L37.608 9.96118L23.2851 1.5508Z"
            fill="#059669"
          ></path>
        </svg>
      ),
    },
    {
      value: "Low",
      label: "Low",
      description: "Easy to walk on",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="34"
          viewBox="0 0 40 34"
          fill="none"
          className="w-10 h-10"
        >
          <path
            d="M2.55469 25.2915V14.8957L4.93814 12.8672L16.2976 24.0238V33.4561L2.55469 25.2915Z"
            fill="transparent"
            stroke="#4B5563"
            strokeWidth="1.09554"
            strokeLinejoin="round"
          ></path>
          <path
            d="M16.3989 33.3041V23.9225L37.2921 15.0986V21.1333L16.3989 33.3041Z"
            fill="transparent"
            stroke="#4B5563"
            strokeWidth="1.09554"
            strokeLinejoin="round"
          ></path>
          <path
            d="M25.8823 0.543945L4.83691 12.8162L18.6305 26.1025L39.2701 13.7796L25.8823 0.543945Z"
            fill="#10B981"
            stroke="#059669"
            strokeWidth="1.09554"
            strokeLinejoin="round"
          ></path>
        </svg>
      ),
    },
    {
      value: "Moderate",
      label: "Moderate",
      description: "Fairly easy to walk on",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="38"
          height="38"
          viewBox="0 0 38 38"
          fill="none"
          className="w-10 h-10"
        >
          <path
            d="M2.11334 29.3199V18.9162L6.21939 12.8206L15.5811 27.3216L15.4235 37.2274L2.11334 29.3199Z"
            fill="transparent"
          ></path>
          <path
            d="M2.11353 18.9161V29.3198L15.4237 37.2273L15.5813 27.3215"
            stroke="#4B5563"
            strokeWidth="1.06105"
            strokeLinejoin="round"
          ></path>
          <path
            d="M35.7564 25.2922L15.521 37.0798V28.206L35.7564 19.4475V25.2922Z"
            fill="transparent"
            stroke="#4B5563"
            strokeWidth="1.06105"
            strokeLinejoin="round"
          ></path>
          <path
            d="M0.812622 20.9606L6.03004 12.7344"
            stroke="#059669"
            strokeWidth="1.06105"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M26.5199 0.772705L6.13708 12.6586L17.1983 31.0259L37.1881 19.091L26.5199 0.772705Z"
            fill="#10B981"
            stroke="#059669"
            strokeWidth="1.06105"
            strokeLinejoin="round"
          ></path>
        </svg>
      ),
    },
    {
      value: "Steep",
      label: "Steep",
      description: "Hard to walk on",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="38"
          height="48"
          viewBox="0 0 38 48"
          fill="none"
          className="w-10 h-12"
        >
          <path
            d="M2.64819 38.7374V28.8058L9.48782 13.3271L15.9326 36.02L15.7772 46.5373L2.64819 38.7374Z"
            fill="transparent"
            stroke="#4B5563"
            strokeWidth="1.04661"
            strokeLinejoin="round"
          ></path>
          <path
            d="M1.18213 32.016L9.48784 13.3271"
            stroke="#059669"
            strokeWidth="1.04661"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M15.8755 46.3919L35.8355 34.7647V28.9995"
            stroke="#4B5563"
            strokeWidth="1.04661"
            strokeLinejoin="round"
          ></path>
          <path
            d="M29.6955 1.46265L9.59009 13.1867L17.1004 40.2906L36.8182 28.5181L29.6955 1.46265Z"
            fill="#10B981"
            stroke="#059669"
            strokeWidth="1.04661"
            strokeLinejoin="round"
          ></path>
        </svg>
      ),
    },
    {
      value: "Very Steep",
      label: "Very Steep",
      description: "Very hard to walk on",
      icon: (
        <svg
          fill="#10B981"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 356.637 356.637"
          className="w-10 h-10"
        >
          <path d="M290.562,103.916c0.162-0.811,0.366-1.609,0.366-2.459V12.298C290.928,5.51,285.422,0,278.63,0h-43.042 c-6.792,0-12.298,5.51-12.298,12.298v21.84l-25.425-26.37c-5.002-4.999-11.715-7.461-18.896-7.064 c-6.566,0.405-12.809,3.245-17.585,8.034l-124.11,125.05c-4.225,4.251-4.201,11.13,0.054,15.348 c3.771,3.744,9.581,4.125,13.793,1.225v193.979c0,6.785,5.51,12.298,12.298,12.298h79.936h67.638h79.936 c6.791,0,12.298-5.513,12.298-12.298V148.337l0.618,0.646c2.138,2.2,4.979,3.32,7.818,3.32c2.715,0,5.429-1.015,7.53-3.044 c4.317-4.161,4.443-11.031,0.288-15.342L290.562,103.916z M247.886,24.596h18.446V71.77l-18.446-18.447V24.596z M155.652,332.041 v-79.936h43.042v79.936H155.652z M278.63,122.979v209.062h-55.34v-92.233c0-6.785-5.507-12.298-12.298-12.298h-67.638 c-6.789,0-12.298,5.513-12.298,12.298v92.233h-55.34V129.127c0-0.997-0.153-1.955-0.375-2.882L176.762,24.056 c0.976-0.979,2.306-1.612,3.54-1.685c1.446-0.111,2.011,0.541,2.077,0.606l96.27,99.866 C278.642,122.885,278.63,122.931,278.63,122.979z" />
          <path d="M135.668,156.797c0,24.583,19.996,44.58,44.579,44.58c24.584,0,44.58-19.996,44.58-44.58s-19.996-44.58-44.58-44.58 C155.664,112.218,135.668,132.214,135.668,156.797z M203.306,156.797c0,12.709-10.347,23.059-23.059,23.059 c-12.715,0-23.058-10.35-23.058-23.059c0-12.709,10.343-23.058,23.058-23.058C192.959,133.739,203.306,144.088,203.306,156.797z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <p className="text-gray-600">How steep is your roof?</p>
      <div className="grid grid-cols-1 gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onInputChange("roofSteepness", option.value)}
            className={`p-4 border-2 rounded-lg transition-all flex items-center gap-4 ${
              data.roofSteepness === option.value
                ? "border-green-600 bg-green-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
              {option.icon}
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900">{option.label}</div>
              <div className="text-sm text-gray-600 mt-1">
                {option.description}
              </div>
            </div>
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
  const options = [
    {
      value: "Residential",
      label: "Residential",
      image: "https://app.roofr.com/images/estimator/residential.jpeg",
    },
    {
      value: "Commercial",
      label: "Commercial",
      image: "https://app.roofr.com/images/estimator/commercial.jpeg",
    },
  ];

  return (
    <div className="space-y-6">
      <p className="text-gray-600">What type of building is this?</p>
      <div className="grid grid-cols-2 gap-4">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onInputChange("buildingType", option.value)}
            className={`p-6 border-2 rounded-lg text-center transition-all overflow-hidden ${
              data.buildingType === option.value
                ? "border-green-600 bg-green-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="w-full h-44 rounded mb-3 overflow-hidden bg-gray-100">
              <Image
                src={option.image}
                alt={option.label}
                width={400}
                height={300}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            <div className="font-semibold text-gray-900 text-lg">
              {option.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Step 4: Current Roof Type (Updated with images and new materials)
function Step5({
  data,
  onInputChange,
}: {
  data: EstimateData;
  onInputChange: (field: keyof EstimateData, value: any) => void;
}) {
  // Roof material specific images - each material has its own image
  const options = [
    {
      value: "Asphalt",
      label: "Asphalt",
      image:
        "https://app.roofr.com/images/instant-estimates/materials/asphalt.jpg",
    },
    {
      value: "Metal",
      label: "Metal",
      image:
        "https://app.roofr.com/images/instant-estimates/materials/metal.jpg",
    },
    {
      value: "Tile",
      label: "Tile",
      image:
        "https://app.roofr.com/images/instant-estimates/materials/tile.jpg",
    },
    {
      value: "Cedar",
      label: "Cedar",
      image:
        "https://app.roofr.com/images/instant-estimates/materials/cedar.jpg",
    },
    {
      value: "BUR",
      label: "BUR (Built-Up Roofing)",
      image:
        "https://pmsilicone.com/wp-content/uploads/2023/04/BUR1-1536x1098.jpg",
    },
    {
      value: "PVC",
      label: "PVC",
      image: "https://www.billraganroofing.com/hubfs/FlatRoofPVC.jpg",
    },
    {
      value: "TPO",
      label: "TPO",
      image:
        "https://pmsilicone.com/wp-content/uploads/2022/11/TPO-Roof-768x576.jpg",
    },
    {
      value: "EPDM",
      label: "EPDM",
      image:
        "https://colonyroofers.com/hs-fs/hubfs/EPDM%20Roofing%20Material.jpg?width=1350&height=600&name=EPDM%20Roofing%20Material.jpg",
    },
  ];

  return (
    <div className="space-y-6">
      <p className="text-gray-600">What is currently on your roof?</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onInputChange("currentRoofType", option.value)}
            className={`p-4 border-2 rounded-lg text-center transition-all overflow-hidden ${
              data.currentRoofType === option.value
                ? "border-green-600 bg-green-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="w-full h-36 rounded mb-2 overflow-hidden bg-gray-100">
              <Image
                src={option.image}
                alt={option.label}
                width={400}
                height={300}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            <div className="font-semibold text-sm text-gray-900">
              {option.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Step 5: Roof Layers (New step)
function Step5Layers({
  data,
  onInputChange,
}: {
  data: EstimateData;
  onInputChange: (field: keyof EstimateData, value: any) => void;
}) {
  const options = [
    {
      value: "1",
      label: "1 Layer",
      image:
        "https://litespeedconstruction.com/wp-content/uploads/2020/09/86BD1AC9-DE36-4336-B6F9-4A1DA0417EF0-2048x1536.jpeg",
      hasImage: true,
    },
    {
      value: "2",
      label: "2 Layers",
      image:
        "https://sundownexteriors.com/wp-content/uploads/2022/02/two-layers-roof-shingles.jpg",
      hasImage: true,
    },
    {
      value: "3",
      label: "3 Layers",
      image:
        "https://safeharborinspections.com/wp-content/uploads/2021/02/roof-shigle-layers-1100x619.png",
      hasImage: true,
    },
    {
      value: "I do not know",
      label: "I do not know",
      image: "",
      hasImage: false,
    },
  ];

  return (
    <div className="space-y-6">
      <p className="text-gray-600">How many layers currently on your roof?</p>
      <div className="grid grid-cols-2 gap-4">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onInputChange("roofLayers", option.value)}
            className={`p-6 border-2 rounded-lg text-center transition-all overflow-hidden ${
              data.roofLayers === option.value
                ? "border-green-600 bg-green-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            {option.hasImage ? (
              <div className="w-full h-40 rounded mb-3 overflow-hidden bg-gray-100">
                <Image
                  src={option.image}
                  alt={option.label}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-full h-40 rounded mb-3 overflow-hidden bg-gray-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            )}
            <div className="font-semibold text-gray-900 text-lg">
              {option.label}
            </div>
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
  // Same roof material images as Step 5 for consistency
  const options = [
    {
      value: "Asphalt",
      label: "Asphalt",
      image:
        "https://app.roofr.com/images/instant-estimates/materials/asphalt.jpg",
    },
    {
      value: "Metal",
      label: "Metal",
      image:
        "https://app.roofr.com/images/instant-estimates/materials/metal.jpg",
    },
    {
      value: "Tile",
      label: "Tile",
      image:
        "https://app.roofr.com/images/instant-estimates/materials/tile.jpg",
    },
  ];

  return (
    <div className="space-y-6">
      <p className="text-gray-600">What type of roof would you like?</p>
      <div className="grid grid-cols-3 gap-4">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onInputChange("desiredRoofType", option.value)}
            className={`p-4 border-2 rounded-lg text-center transition-all overflow-hidden ${
              data.desiredRoofType === option.value
                ? "border-green-600 bg-green-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="w-full h-44 rounded mb-3 overflow-hidden bg-gray-100">
              <Image
                src={option.image}
                alt={option.label}
                width={400}
                height={300}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            <div className="font-semibold text-gray-900">{option.label}</div>
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
      <p className="text-gray-600">
        When would you like to start your project?
      </p>
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
      <p className="text-gray-600">Tell us about your project (optional)</p>
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

// Step 10: Contact Information (Updated with firstName/lastName split and validation)
function Step10({
  data,
  onInputChange,
}: {
  data: EstimateData;
  onInputChange: (field: keyof EstimateData, value: any) => void;
}) {
  const [emailError, setEmailError] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string>("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    // Basic phone validation - allows various formats
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-600">Where should we send your estimate?</p>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={data.firstName || ""}
              onChange={(e) => {
                onInputChange("firstName", e.target.value);
              }}
              placeholder="John"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={data.lastName || ""}
              onChange={(e) => {
                onInputChange("lastName", e.target.value);
              }}
              placeholder="Doe"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={data.email || ""}
            onChange={(e) => {
              const email = e.target.value;
              onInputChange("email", email);
              if (email && !validateEmail(email)) {
                setEmailError("Please enter a valid email address");
              } else {
                setEmailError("");
              }
            }}
            onBlur={(e) => {
              if (e.target.value && !validateEmail(e.target.value)) {
                setEmailError("Please enter a valid email address");
              } else {
                setEmailError("");
              }
            }}
            placeholder="john@example.com"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              emailError ? "border-red-300" : "border-gray-300"
            }`}
            required
          />
          {emailError && (
            <p className="text-xs text-red-600 mt-1">{emailError}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone *
          </label>
          <input
            type="tel"
            value={data.phone || ""}
            onChange={(e) => {
              const phone = e.target.value;
              onInputChange("phone", phone);
              if (phone && !validatePhone(phone)) {
                setPhoneError("Please enter a valid phone number");
              } else {
                setPhoneError("");
              }
            }}
            onBlur={(e) => {
              if (e.target.value && !validatePhone(e.target.value)) {
                setPhoneError("Please enter a valid phone number");
              } else {
                setPhoneError("");
              }
            }}
            placeholder="+1 (555) 123-4567"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              phoneError ? "border-red-300" : "border-gray-300"
            }`}
            required
          />
          {phoneError && (
            <p className="text-xs text-red-600 mt-1">{phoneError}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Step 11: Review Estimates (Updated with Admin toggle ON/OFF)
function Step11({
  data,
  onInputChange,
}: {
  data: EstimateData;
  onInputChange: (field: keyof EstimateData, value: any) => void;
}) {
  // Use estimates from data if available, otherwise use default
  const estimates = data.estimates || [
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

  const handleToggleEstimate = (index: number) => {
    const updatedEstimates = [...estimates];
    updatedEstimates[index] = {
      ...updatedEstimates[index],
      enabled: !updatedEstimates[index].enabled,
    };
    onInputChange("estimates", updatedEstimates);
  };

  // For now, show all estimates with toggles (Admin functionality would be backend-driven)
  const isAdmin = false; // This would come from auth context in production

  return (
    <div className="space-y-6">
      <p className="text-gray-600 mb-6">Review your estimate:</p>
      {isAdmin && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800 font-semibold">
            Admin Mode: Toggle which estimates appear to customers
          </p>
        </div>
      )}
      <div className="space-y-4">
        {estimates.map((estimate, index) => (
          <div
            key={index}
            className={`border-2 rounded-lg p-6 transition-all ${
              estimate.enabled !== false
                ? "border-gray-200 hover:border-green-600"
                : "border-gray-200 bg-gray-50 opacity-60"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {estimate.type}
                </h3>
                {estimate.enabled !== false && (
                  <>
                    <p className="text-2xl font-bold text-green-600">
                      ${estimate.minPrice.toLocaleString()} - $
                      {estimate.maxPrice.toLocaleString()}*
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      *Preliminary estimate. Final pricing subject to
                      inspection.
                    </p>
                  </>
                )}
                {estimate.enabled === false && (
                  <p className="text-sm text-gray-500 italic">
                    This estimate is hidden
                  </p>
                )}
              </div>
              {(isAdmin || true) && ( // Always show toggle for now - in production, check admin role
                <label className="flex items-center ml-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={estimate.enabled !== false}
                    onChange={() => handleToggleEstimate(index)}
                    className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    {estimate.enabled !== false ? "Show" : "Hide"}
                  </span>
                </label>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
        <p className="text-xs text-gray-600">
          <span className="font-semibold">Note:</span> Only enabled estimates
          will be sent to the customer.
          {!isAdmin && " Admin can toggle estimates on/off."}
        </p>
      </div>
    </div>
  );
}
