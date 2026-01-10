export interface EstimateData {
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

export interface EstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EstimateData) => void;
}

export interface StepProps {
  data: EstimateData;
  onInputChange: (field: keyof EstimateData, value: any) => void;
}
