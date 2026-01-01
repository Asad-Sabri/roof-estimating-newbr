import { NextRequest, NextResponse } from "next/server";

/**
 * Google Solar API - Building Insights Endpoint
 * This calls Google Solar API to get automatic roof detection
 * 
 * Note: You'll need to:
 * 1. Enable Google Solar API in Google Cloud Console
 * 2. Add GOOGLE_SOLAR_API_KEY to .env.local
 * 3. Set up billing (Google Solar API requires billing)
 */

export async function POST(request: NextRequest) {
  try {
    const { lat, lng } = await request.json();

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_SOLAR_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Solar API key not configured" },
        { status: 500 }
      );
    }

    // Google Solar API endpoint
    const url = `https://solar.googleapis.com/v1/buildingInsights:findClosest`;

    const response = await fetch(
      `${url}?location.latitude=${lat}&location.longitude=${lng}&key=${apiKey}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Solar API error:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch building insights", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error: any) {
    console.error("Error in building-insights API:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

