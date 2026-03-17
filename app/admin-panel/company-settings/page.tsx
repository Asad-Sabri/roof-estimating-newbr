"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Building2, Edit2 } from "lucide-react";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";
import { getCompanySettingsAPI, putCompanySettingsAPI } from "@/services/companyAPI";

type AddressShape = {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
};

type MaterialRow = { name: string; code?: string; price?: number; unit?: string };
type PricingShape = { pricePerSqFt?: number; materials?: MaterialRow[] };

type CompanyProfile = {
  companyName: string;
  licenseNumber?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: AddressShape;
  addressLine?: string;
  logoUrl?: string;
  accentHex?: string;
  disclaimer?: string;
  contactPersonName?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  followUpText?: string;
  whatsIncluded?: string[];
  interestRate?: number;
  pricing?: PricingShape;
};

function formatAddressLine(addr: AddressShape | undefined): string {
  if (!addr) return "";
  return [addr.street, addr.city, addr.state, addr.country, addr.zip_code].filter(Boolean).join(", ");
}

const DEFAULT_COMPANY: CompanyProfile = {
  companyName: "Superior Pro Roofing Systems",
  licenseNumber: "LIC #123456",
  phone: "(555) 123-4567",
  email: "info@superiorproroofs.com",
  website: "www.superiorproroofs.com",
  logoUrl: "https://app.roofr.com/images/estimator/residential.jpeg",
  accentHex: "#8b0e0f",
  disclaimer:
    "Preliminary estimate only. Formal estimate subject to inspection, scope confirmation, and material selection. Pricing is preliminary and non‑binding until verified by an authorized project specialist.",
  addressLine: "123 Main St, Suite 100, Anytown, USA",
  contactPersonName: "Person XXX",
  contactPersonPhone: "XXX-XXX-XXXX",
  contactPersonEmail: "GM@SuperiorRoofingCali.com",
  followUpText: "You can anticipate prompt follow-up from [Person XXX] at [Phone XXX-XXX-XXXX] and [Email GM@SuperiorRoofingCali.com] to schedule or confirm your inspection and discuss your estimate.\nVery truly yours,\nShafic XXXXX.",
  whatsIncluded: [
    "Tear-off and proper disposal of existing roofing materials.",
    "Install ice & water shield and synthetic underlayment.",
    "Flashings, pipe boots, vents, and necessary sealants.",
    "Starter, field, and ridge materials per selected system.",
    "Jobsite protection, magnet sweep, and daily cleanup.",
    "Manufacturer and workmanship warranty (per selection).",
    "Final walk-through with project specialist.",
    "Permit and inspection coordination where applicable.",
  ],
  interestRate: 6.5,
};

