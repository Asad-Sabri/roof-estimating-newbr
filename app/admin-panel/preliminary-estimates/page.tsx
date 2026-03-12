"use client";

import { useState, useEffect, useCallback, useRef, Fragment } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FileText, Loader2, RefreshCw, ChevronDown, ChevronRight, Upload, MapPin, X, FileEdit } from "lucide-react";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";
import { getPreliminaryRequestsAPI } from "@/services/instantEstimateAPI";
import { sendPdfsAPI } from "@/services/emailAPI";
import { createProjectAPI } from "@/services/auth";
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";
import { toast } from "react-toastify";
import { getPinCoordinatesFromFeature } from "@/utils/buildingCentroid";
import { ROOF_TYPE_CATEGORIES, getCompatibleSystems } from "@/lib/roofTypeSystemMatrix";
import "react-toastify/dist/ReactToastify.css";

const geocodingClient = mbxGeocoding({
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "",
});

/** Normalize API response to array of items (customer + estimate detail) */
function normalizeList(res: any): any[] {
  if (!res || typeof res !== "object") return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.requests)) return res.requests;
  if (Array.isArray(res.preliminaryRequests)) return res.preliminaryRequests;
  if (res.data && Array.isArray((res.data as any).requests)) return (res.data as any).requests;
  return [];
}

function formatDate(s: string) {
  if (!s || s === "—") return "—";
  try {
    return new Date(s).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return s;
  }
}

/** Map roof material to request-estimate roofType (system) value */
function toRoofType(v: any): string {
  const s = String(v || "").toLowerCase();
  if (s.includes("shingle") || s.includes("asphalt")) return "shingle";
  if (s.includes("metal")) return "metal";
  if (s.includes("tile")) return "tile";
  if (s.includes("flat") || s.includes("tpo") || s.includes("epdm") || s.includes("bur") || s.includes("pvc")) return "flat";
  return "";
}
/** Derive roof type category from roofType (system) for prefill */
function roofTypeToCategory(roofType: string): string {
  if (!roofType) return "";
  const r = (roofType || "").toLowerCase();
  if (r === "flat" || ["tpo", "epdm", "bur", "pvc", "modified_bitumen"].includes(r)) return "flat";
  if (r === "shingle" || r === "cedar" || r === "synthetic" || r === "asphalt") return "steep";
  if (r === "tile") return "tile";
  if (r === "metal") return "metal";
  return "";
}

/** Map building type to request-estimate propertyType option values */
function toPropertyType(v: any): string {
  const s = String(v || "").toLowerCase();
  if (s.includes("single") || s.includes("one")) return "single";
  if (s.includes("double") || s.includes("two") || s.includes("story")) return "double";
  if (s.includes("commercial")) return "commercial";
  return "";
}

/** Build initial form values from preliminary request item */
function getPrefillFromItem(item: any) {
  const customer = item?.customer ?? item?.user ?? item;
  const estimate = item?.estimate ?? item?.instantEstimate ?? item;
  const name = customer?.name ?? ([customer?.first_name, customer?.last_name].filter(Boolean).join(" ")) ?? estimate?.name ?? "";
  const parts = (name || "").trim().split(/\s+/);
  const firstName = customer?.first_name ?? estimate?.first_name ?? parts[0] ?? "";
  const lastName = customer?.last_name ?? estimate?.last_name ?? (parts.length > 1 ? parts.slice(1).join(" ") : "");
  const middleName = customer?.middle_name ?? estimate?.middle_name ?? "";
  const email = customer?.email ?? estimate?.email ?? item?.email ?? "";
  const phone = customer?.phone ?? customer?.mobile_number ?? estimate?.phone ?? estimate?.mobile_number ?? "";
  const addr = estimate?.address ?? item?.address;
  const addressStr = typeof addr === "string" ? addr : (addr && typeof addr === "object" ? [addr.street, addr.city, addr.state, addr.zip_code].filter(Boolean).join(", ") : "") || "";
  const roofType = toRoofType(estimate?.roof_material ?? estimate?.current_roof_material);
  const propertyType = toPropertyType(estimate?.building_type ?? estimate?.buildingType);
  return {
    firstName: String(firstName ?? "").trim(),
    middleName: String(middleName ?? "").trim(),
    lastName: String(lastName ?? "").trim(),
    email: String(email ?? "").trim(),
    mobile: String(phone ?? "").trim(),
    address: addressStr.trim(),
    roofType: roofType || "",
    propertyType: propertyType || "",
  };
}

