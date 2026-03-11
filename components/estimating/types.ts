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
  textMessageOptIn?: boolean; // Text message opt-in consent
  // Customer Assignment Fields (from QR code/link)
  promoter_id?: string;
  sales_rep_id?: string;
  marketing_channel?: string;
  assignment_source?: "qr_code" | "link" | "direct_entry";
  estimates?: Array<{
    type: string;
    minPrice: number;
    maxPrice: number;
    enabled?: boolean; // For admin toggle
  }>;
  /** Index of the single estimate selected by customer at Review step (only this one goes to report & API) */
  selectedEstimateIndex?: number;
}

export interface EstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EstimateData) => void;
  /** When true, do not restore from localStorage and start at step 1 with empty form (e.g. on /measurements page load/refresh) */
  resetFormOnMount?: boolean;
}

export interface StepProps {
  data: EstimateData;
  onInputChange: (field: keyof EstimateData, value: any) => void;
}