export default function CompanySettingsPage() {
  useProtectedRoute();
  const [profile, setProfile] = useState<CompanyProfile>(DEFAULT_COMPANY);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>("");
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCompanySettingsAPI()
      .then((res: any) => {
        const r = res?.data ?? res?.settings ?? res;
        if (r && typeof r === "object") {
          const address = r.address && typeof r.address === "object" ? r.address : undefined;
          const addressLine = formatAddressLine(address) || (r.addressLine ?? r.address_line ?? DEFAULT_COMPANY.addressLine);
          const whatsIncludedRaw = r.whatsIncluded ?? r.whats_included;
          const whatsIncluded = Array.isArray(whatsIncludedRaw)
            ? whatsIncludedRaw
            : typeof whatsIncludedRaw === "string"
              ? whatsIncludedRaw.split("\n").map((s: string) => s.trim()).filter(Boolean)
              : DEFAULT_COMPANY.whatsIncluded;
          setProfile({
            ...DEFAULT_COMPANY,
            companyName: r.companyName ?? r.company_name ?? DEFAULT_COMPANY.companyName,
            licenseNumber: r.licenseNumber ?? r.license_number ?? DEFAULT_COMPANY.licenseNumber,
            phone: r.mobile_number ?? r.phone ?? DEFAULT_COMPANY.phone,
            email: r.email ?? DEFAULT_COMPANY.email,
            website: r.website ?? DEFAULT_COMPANY.website,
            address,
            addressLine,
            contactPersonName: r.contactPersonName ?? r.contact_person_name ?? DEFAULT_COMPANY.contactPersonName,
            contactPersonPhone: r.contactPersonPhone ?? r.contact_person_phone ?? DEFAULT_COMPANY.contactPersonPhone,
            contactPersonEmail: r.contactPersonEmail ?? r.contact_person_email ?? DEFAULT_COMPANY.contactPersonEmail,
            followUpText: r.followUpText ?? r.follow_up_text ?? DEFAULT_COMPANY.followUpText,
            whatsIncluded,
            disclaimer: r.disclaimer ?? DEFAULT_COMPANY.disclaimer,
            interestRate: r.interestRate ?? r.interest_rate ?? DEFAULT_COMPANY.interestRate,
            pricing: r.pricing ?? undefined,
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleEdit = (field: keyof CompanyProfile, currentValue: any) => {
    setIsEditing(field);
    setTempValue(Array.isArray(currentValue) ? currentValue.join("\n") : String(currentValue || ""));
  };

  const handleSave = (field: keyof CompanyProfile) => {
    if (field === "whatsIncluded") {
      setProfile({ ...profile, [field]: tempValue.split("\n").filter(line => line.trim()) });
    } else if (field === "interestRate") {
      setProfile({ ...profile, [field]: parseFloat(tempValue) || 0 });
    } else if (field === "addressLine") {
      const parts = tempValue.split(",").map((s) => s.trim());
      setProfile({
        ...profile,
        addressLine: tempValue,
        address: { street: parts[0], city: parts[1], state: parts[2], country: parts[3] ?? "", zip_code: parts[4] ?? "" },
      });
    } else {
      setProfile({ ...profile, [field]: tempValue });
    }
    setIsEditing(null);
    setTempValue("");
    setHasChanges(true);
  };

  const handleCancel = () => {
    setIsEditing(null);
    setTempValue("");
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const payload: any = {
        companyName: profile.companyName,
        licenseNumber: profile.licenseNumber,
        website: profile.website,
        email: profile.email,
        mobile_number: profile.phone,
        address: profile.address ?? (profile.addressLine ? { street: profile.addressLine, city: "", state: "", country: "", zip_code: "" } : undefined),
        contactPersonName: profile.contactPersonName,
        contactPersonPhone: profile.contactPersonPhone,
        contactPersonEmail: profile.contactPersonEmail,
        followUpText: profile.followUpText,
        whatsIncluded: profile.whatsIncluded,
        disclaimer: profile.disclaimer,
        interestRate: profile.interestRate,
      };
      if (profile.pricing) {
        payload.pricing = {
          pricePerSqFt: profile.pricing.pricePerSqFt,
          materials: profile.pricing.materials ?? [],
        };
      }
      await putCompanySettingsAPI(payload);
      setHasChanges(false);
      alert("Company settings saved successfully!");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to save.";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminDashboardLayout>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-gray-900"
      >
        {/* Header */}
        <header className="text-white py-5 px-2 md:px-6 flex md:items-center justify-between" style={{ backgroundColor: "#8b0e0f" }}>
          <h1 className="md:text-2xl font-bold flex items-center gap-2">
            <Building2 size={28} />
            Company Settings
          </h1>
          {hasChanges && (
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="flex items-center gap-2 bg-white text-white px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              style={{ color: "#8b0e0f" }}
            >
              <Save size={18} />
              {saving ? "Saving…" : "Save All Changes"}
            </button>
          )}
        </header>

        {/* Description */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6 mx-2 md:mx-6">
          <p className="text-sm text-gray-700">
            Edit company information, contact details, disclaimers, and report content. These settings will appear in customer estimate reports.
          </p>
        </div>

        {/* Settings Sections */}
        <section className="mx-2 md:mx-6 space-y-6">
          {/* Company Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building2 size={20} />
              Company Information
            </h2>
            <div className="space-y-4">
              {(["companyName", "licenseNumber", "phone", "email", "website", "addressLine"] as Array<keyof CompanyProfile>).map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {field.replace(/([A-Z])/g, " $1").trim()}
                  </label>
                  {isEditing === field ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <button
                        onClick={() => handleSave(field)}
                        className="px-3 py-2 text-white rounded-md transition-all text-sm"
                        style={{ backgroundColor: "#8b0e0f" }}
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                      <span className="text-gray-700">{String(profile[field] || "—")}</span>
                      <button
                        onClick={() => handleEdit(field, profile[field])}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Subscriber pricing – used for instant estimate calculation (GET/PUT /api/company/settings) */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Pricing (per subscriber)</h2>
            <p className="text-sm text-gray-600 mb-4">Used to calculate instant estimate amounts. Price per sq ft and material list.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price per sq ft ($)</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={profile.pricing?.pricePerSqFt ?? ""}
                  onChange={(e) => {
                    const v = e.target.value === "" ? undefined : parseFloat(e.target.value);
                    setProfile({
                      ...profile,
                      pricing: { ...profile.pricing, pricePerSqFt: v } as PricingShape,
                    });
                    setHasChanges(true);
                  }}
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g. 4.50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Materials (name, code, price, unit)</label>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 rounded-md">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Name</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Code</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Price</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Unit</th>
                        <th className="px-3 py-2 w-10" />
                      </tr>
                    </thead>
                    <tbody>
                      {(profile.pricing?.materials ?? []).map((m, i) => (
                        <tr key={i} className="border-t border-gray-200">
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={m.name}
                              onChange={(e) => {
                                const materials = [...(profile.pricing?.materials ?? [])];
                                materials[i] = { ...m, name: e.target.value };
                                setProfile({ ...profile, pricing: { ...profile.pricing, materials } });
                                setHasChanges(true);
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={m.code ?? ""}
                              onChange={(e) => {
                                const materials = [...(profile.pricing?.materials ?? [])];
                                materials[i] = { ...m, code: e.target.value };
                                setProfile({ ...profile, pricing: { ...profile.pricing, materials } });
                                setHasChanges(true);
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min={0}
                              step={0.01}
                              value={m.price ?? ""}
                              onChange={(e) => {
                                const materials = [...(profile.pricing?.materials ?? [])];
                                materials[i] = { ...m, price: e.target.value === "" ? undefined : parseFloat(e.target.value) };
                                setProfile({ ...profile, pricing: { ...profile.pricing, materials } });
                                setHasChanges(true);
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={m.unit ?? ""}
                              onChange={(e) => {
                                const materials = [...(profile.pricing?.materials ?? [])];
                                materials[i] = { ...m, unit: e.target.value };
                                setProfile({ ...profile, pricing: { ...profile.pricing, materials } });
                                setHasChanges(true);
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="sq ft"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() => {
                                const materials = (profile.pricing?.materials ?? []).filter((_, j) => j !== i);
                                setProfile({ ...profile, pricing: { ...profile.pricing, materials } });
                                setHasChanges(true);
                              }}
                              className="text-red-600 hover:bg-red-50 p-1 rounded"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const materials = [...(profile.pricing?.materials ?? []), { name: "", code: "", price: undefined, unit: "sq ft" }];
                    setProfile({ ...profile, pricing: { ...profile.pricing, materials } });
                    setHasChanges(true);
                  }}
                  className="mt-2 px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                >
                  + Add material
                </button>
              </div>
            </div>
          </div>

          {/* Contact Person Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Contact Person Information</h2>
            <div className="space-y-4">
              {(["contactPersonName", "contactPersonPhone", "contactPersonEmail"] as Array<keyof CompanyProfile>).map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {field.replace(/([A-Z])/g, " $1").replace("contact person ", "").trim()}
                  </label>
                  {isEditing === field ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <button
                        onClick={() => handleSave(field)}
                        className="px-3 py-2 text-white rounded-md transition-all text-sm"
                        style={{ backgroundColor: "#8b0e0f" }}
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                      <span className="text-gray-700">{String(profile[field] || "—")}</span>
                      <button
                        onClick={() => handleEdit(field, profile[field])}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Follow-Up Text */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Follow-Up Text</h2>
            {isEditing === "followUpText" ? (
              <div className="space-y-2">
                <textarea
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="You can anticipate prompt follow-up from..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave("followUpText")}
                    className="px-3 py-2 text-white rounded-md transition-all text-sm"
                    style={{ backgroundColor: "#8b0e0f" }}
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between bg-gray-50 px-3 py-2 rounded-md">
                <p className="text-gray-700 whitespace-pre-line text-sm">{profile.followUpText || "—"}</p>
                <button
                  onClick={() => handleEdit("followUpText", profile.followUpText)}
                  className="text-gray-500 hover:text-gray-700 ml-4"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Use [Person XXX], [Phone XXX-XXX-XXXX], and [Email GM@SuperiorRoofingCali.com] as placeholders. They will be replaced with actual values.
            </p>
          </div>

          {/* What's Included */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">What&apos;s Included</h2>
            {isEditing === "whatsIncluded" ? (
              <div className="space-y-2">
                <textarea
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter each item on a new line..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave("whatsIncluded")}
                    className="px-3 py-2 text-white rounded-md transition-all text-sm"
                    style={{ backgroundColor: "#8b0e0f" }}
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition text-sm"
                  >
                    Cancel
                  </button>
                </div>
                <p className="text-xs text-gray-500">Enter each item on a separate line.</p>
              </div>
            ) : (
              <div className="flex items-start justify-between bg-gray-50 px-3 py-2 rounded-md">
                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                  {profile.whatsIncluded && profile.whatsIncluded.length > 0 ? (
                    profile.whatsIncluded.map((item, idx) => <li key={idx}>{item}</li>)
                  ) : (
                    <li>No items listed</li>
                  )}
                </ul>
                <button
                  onClick={() => handleEdit("whatsIncluded", profile.whatsIncluded)}
                  className="text-gray-500 hover:text-gray-700 ml-4"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Disclaimer</h2>
            {isEditing === "disclaimer" ? (
              <div className="space-y-2">
                <textarea
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave("disclaimer")}
                    className="px-3 py-2 text-white rounded-md transition-all text-sm"
                    style={{ backgroundColor: "#8b0e0f" }}
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between bg-gray-50 px-3 py-2 rounded-md">
                <p className="text-gray-700 text-sm">{profile.disclaimer || "—"}</p>
                <button
                  onClick={() => handleEdit("disclaimer", profile.disclaimer)}
                  className="text-gray-500 hover:text-gray-700 ml-4"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Interest Rate */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Financing Interest Rate</h2>
            <p className="text-sm text-gray-600 mb-2">Annual interest rate (%) for monthly payment calculations</p>
            {isEditing === "interestRate" ? (
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 w-32"
                />
                <span className="text-gray-600">%</span>
                <button
                  onClick={() => handleSave("interestRate")}
                  className="px-3 py-2 text-white rounded-md transition-all text-sm"
                  style={{ backgroundColor: "#8b0e0f" }}
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                <span className="text-gray-700">{profile.interestRate || 0}%</span>
                <button
                  onClick={() => handleEdit("interestRate", profile.interestRate)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            )}
          </div>
        </section>
      </motion.main>
    </AdminDashboardLayout>
  );
}
