"use client";

import React, { useState, useEffect } from "react";

export default function TopToolbar() {

  return (
    <div className="absolute top-0 left-0 w-full bg-[#0a1f44]/95 text-white flex justify-between items-center px-6 py-3 shadow-lg z-50 border-b border-gray-700">
      <h1 className="font-semibold text-lg tracking-wide">Superior Pro Roof Measurement Tool</h1>
      <div className="flex items-center gap-4">
        {/* ✅ Download PDF Button */}
        <button
          className="bg-blue-900 px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
}
