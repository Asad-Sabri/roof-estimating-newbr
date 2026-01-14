"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Printer,
  ArrowLeft,
  Globe,
  Phone,
  Mail,
  BadgeCheck,
} from "lucide-react";

type EstimateRecord = {
  id: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
  totalArea?: number;
  roofSteepness?: string;
  buildingType?: string;
  currentRoofType?: string;
  roofLayers?: string;
  desiredRoofType?: string;
  projectTimeline?: string;
  projectDescription?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  estimates?: Array<{
    type: string;
    minPrice: number;
    maxPrice: number;
    enabled?: boolean;
  }>;
  createdAt?: string;
};

type CompanyProfile = {
  companyName: string;
  licenseNumber?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  accentHex?: string;
  disclaimer?: string;
  addressLine?: string;
};

const DEFAULT_COMPANY: CompanyProfile = {
  companyName: "Superior Pro Roofing Systems",
  licenseNumber: "LIC #123456",
  phone: "(555) 123-4567",
  email: "info@superiorproroofs.com",
  website: "www.superiorproroofs.com",
  logoUrl: "https://app.roofr.com/images/estimator/residential.jpeg",
  accentHex: "#065f46",
  disclaimer:
    "Preliminary estimate only. Formal estimate subject to inspection, scope confirmation, and material selection. Pricing is preliminary and non‑binding until verified by an authorized project specialist.",
  addressLine: "123 Main St, Suite 100, Anytown, USA",
};

function useCompanyProfile(): [CompanyProfile, (profile: CompanyProfile) => void] {
  const [profile, setProfile] = useState<CompanyProfile>(DEFAULT_COMPANY);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("companyProfile");
      if (saved) {
        setProfile({ ...DEFAULT_COMPANY, ...JSON.parse(saved) });
      }
    } catch {
      setProfile(DEFAULT_COMPANY);
    }
  }, []);
  const save = (p: CompanyProfile) => {
    setProfile(p);
    if (typeof window !== "undefined") {
      localStorage.setItem("companyProfile", JSON.stringify(p));
    }
  };
  return [profile, save];
}

function currency(n: number | undefined) {
  if (!n && n !== 0) return "—";
  return `$${Math.round(n).toLocaleString()}`;
}

