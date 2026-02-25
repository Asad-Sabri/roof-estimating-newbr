"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, ArrowLeft } from "lucide-react";
import { getUserInstantEstimatesAPI } from "@/services/instantEstimateAPI";
import { getCompanyForCustomerAPI } from "@/services/companyAPI";
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";
import { EstimateReportContent } from "@/components/estimating/EstimateReportContent";
import type { EstimateRecord, CompanyProfile } from "@/components/estimating/EstimateReportContent";

const geocodingClient = mbxGeocoding({
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "",
});

const DEFAULT_COMPANY: CompanyProfile = {
  companyName: "Superior Pro Roofing Systems",
  licenseNumber: "LIC #123456",
  phone: "(555) 123-4567",
  email: "info@superiorproroofs.com",
  website: "www.superiorproroofs.com",
  addressLine: "123 Main St, Suite 100, Anytown, USA",
  disclaimer:
    "Preliminary estimate only. Formal estimate subject to inspection, scope confirmation, and material selection. Pricing is preliminary and non‑binding until verified by an authorized project specialist.",
  contactPersonName: "Person XXX",
  contactPersonPhone: "XXX-XXX-XXXX",
  contactPersonEmail: "GM@SuperiorRoofingCali.com",
  followUpText:
    "You can anticipate prompt follow-up from [Person XXX] at [Phone XXX-XXX-XXXX] and [Email GM@SuperiorRoofingCali.com] to schedule or confirm your inspection and discuss your estimate.\nVery truly yours,\nShafic XXXXX.",
};

function formatCompanyAddress(addr: any): string {
  if (!addr || typeof addr !== "object") return "";
  return [addr.street, addr.city, addr.state, addr.country, addr.zip_code].filter(Boolean).join(", ");
}

function mapCompanyFromAPI(raw: any): CompanyProfile {
  if (!raw) return DEFAULT_COMPANY;
  const data = raw?.data ?? raw;
  const r = data?.company && typeof data.company === "object" ? data.company : data;
  if (!r || typeof r !== "object") return DEFAULT_COMPANY;
  const address = r.address && typeof r.address === "object" ? r.address : undefined;
  const whatsIncludedRaw = r.whatsIncluded ?? r.whats_included;
  const whatsIncluded = Array.isArray(whatsIncludedRaw)
    ? whatsIncludedRaw
    : typeof whatsIncludedRaw === "string"
      ? whatsIncludedRaw.split("\n").map((s: string) => s.trim()).filter(Boolean)
      : undefined;
  return {
    ...DEFAULT_COMPANY,
    companyName: r.companyName ?? r.company_name ?? DEFAULT_COMPANY.companyName,
    licenseNumber: r.licenseNumber ?? r.license_number ?? DEFAULT_COMPANY.licenseNumber,
    phone: r.mobile_number ?? r.phone ?? DEFAULT_COMPANY.phone,
    email: r.email ?? DEFAULT_COMPANY.email,
    website: r.website ?? DEFAULT_COMPANY.website,
    addressLine: formatCompanyAddress(address) || (r.addressLine ?? r.address_line ?? DEFAULT_COMPANY.addressLine),
    disclaimer: r.disclaimer ?? DEFAULT_COMPANY.disclaimer,
    contactPersonName: r.contactPersonName ?? r.contact_person_name ?? DEFAULT_COMPANY.contactPersonName,
    contactPersonPhone: r.contactPersonPhone ?? r.contact_person_phone ?? DEFAULT_COMPANY.contactPersonPhone,
    contactPersonEmail: r.contactPersonEmail ?? r.contact_person_email ?? DEFAULT_COMPANY.contactPersonEmail,
    followUpText: r.followUpText ?? r.follow_up_text ?? DEFAULT_COMPANY.followUpText,
    whatsIncluded: whatsIncluded && whatsIncluded.length > 0 ? whatsIncluded : undefined,
  };
}

