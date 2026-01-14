"use client";

import Image from "next/image";
import { StepProps } from "../types";

export default function Step6DesiredRoofType({
  data,
  onInputChange,
}: StepProps) {
  // All roof material options from Step 5 (as per requirement)
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
      <p className="text-gray-600">What type of roof would you like?</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onInputChange("desiredRoofType", option.value)}
            className={`p-4 border-2 rounded-lg text-center transition-all overflow-hidden ${
              data.desiredRoofType === option.value
                ? ""
                : "border-gray-200 hover:border-gray-300"
            }`}
            style={data.desiredRoofType === option.value ? { borderColor: "#959595", backgroundColor: "rgba(149, 149, 149, 0.1)" } : {}}
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