export default function EstimateReportPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [company] = useCompanyProfile();
  const [estimate, setEstimate] = useState<EstimateRecord | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const all = JSON.parse(localStorage.getItem("customerEstimates") || "[]") as EstimateRecord[];
    const rec = all.find((e) => e.id === params?.id) || all[all.length - 1] || null;
    setEstimate(rec);
  }, [params?.id]);

  const highlight = useMemo(() => {
    if (!estimate?.estimates || estimate.estimates.length === 0) return null;
    const map: Record<string, string> = {
      Asphalt: "Asphalt Roof",
      Metal: "Metal Roof",
      Tile: "Tile Roof",
    };
    const wanted = map[estimate.desiredRoofType || ""] || "";
    const match =
      estimate.estimates.find((e) => e.type === wanted && e.enabled !== false) ||
      estimate.estimates.find((e) => e.enabled !== false) ||
      estimate.estimates[0];
    return match;
  }, [estimate]);

  const otherOptions = useMemo(() => {
    if (!estimate?.estimates) return [];
    return estimate.estimates.filter((e) => e !== highlight && e.enabled !== false);
  }, [estimate, highlight]);

  if (!estimate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-lg w-full bg-white rounded-xl shadow p-8 text-center">
          <p className="text-gray-600 mb-4">No estimate found.</p>
          <button
            onClick={() => router.push("/customer-panel/estimating")}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Go to Estimating
          </button>
        </div>
      </div>
    );
  }

  const accent = company.accentHex || "#065f46";
  const customerName =
    estimate.firstName && estimate.lastName
      ? `${estimate.firstName} ${estimate.lastName}`
      : estimate.name || "Customer";

  const staticMapUrl =
    estimate.coordinates && process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      ? `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/pin-l+ff0000(${estimate.coordinates.lng},${estimate.coordinates.lat})/${estimate.coordinates.lng},${estimate.coordinates.lat},18/600x360@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
      : "";

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <div className="sticky top-0 z-10 print:hidden bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-black hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 text-black" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all"
              style={{ backgroundColor: "#8b0e0f" }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#6d0b0c"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#8b0e0f"}
            >
              <Printer className="w-4 h-4" />
              Download Report
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto bg-white shadow print:shadow-none print:border-0 my-6 print:my-0 rounded-xl print:rounded-none overflow-hidden">
        <div className="px-8 py-6 flex items-center justify-between border-b">
          <div className="flex items-center gap-4">
            {company.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={company.logoUrl}
                alt="Company Logo"
                className="h-12 w-12 rounded object-cover"
              />
            ) : null}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{company.companyName}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                {company.licenseNumber && (
                  <span className="inline-flex items-center gap-1">
                    <BadgeCheck className="w-4 h-4 text-emerald-600" />
                    {company.licenseNumber}
                  </span>
                )}
                {company.addressLine && <span>{company.addressLine}</span>}
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>{company.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>{company.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>{company.website}</span>
            </div>
          </div>
        </div>

        <div className="px-8 pt-6">
          <p className="text-xs uppercase text-gray-500">Preliminary</p>
          <h2 className="text-2xl font-extrabold mt-1" style={{ color: "#8b0e0f" }}>
            Roofing Estimate For: <span className="text-black">{customerName}</span>
          </h2>
          {estimate.address && (
            <p className="text-sm text-gray-700 mt-1">{estimate.address}</p>
          )}
        </div>

        <div className="px-8 pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg overflow-hidden border bg-gray-50">
            {staticMapUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={staticMapUrl} alt="Map" className="w-full h-56 object-cover" />
            ) : (
              <div className="w-full h-56 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                Map preview not available
              </div>
            )}
          </div>
          <div className="rounded-lg border">
            <div className="px-5 py-4 border-b bg-gray-50 font-semibold">Roof Details</div>
            <div className="px-5 py-4 grid grid-cols-2 gap-y-2 text-sm">
              <div className="text-gray-500">Building</div>
              <div className="font-medium text-gray-900">
                {estimate.buildingType || "N/A"}
              </div>
              <div className="text-gray-500">Steepness</div>
              <div className="font-medium text-gray-900">
                {estimate.roofSteepness || "N/A"}
              </div>
              <div className="text-gray-500">Current Roof</div>
              <div className="font-medium text-gray-900">
                {estimate.currentRoofType || "N/A"}
              </div>
              <div className="text-gray-500">Desired Roof</div>
              <div className="font-medium text-gray-900">
                {estimate.desiredRoofType || "N/A"}
              </div>
              <div className="text-gray-500">Layers</div>
              <div className="font-medium text-gray-900">
                {estimate.roofLayers || "N/A"}
              </div>
              <div className="text-gray-500">Total Area</div>
              <div className="font-medium text-gray-900">
                {estimate.totalArea ? `${Math.round(estimate.totalArea).toLocaleString()} sq ft` : "N/A"}
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="rounded-xl border overflow-hidden">
              <div className="px-5 py-3 text-white font-semibold" style={{ backgroundColor: "#8b0e0f" }}>
                Your Estimate
              </div>
              <div className="px-5 py-6 text-center">
                <div className="text-3xl font-black text-emerald-700" style={{ color: "#8b0e0f"}}>
                  {currency(highlight?.minPrice)}
                </div>
                <div className="text-sm text-gray-500">to</div>
                <div className="text-2xl font-extrabold text-emerald-700" style={{ color: "#8b0e0f"}}>
                  {currency(highlight?.maxPrice)}
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  *Preliminary estimate. Subject to on-site inspection.
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="rounded-xl border overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 font-semibold border-b">
                Other Pricing Options
              </div>
              {otherOptions.length === 0 ? (
                <div className="px-5 py-4 text-sm text-gray-500">No alternate options available.</div>
              ) : (
                <ul className="divide-y">
                  {otherOptions.map((o, idx) => (
                    <li key={idx} className="px-5 py-3 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-800">{o.type}</span>
                      <span className="font-semibold text-emerald-700">
                        {currency(o.minPrice)} - {currency(o.maxPrice)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="px-8 pb-3">
          <div className="rounded-xl border overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 font-semibold border-b">
              Whats Included
            </div>
            <div className="px-5 py-5 text-sm grid grid-cols-1 md:grid-cols-2 gap-2">
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Tear-off and proper disposal of existing roofing materials.</li>
                <li>Install ice & water shield and synthetic underlayment.</li>
                <li>Flashings, pipe boots, vents, and necessary sealants.</li>
                <li>Starter, field, and ridge materials per selected system.</li>
              </ul>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Jobsite protection, magnet sweep, and daily cleanup.</li>
                <li>Manufacturer and workmanship warranty (per selection).</li>
                <li>Final walk-through with project specialist.</li>
                <li>Permit and inspection coordination where applicable.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="px-8 pt-2 pb-8">
          <div className="rounded-xl border overflow-hidden bg-blue-50 border-blue-200">
            <div className="px-5 py-4">
              <h3 className="font-bold text-gray-900">Next Steps</h3>
              <p className="text-sm text-gray-700 mt-1">
                Schedule your on-site inspection to confirm scope, finalize selections, and lock in final pricing.
              </p>
            </div>
            <div className="px-5 pb-5">
              <a
                href={`mailto:${company.email}?subject=Schedule%20Inspection&body=Hello%2C%20I%27d%20like%20to%20schedule%20an%20inspection%20for%20${encodeURIComponent(
                  estimate.address || ""
                )}`}
                className="inline-flex items-center justify-center px-5 py-2 rounded-lg text-white transition-all"
                style={{ backgroundColor: "#8b0e0f" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#6d0b0c"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#8b0e0f"}
              >
                Schedule Inspection
              </a>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            {company.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}