export default function AdminPreliminaryEstimatesPage() {
  useProtectedRoute();
  const router = useRouter();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sendingPdfId, setSendingPdfId] = useState<string | null>(null);
  const [estimateForFullReportItem, setEstimateForFullReportItem] = useState<any>(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sendToEmailRef = useRef<string | null>(null);

  const prefill = estimateForFullReportItem ? getPrefillFromItem(estimateForFullReportItem) : null;
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      firstName: prefill?.firstName ?? "",
      middleName: prefill?.middleName ?? "",
      lastName: prefill?.lastName ?? "",
      email: prefill?.email ?? "",
      mobile: prefill?.mobile ?? "",
      address: prefill?.address ?? "",
      roofTypeCategory: prefill?.roofTypeCategory ?? roofTypeToCategory(prefill?.roofType ?? ""),
      roofType: prefill?.roofType ?? "",
      propertyType: prefill?.propertyType ?? "",
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("Required"),
      lastName: Yup.string().required("Required"),
      email: Yup.string().email("Invalid email").required("Required"),
      mobile: Yup.string().required("Required"),
      address: Yup.string().required("Required"),
      roofTypeCategory: Yup.string().required("Select roof type first"),
      roofType: Yup.string().required("Required"),
      propertyType: Yup.string().required("Required"),
    }),
    onSubmit: async () => {},
  });

  const handleAddressChange = useCallback(async (value: string) => {
    formik.setFieldValue("address", value);
    if (value.length < 3) {
      setAddressSuggestions([]);
      return;
    }
    try {
      const res = await geocodingClient.forwardGeocode({ query: value, limit: 6 }).send();
      setAddressSuggestions(res.body.features.map((f: any) => f.place_name));
    } catch {
      setAddressSuggestions([]);
    }
  }, [formik]);

  const goToMap = useCallback(async () => {
    await formik.validateForm();
    formik.setTouched({
      firstName: true,
      lastName: true,
      middleName: true,
      mobile: true,
      email: true,
      address: true,
      roofTypeCategory: true,
      roofType: true,
      propertyType: true,
    });
    if (!formik.isValid) return;
    setMapLoading(true);
    try {
      const geoRes = await geocodingClient
        .forwardGeocode({ query: formik.values.address, limit: 1 })
        .send();
      const feature = geoRes.body.features[0];
      if (!feature) {
        toast.error("Please enter a valid address");
        setMapLoading(false);
        return;
      }
      const [lng, lat] = await getPinCoordinatesFromFeature(feature);
      await createProjectAPI({
        first_name: formik.values.firstName,
        middle_name: formik.values.middleName,
        last_name: formik.values.lastName,
        email: formik.values.email,
        mobile_number: formik.values.mobile,
        address: { street: formik.values.address },
        roof_type: formik.values.roofType,
        property_type: formik.values.propertyType,
        latitude: lat,
        longitude: lng,
      });
      const addr = { lat, lng, address: formik.values.address };
      localStorage.setItem("projectAddress", JSON.stringify(addr));
      localStorage.setItem("projectLocation", JSON.stringify({ lat, lng }));
      setEstimateForFullReportItem(null);
      router.push("/property-map");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create project or fetch location. Please try again.");
    } finally {
      setMapLoading(false);
    }
  }, [formik, router]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPreliminaryRequestsAPI();
      setList(normalizeList(res));
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Failed to load preliminary requests.";
      setError(msg);
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleUploadClick = (email: string, estimateId: string) => {
    const e = (email || "").trim();
    if (!e) {
      toast.error("No email for this request. Cannot send PDF.");
      return;
    }
    sendToEmailRef.current = e;
    setSendingPdfId(estimateId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const email = sendToEmailRef.current;
    if (!file || !email) {
      setSendingPdfId(null);
      sendToEmailRef.current = null;
      e.target.value = "";
      return;
    }
    if (!file.type.includes("pdf")) {
      toast.error("Please select a PDF file.");
      setSendingPdfId(null);
      sendToEmailRef.current = null;
      e.target.value = "";
      return;
    }
    try {
      await sendPdfsAPI(file, email);
      toast.success(`PDF sent to ${email}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to send PDF.";
      toast.error(msg);
    } finally {
      setSendingPdfId(null);
      sendToEmailRef.current = null;
      e.target.value = "";
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
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleFileChange}
          aria-label="Select PDF to send"
        />
        <header className="bg-gray-200 text-white py-5 px-2 md:px-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-sm md:text-2xl font-bold flex items-center gap-2 text-black">
            <FileText className="w-6 h-6" />
            Preliminary Estimates
          </h1>
          <button
            type="button"
            onClick={() => fetchList()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#8b0e0f] text-white hover:opacity-90 text-sm font-medium disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh
          </button>
        </header>

        {error && (
          <div className="mx-2 md:mx-6 mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <section className="my-6 mx-2 md:mx-6">
          <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[#8b0e0f]" />
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estimate ID</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {list.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                        No preliminary (full report) requests yet.
                      </td>
                    </tr>
                  ) : (
                    list.map((item: any, index: number) => {
                      const customer = item.customer ?? item.user ?? item;
                      const estimate = item.estimate ?? item.instantEstimate ?? item;
                      const name = customer?.name ?? ([customer?.first_name, customer?.last_name].filter(Boolean).join(" ")) ?? customer?.email ?? "—";
                      const email = customer?.email ?? estimate?.email ?? item?.email ?? "—";
                      const phone = customer?.phone ?? customer?.mobile_number ?? estimate?.phone ?? estimate?.mobile_number ?? "—";
                      const addr = estimate?.address ?? item?.address;
                      const addressStr = typeof addr === "string" ? addr : (addr && typeof addr === "object" ? [addr.street, addr.city, addr.state, addr.zip_code].filter(Boolean).join(", ") : "—") || "—";
                      const estimateId = estimate?._id ?? item?._id ?? item?.estimateId ?? String(index);
                      const requestedAt = item?.requestedAt ?? item?.createdAt ?? estimate?.createdAt ?? item?.created_at ?? "—";
                      const requestedStr = requestedAt && requestedAt !== "—" ? formatDate(requestedAt) : "—";
                      const isExpanded = expandedId === estimateId;

                      return (
                        <Fragment key={estimateId || index}>
                          <tr className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => setExpandedId((id) => (id === estimateId ? null : estimateId))}
                                className="flex items-center gap-2 text-left font-medium text-gray-900 hover:text-[#8b0e0f]"
                              >
                                {isExpanded ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
                                {name}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-gray-700">{email}</td>
                            <td className="px-4 py-3 text-gray-700">{phone}</td>
                            <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate" title={addressStr}>{addressStr}</td>
                            <td className="px-4 py-3 text-gray-500 font-mono text-xs">{typeof estimateId === "string" ? estimateId.slice(-8) : String(estimateId)}</td>
                            <td className="px-4 py-3 text-gray-500">{requestedStr}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleUploadClick(email, String(estimateId)); }}
                                  disabled={sendingPdfId === String(estimateId) || !email}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8b0e0f] text-white text-xs font-medium hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                                  title="Upload PDF and send to customer email"
                                >
                                  {sendingPdfId === String(estimateId) ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Upload className="w-3.5 h-3.5" />
                                  )}
                                  Upload
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setEstimateForFullReportItem(item); }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#8b0e0f] text-[#8b0e0f] text-xs font-medium hover:bg-[#8b0e0f] hover:text-white"
                                  title="Open request estimate form and go to map"
                                >
                                  <FileEdit className="w-3.5 h-3.5" />
                                  Estimate for full report
                                </button>
                              </div>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-gray-50">
                              <td colSpan={7} className="px-4 py-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-500 block mb-1">Customer Name</span>
                                    <span className="text-gray-900">{name}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 block mb-1">Email</span>
                                    <span className="text-gray-900">{email}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 block mb-1">Phone</span>
                                    <span className="text-gray-900">{phone}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 block mb-1">Estimate ID</span>
                                    <span className="text-gray-900 font-mono text-xs">{String(estimateId)}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 block mb-1">Requested</span>
                                    <span className="text-gray-900">{requestedStr}</span>
                                  </div>
                                  <div className="sm:col-span-2">
                                    <span className="text-gray-500 block mb-1">Address</span>
                                    <span className="text-gray-900">{addressStr}</span>
                                  </div>
                                  {(estimate?.area != null && estimate?.area !== "") && (
                                    <div>
                                      <span className="text-gray-500 block mb-1">Area</span>
                                      <span className="text-gray-900">{estimate?.area ?? "—"}</span>
                                    </div>
                                  )}
                                  {(estimate?.building_type ?? estimate?.buildingType) && (
                                    <div>
                                      <span className="text-gray-500 block mb-1">Building Type</span>
                                      <span className="text-gray-900">{estimate?.building_type ?? estimate?.buildingType ?? "—"}</span>
                                    </div>
                                  )}
                                  {(estimate?.roof_teep ?? estimate?.roofSteepness) && (
                                    <div>
                                      <span className="text-gray-500 block mb-1">Roof Steepness</span>
                                      <span className="text-gray-900">{estimate?.roof_teep ?? estimate?.roofSteepness ?? "—"}</span>
                                    </div>
                                  )}
                                  {(estimate?.current_roof_material ?? estimate?.currentRoofType) && (
                                    <div>
                                      <span className="text-gray-500 block mb-1">Current Roof</span>
                                      <span className="text-gray-900">{estimate?.current_roof_material ?? estimate?.currentRoofType ?? "—"}</span>
                                    </div>
                                  )}
                                  {(estimate?.roof_material ?? estimate?.desiredRoofType) && (
                                    <div>
                                      <span className="text-gray-500 block mb-1">Desired Roof</span>
                                      <span className="text-gray-900">{estimate?.roof_material ?? estimate?.desiredRoofType ?? "—"}</span>
                                    </div>
                                  )}
                                  {(estimate?.timeline ?? estimate?.projectTimeline) && (
                                    <div>
                                      <span className="text-gray-500 block mb-1">Timeline</span>
                                      <span className="text-gray-900">{estimate?.timeline ?? estimate?.projectTimeline ?? "—"}</span>
                                    </div>
                                  )}
                                  {Array.isArray(estimate?.estimate_price) && estimate.estimate_price.length > 0 && (
                                    <div className="sm:col-span-2 lg:col-span-3">
                                      <span className="text-gray-500 block mb-1">Estimate Prices</span>
                                      <ul className="list-disc pl-4 text-gray-900 space-y-1">
                                        {estimate.estimate_price.map((ep: any, i: number) => (
                                          <li key={i}>{ep.title ?? ep.type ?? "Item"}: {ep.price_range ?? (ep.minPrice != null && ep.maxPrice != null ? `$${ep.minPrice} - $${ep.maxPrice}` : "—")}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {estimate?.createdAt && (
                                    <div>
                                      <span className="text-gray-500 block mb-1">Created</span>
                                      <span className="text-gray-900">{formatDate(estimate.createdAt)}</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Estimate for full report modal – request estimate form pre-filled, Go to Map same as request-estimate page */}
        {estimateForFullReportItem != null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => { setAddressSuggestions([]); setEstimateForFullReportItem(null); }}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-lg font-semibold text-gray-900">Estimate for full report</h2>
                <button
                  type="button"
                  onClick={() => { setAddressSuggestions([]); setEstimateForFullReportItem(null); }}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={formik.handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="John"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#8b0e0f] outline-none"
                  />
                  {formik.touched.firstName && formik.errors.firstName && (
                    <p className="text-red-500 text-sm">{formik.errors.firstName}</p>
                  )}
                </div>
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                  <input
                    type="text"
                    name="middleName"
                    value={formik.values.middleName}
                    onChange={formik.handleChange}
                    placeholder="A."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#8b0e0f] outline-none"
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Doe"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#8b0e0f] outline-none"
                  />
                  {formik.touched.lastName && formik.errors.lastName && (
                    <p className="text-red-500 text-sm">{formik.errors.lastName}</p>
                  )}
                </div>
                <div className="md:col-span-6">
                  <label className="block text-sm font-medium text-gray-700">Mobile Number *</label>
                  <input
                    type="text"
                    name="mobile"
                    value={formik.values.mobile}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="+1 234 567 890"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#8b0e0f] outline-none"
                  />
                  {formik.touched.mobile && formik.errors.mobile && (
                    <p className="text-red-500 text-sm">{formik.errors.mobile}</p>
                  )}
                </div>
                <div className="md:col-span-6">
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="example@email.com"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#8b0e0f] outline-none"
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-red-500 text-sm">{formik.errors.email}</p>
                  )}
                </div>
                <div className="md:col-span-12 relative">
                  <label className="block text-sm font-medium text-gray-700">Address *</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="address"
                      placeholder="Enter address"
                      value={formik.values.address}
                      onChange={(e) => handleAddressChange(e.target.value)}
                      onBlur={formik.handleBlur}
                      className="w-full border border-gray-300 rounded-lg p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[#8b0e0f]"
                    />
                    {addressSuggestions.length > 0 && (
                      <ul className="absolute z-50 bg-white border border-gray-300 rounded-md shadow-md w-full mt-1 max-h-48 overflow-y-auto">
                        {addressSuggestions.map((s, i) => (
                          <li
                            key={i}
                            onClick={async () => {
                              formik.setFieldValue("address", s);
                              setAddressSuggestions([]);
                              try {
                                const geoRes = await geocodingClient.forwardGeocode({ query: s, limit: 1 }).send();
                                const feature = geoRes.body.features[0];
                                if (feature) {
                                  const [lng, lat] = feature.center;
                                  localStorage.setItem("projectLocation", JSON.stringify({ address: s, lat, lng }));
                                }
                              } catch {
                                // ignore
                              }
                            }}
                            className="p-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                          >
                            {s}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {formik.touched.address && formik.errors.address && (
                    <p className="text-red-500 text-sm mt-1">{formik.errors.address}</p>
                  )}
                </div>
                <div className="md:col-span-6">
                  <label className="block text-sm font-medium text-gray-700">Roof Type (Category) *</label>
                  <select
                    name="roofTypeCategory"
                    value={formik.values.roofTypeCategory}
                    onChange={(e) => {
                      const cat = e.target.value;
                      formik.setFieldValue("roofTypeCategory", cat);
                      const compatible = getCompatibleSystems(cat as any);
                      const currentInCompatible = compatible.some((s) => s.value === formik.values.roofType);
                      if (!currentInCompatible) formik.setFieldValue("roofType", "");
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-[#8b0e0f] outline-none"
                  >
                    <option value="">Select Roof Type</option>
                    {ROOF_TYPE_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  {formik.touched.roofTypeCategory && formik.errors.roofTypeCategory && (
                    <p className="text-red-500 text-sm">{formik.errors.roofTypeCategory}</p>
                  )}
                </div>
                <div className="md:col-span-6">
                  <label className="block text-sm font-medium text-gray-700">Roof System *</label>
                  <select
                    name="roofType"
                    value={formik.values.roofType}
                    onChange={formik.handleChange}
                    disabled={!formik.values.roofTypeCategory}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-[#8b0e0f] outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Roof System</option>
                    {getCompatibleSystems(formik.values.roofTypeCategory as any).map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  {formik.touched.roofType && formik.errors.roofType && (
                    <p className="text-red-500 text-sm">{formik.errors.roofType}</p>
                  )}
                </div>
                <div className="md:col-span-6">
                  <label className="block text-sm font-medium text-gray-700">Property Type *</label>
                  <select
                    name="propertyType"
                    value={formik.values.propertyType}
                    onChange={formik.handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-[#8b0e0f] outline-none"
                  >
                    <option value="">Select Property Type</option>
                    <option value="single">Single Story</option>
                    <option value="double">Double Story</option>
                    <option value="commercial">Commercial</option>
                  </select>
                  {formik.touched.propertyType && formik.errors.propertyType && (
                    <p className="text-red-500 text-sm">{formik.errors.propertyType}</p>
                  )}
                </div>
                <div className="md:col-span-12 flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => { setAddressSuggestions([]); setEstimateForFullReportItem(null); }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={goToMap}
                    disabled={mapLoading}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg text-white font-semibold disabled:opacity-50"
                    style={{ backgroundColor: "#8b0e0f" }}
                  >
                    {mapLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
                    {mapLoading ? "Processing..." : "Go to Map Screen"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </motion.main>
    </AdminDashboardLayout>
  );
}
