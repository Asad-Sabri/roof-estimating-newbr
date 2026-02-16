"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";
import * as turf from "@turf/turf";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { StepProps } from "../types";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

const geocodingClient = mbxGeocoding({
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "",
});

export default function Step2Address({ data, onInputChange }: StepProps) {
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
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [webglUnavailable, setWebglUnavailable] = useState(false);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const markerFixedRef = useRef<boolean>(false); // true after Continue (marker fixed, zoom won't move it)
  const addressRef = useRef<string>(data.address || "");

  const showMap = !!(data.address && String(data.address).trim().length > 0);

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

  // Initialize map only when address field has text (showMap) and container is mounted
  useEffect(() => {
    if (!showMap || !mapContainerRef.current || mapRef.current) return;

    let map: mapboxgl.Map;
    try {
      map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/satellite-streets-v12",
        center: [0, 0], // World view center
        zoom: 2, // Full zoom out
        // Allow WebGL even when performance is limited (e.g. software renderer) – helps on some PCs
        failIfMajorPerformanceCaveat: false,
      });
    } catch (err) {
      console.warn("Failed to initialize WebGL/Mapbox map:", err);
      setWebglUnavailable(true);
      return;
    }

    const onMapError = (e: any) => {
      if (e?.error?.message?.includes("WebGL") || e?.error?.message?.includes("Failed to initialize")) {
        setWebglUnavailable(true);
        if (mapRef.current) {
          try { mapRef.current.remove(); } catch (_) {}
          mapRef.current = null;
        }
      }
    };
    map.on("error", onMapError);

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

    return () => {};
  }, [updateArea, webglUnavailable, showMap]);

  // Reverse geocode: lat,lng -> address string
  const reverseGeocodeAddress = useCallback(
    async (lng: number, lat: number): Promise<string> => {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token) return "";
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&limit=1`
        );
        const data = await res.json();
        if (data.features && data.features[0]) return data.features[0].place_name || "";
      } catch (e) {
        console.error("Reverse geocode error:", e);
      }
      return "";
    },
    []
  );

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
                updateArea(); // Call immediately instead of setTimeout
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
                updateArea(); // Call immediately instead of setTimeout
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
                updateArea(); // Call immediately instead of setTimeout
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

      // Fallback: chota square polygon taake roof dikhe jab APIs fail hon (offset ~20m)
      const offset = 0.00018; // ~20m in degrees, visible on map
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
        updateArea(); // Call immediately instead of setTimeout
      } catch (err) {
        console.error("Error adding fallback polygon:", err);
      }
    },
    [updateArea]
  );

  // Add or update marker at lat/lng; draggable until user clicks Continue again
  const addOrUpdateMarker = useCallback(
    (lng: number, lat: number, draggable: boolean) => {
      if (!mapRef.current) return;
      if (markerRef.current) {
        try {
          markerRef.current.remove();
        } catch (_) {}
        markerRef.current = null;
      }
      // Marker position: [lng, lat] – yahi coordinates map par dikhengi aur Continue ke baad isi jagah polygon banta hai
      const marker = new mapboxgl.Marker({ draggable })
        .setLngLat([lng, lat])
        .addTo(mapRef.current);
      markerRef.current = marker;
      markerFixedRef.current = !draggable;

      if (draggable) {
        marker.on("dragend", () => {
          const pos = marker.getLngLat();
          const coords = { lng: pos.lng, lat: pos.lat };
          setCoordinates({ lat: pos.lat, lng: pos.lng });
          onInputChange("coordinates", coords);
        });
      }
    },
    [onInputChange]
  );

  // Continue: (1) no coords → geocode, show draggable marker; (2) has coords → fix marker, reverse geocode, AI polygon, complete step
  const handleContinue = async () => {
    if (!data.address) return;

    if (!coordinates) {
      // First Continue: geocode address, show draggable marker at that location
      setIsGeocoding(true);
      const run = async () => {
        if (!mapRef.current) {
          setTimeout(run, 200);
          return;
        }
        if (!mapRef.current.loaded()) {
          mapRef.current.once("load", run);
          return;
        }
        try {
          const geoRes = await geocodingClient
            .forwardGeocode({ query: data.address!.trim(), limit: 1 })
            .send();
          if (geoRes.body.features.length > 0) {
            const feature = geoRes.body.features[0];
            let lng: number, lat: number;
            if (
              feature.geometry?.type === "Point" &&
              feature.geometry.coordinates
            ) {
              [lng, lat] = feature.geometry.coordinates;
            } else {
              [lng, lat] = feature.center;
            }
            // Marker position – geocode se mili jagah (lng, lat)
            if (lng != null && lat != null) {
              mapRef.current!.flyTo({
                center: [lng, lat],
                zoom: 19,
                duration: 1500,
              });
              mapRef.current!.once("moveend", () => {
                addOrUpdateMarker(lng, lat, true); // marker is jagah par
                const coords = { lat, lng };
                setCoordinates(coords);
                onInputChange("coordinates", coords);
                if (typeof window !== "undefined") {
                  const currentForm = JSON.parse(
                    localStorage.getItem("currentEstimateForm") || "{}"
                  );
                  currentForm.address = data.address;
                  currentForm.coordinates = coords;
                  localStorage.setItem("currentEstimateForm", JSON.stringify(currentForm));
                }
              });
            }
          }
        } catch (err) {
          console.error("Geocoding error:", err);
        } finally {
          setIsGeocoding(false);
        }
      };
      run();
      return;
    }

    // Second Continue: fix marker, AI polygon (marker position par), phir step complete – address background me update
    const marker = markerRef.current;
    if (!marker) return;
    const pos = marker.getLngLat();
    // Marker position – isi [lng, lat] par ghar ka polygon banega
    const lng = pos.lng;
    const lat = pos.lat;

    setIsGeocoding(true);
    try {
      marker.setDraggable(false);
      markerFixedRef.current = true;

      // Polygon ke liye drawRef zaroori hai – map load hone par set hota hai; thodi der wait karo agar null ho
      let waited = 0;
      while (!drawRef.current && mapRef.current && waited < 40) {
        await new Promise((r) => setTimeout(r, 100));
        waited++;
      }
      if (drawRef.current && mapRef.current) {
        await autoDetectRoofGeometry(lng, lat);
      }

      setPinConfirmed(true);
      onInputChange("pinConfirmed", true);

      // Address field reverse geocode se background me update (user ko wait nahi karna)
      reverseGeocodeAddress(lng, lat).then((addressStr) => {
        if (addressStr) onInputChange("address", addressStr);
        if (typeof window !== "undefined") {
          const currentForm = JSON.parse(
            localStorage.getItem("currentEstimateForm") || "{}"
          );
          currentForm.address = addressStr || data.address;
          currentForm.coordinates = { lat, lng };
          localStorage.setItem("currentEstimateForm", JSON.stringify(currentForm));
        }
      });
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleAddressChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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

  const handleSelectSuggestion = async (suggestion: string) => {
    onInputChange("address", suggestion);
    setSuggestions([]);
    // Geocode and show draggable marker at selected address
    setIsGeocoding(true);
    const run = async () => {
      if (!mapRef.current) {
        setTimeout(run, 300);
        return;
      }
      if (!mapRef.current.loaded()) {
        mapRef.current.once("load", run);
        return;
      }
      try {
        const geoRes = await geocodingClient
          .forwardGeocode({ query: suggestion, limit: 1 })
          .send();
        if (geoRes.body.features.length > 0) {
          const feature = geoRes.body.features[0];
          let lng: number, lat: number;
          if (
            feature.geometry?.type === "Point" &&
            feature.geometry.coordinates
          ) {
            [lng, lat] = feature.geometry.coordinates;
          } else {
            [lng, lat] = feature.center;
          }
          // Marker position – suggestion ki jagah (lng, lat)
          if (lng != null && lat != null) {
            mapRef.current!.flyTo({
              center: [lng, lat],
              zoom: 19,
              duration: 1500,
            });
            mapRef.current!.once("moveend", () => {
              addOrUpdateMarker(lng, lat, true); // marker is jagah par
              const coords = { lat, lng };
              setCoordinates(coords);
              onInputChange("coordinates", coords);
            });
          }
        }
      } catch (err) {
        console.error("Geocoding error:", err);
      } finally {
        setIsGeocoding(false);
      }
    };
    run();
  };

  return (
    <div className="space-y-6">
      {/* <p className="text-gray-600">
        Enter your property address and we&apos;ll automatically detect your
        roof geometry.
      </p> */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
          Property Address
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={data.address || ""}
              onChange={handleAddressChange}
              placeholder="123 Main St, City, State, ZIP"
              className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:outline-none"
              onFocus={(e) => e.currentTarget.style.boxShadow = "0 0 0 2px #8b0e0f"}
              onBlur={(e) => e.currentTarget.style.boxShadow = ""}
              required
            />
            {suggestions.length > 0 && (
              <div className="absolute text-black z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
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
          {/* Continue: first click = geocode + show marker; second click = fix marker + update address + AI polygon + next */}
          {data.address && (
            <button
              onClick={handleContinue}
              disabled={isGeocoding}
              className="px-6 py-3 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
              style={{ backgroundColor: "#8b0e0f" }}
              onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = "#6d0b0c")}
              onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = "#8b0e0f")}
            >
              {isGeocoding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Loading...
                </>
              ) : (
                "Continue"
              )}
            </button>
          )}
        </div>
        {/* <p className="text-xs text-gray-500 mt-2">
          AI will automatically draw the polygon for your roof
        </p> */}
      </div>

      {/* Map only when address field has text */}
      {!showMap ? (
        <div className="w-full h-64 rounded-lg border border-gray-300 bg-gray-100 flex items-center justify-center">
          <p className="text-gray-500 text-sm">Type address above to see map</p>
        </div>
      ) : (
        <div className="relative w-full h-96 md:h-[600px] rounded-lg overflow-hidden border border-gray-300">
          {webglUnavailable ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-100 p-6 text-center">
              <p className="text-gray-700 font-medium">
                Map is not available (WebGL could not be initialized).
              </p>
              <p className="text-gray-500 text-sm max-w-md">
                You can still enter your address above and click Continue to use your location.
              </p>
              <button
                type="button"
                onClick={() => setWebglUnavailable(false)}
                className="px-5 py-2.5 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#8b0e0e" }}
              >
                Try again
              </button>
            </div>
          ) : (
            <div ref={mapContainerRef} className="w-full h-full" />
          )}
        </div>
      )}

      {/* Roof area – polygon banne ke baad sq ft me dikhao */}
      {coordinates && (
        <div className="rounded-lg px-4 py-3 border border-red-200 bg-red-50/50">
          <p className="text-xs font-semibold mb-1" style={{ color: "#8b0e0f" }}>
            AI Detected Roof Area
          </p>
          <p className="text-xl font-bold" style={{ color: "#8b0e0f" }}>
            {totalArea > 0
              ? `${totalArea.toFixed(2)} sq ft`
              : "Detecting roof…"}
          </p>
        </div>
      )}
    </div>
  );
}