/** API instant-estimate item ko EstimateRecord shape me map karta hai */
function apiItemToEstimateRecord(est: any): EstimateRecord {
  const addr = est.address || {};
  const addressStr = [addr.street, addr.city, addr.state, addr.zip_code]
    .filter(Boolean)
    .join(", ");
  const parsePriceRange = (pr: string) => {
    const m = (pr || "").match(/\$?\s*([\d,]+)\s*-\s*([\d,]+)/);
    if (!m) return { min: 0, max: 0 };
    return {
      min: parseInt(String(m[1]).replace(/,/g, ""), 10),
      max: parseInt(String(m[2]).replace(/,/g, ""), 10),
    };
  };
  const estimates = (est.estimate_price || []).map((ep: any) => {
    const { min, max } = parsePriceRange(ep.price_range);
    return { type: ep.title, minPrice: min, maxPrice: max, enabled: true };
  });
  return {
    id: est._id,
    address: addressStr || undefined,
    totalArea: est.area != null ? parseFloat(String(est.area)) : undefined,
    roofSteepness: est.roof_teep,
    buildingType: est.building_type,
    currentRoofType: est.current_roof_material,
    roofLayers: String(est.current_roof_layer ?? ""),
    desiredRoofType: est.roof_material,
    projectTimeline: est.timeline,
    firstName: est.first_name,
    lastName: est.last_name,
    email: est.email,
    phone: est.mobile_number,
    estimates,
    createdAt: est.createdAt,
  };
}

export default function EstimateReportPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [company, setCompany] = useState<CompanyProfile>(DEFAULT_COMPANY);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [estimate, setEstimate] = useState<EstimateRecord | null>(null);
  const [loading, setLoading] = useState(true);

  // Report par company: GET /api/company/for-customer – instant estimate report ke liye company details
  useEffect(() => {
    setCompanyLoading(true);
    getCompanyForCustomerAPI()
      .then((res: any) => {
        setCompany(mapCompanyFromAPI(res));
      })
      .catch(() => {
        setCompany(DEFAULT_COMPANY);
      })
      .finally(() => setCompanyLoading(false));
  }, [params?.id]);

  useEffect(() => {
    if (!params?.id) {
      setLoading(false);
      return;
    }
    if (typeof window === "undefined") return;

    const fromLocal = () => {
      const all = JSON.parse(
        localStorage.getItem("customerEstimates") || "[]"
      ) as EstimateRecord[];
      return all.find((e) => e.id === params.id) ?? null;
    };

    const rec = fromLocal();
    if (rec) {
      setEstimate(rec);
      setLoading(false);
      return;
    }

    setLoading(true);
    getUserInstantEstimatesAPI()
      .then((res: any) => {
        const list = res?.data ?? res ?? [];
        const arr = Array.isArray(list) ? list : [];
        const found = arr.find((e: any) => e._id === params.id);
        if (found) {
          const record = apiItemToEstimateRecord(found);
          setEstimate(record);
          // Refresh par same data dikhe: localStorage me save karo
          try {
            const stored = JSON.parse(localStorage.getItem("customerEstimates") || "[]") as EstimateRecord[];
            const idx = stored.findIndex((e) => e.id === record.id || e.id === params.id);
            const next = idx >= 0 ? stored.map((e, i) => (i === idx ? record : e)) : [...stored, record];
            localStorage.setItem("customerEstimates", JSON.stringify(next));
          } catch {
            // ignore
          }
        } else {
          setEstimate(null);
        }
      })
      .catch(() => setEstimate(null))
      .finally(() => setLoading(false));
  }, [params?.id]);

  const [resolvedCoordinates, setResolvedCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  useEffect(() => {
    if (!estimate?.address || estimate.coordinates || !process.env.NEXT_PUBLIC_MAPBOX_TOKEN) return;
    let cancelled = false;
    geocodingClient
      .forwardGeocode({ query: estimate.address, limit: 1 })
      .send()
      .then((res) => {
        if (cancelled) return;
        const f = res.body.features?.[0];
        if (f?.center?.length >= 2) {
          setResolvedCoordinates({ lng: f.center[0], lat: f.center[1] });
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [estimate?.address, estimate?.coordinates]);

  if (loading || companyLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-3" />
          <p className="text-gray-600">Loading report…</p>
        </div>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-lg w-full bg-white rounded-xl shadow p-8 text-center">
          <p className="text-gray-600 mb-4">No estimate found.</p>
          <button
            onClick={() => router.push("/customer-panel/estimating")}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
          >
            Go to Estimating
          </button>
        </div>
      </div>
    );
  }

  const coords = estimate.coordinates || resolvedCoordinates;
  const staticMapUrl =
    coords && process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      ? `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/pin-l+ff0000(${coords.lng},${coords.lat})/${coords.lng},${coords.lat},20/640x360@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
      : "";

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <div className="sticky top-0 z-10 print:hidden bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white transition shrink-0"
            style={{ backgroundColor: "#8b0e0f" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#6d0b0c")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#8b0e0f")}
          >
            <Printer className="w-4 h-4" />
            Download Report
          </button>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 print:py-0 overflow-x-auto min-w-0">
        <EstimateReportContent
          estimate={estimate}
          company={company}
          mapUrl={staticMapUrl}
          forPdf={false}
        />
      </div>
    </div>
  );
}
