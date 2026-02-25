"use client";

import React, { useState, useEffect } from "react";
import CustomerDashboardLayout from "@/app/dashboard/customer/page";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";
import Link from "next/link";
import { FileText, TrendingUp, DollarSign, Calendar, X, Eye, MapPin, Home, Layers, Clock, CreditCard, Trash2, ChevronDown, ChevronRight, Mail, Phone, User } from "lucide-react";
import { getUserInstantEstimatesAPI, deleteInstantEstimateAPI } from "@/services/instantEstimateAPI";
import { generateEstimateReportPdfFromHtml } from "@/utils/estimateReportPdfFromHtml";
import { sendPdfsAPI } from "@/services/emailAPI";
import { toast } from "react-toastify";

/** API item ko Preliminary modal ke expected shape me convert karta hai */
function apiItemToModalEstimate(est: any) {
  const addr = est.address || {};
  const addressStr = [addr.street, addr.city, addr.state, addr.zip_code].filter(Boolean).join(", ");
  const parsePriceRange = (pr: string) => {
    const m = (pr || "").match(/\$?\s*([\d,]+)\s*-\s*([\d,]+)/);
    if (!m) return { min: 0, max: 0 };
    return { min: parseInt(String(m[1]).replace(/,/g, ""), 10), max: parseInt(String(m[2]).replace(/,/g, ""), 10) };
  };
  const estimates = (est.estimate_price || []).map((ep: any) => {
    const { min, max } = parsePriceRange(ep.price_range);
    return { type: ep.title, minPrice: min, maxPrice: max, enabled: true };
  });
  return {
    id: est._id,
    address: addressStr,
    buildingType: est.building_type,
    totalArea: est.area ? parseFloat(String(est.area)) : undefined,
    roofSteepness: est.roof_teep,
    currentRoofType: est.current_roof_material,
    roofLayers: String(est.current_roof_layer ?? ""),
    desiredRoofType: est.roof_material,
    projectTimeline: est.timeline,
    estimates,
    createdAt: est.createdAt,
  };
}

interface PreliminaryEstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  estimate: any;
}

function PreliminaryEstimateModal({ isOpen, onClose, estimate }: PreliminaryEstimateModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen && estimate) {
      setShouldRender(true);
      // Small delay to trigger animation
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      // Wait for animation to complete before unmounting
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [isOpen, estimate]);

  if (!shouldRender || !estimate) return null;

  const totalMinPrice = estimate.estimates?.reduce((sum: number, e: any) => sum + (e.minPrice || 0), 0) || 0;
  const totalMaxPrice = estimate.estimates?.reduce((sum: number, e: any) => sum + (e.maxPrice || 0), 0) || 0;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? "bg-black/20 opacity-100" : "bg-transparent opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
      style={{ backdropFilter: isVisible ? "none" : undefined }}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`relative z-[10001] bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header – hamesha upar, scroll pe bhi */}
        <div
          className="shrink-0 px-6 py-4 flex items-center justify-between rounded-t-xl"
          style={{ backgroundColor: "#8b0e0f" }}
        >
          <div>
            <h2 className="text-xl font-bold text-white">Preliminary Estimate</h2>
            <p className="text-white text-sm mt-1 opacity-90">Estimate #{estimate.id?.slice(-6) || 'N/A'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 text-white transform hover:rotate-90 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Property Details */}
        <div className={`px-6 py-4 border-b border-gray-200 transition-all duration-500 delay-75 ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
        }`}>
          <h3 className="font-semibold text-gray-900 mb-3">Property Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Address</p>
                <p className="text-sm font-medium text-gray-900">{estimate.address || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Home className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Building Type</p>
                <p className="text-sm font-medium text-gray-900">{estimate.buildingType || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Layers className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Roof Area</p>
                <p className="text-sm font-medium text-gray-900">{estimate.totalArea ? `${Math.round(estimate.totalArea).toLocaleString()} sq ft` : 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <TrendingUp className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Roof Steepness</p>
                <p className="text-sm font-medium text-gray-900">{estimate.roofSteepness || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Roof Info */}
        <div className={`px-6 py-4 border-b border-gray-200 bg-gray-50 transition-all duration-500 delay-150 ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
        }`}>
          <h3 className="font-semibold text-gray-900 mb-3">Current Roof Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Current Roof Type</p>
              <p className="text-sm font-medium text-gray-900">{estimate.currentRoofType || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Number of Layers</p>
              <p className="text-sm font-medium text-gray-900">{estimate.roofLayers || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Desired Roof Type</p>
              <p className="text-sm font-medium text-gray-900">{estimate.desiredRoofType || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Project Timeline</p>
              <p className="text-sm font-medium text-gray-900">{estimate.projectTimeline || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Estimate Breakdown */}
        <div className={`px-6 py-4 border-b border-gray-200 transition-all duration-500 delay-200 ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
        }`}>
          <h3 className="font-semibold text-gray-900 mb-3">Estimate Breakdown</h3>
          <div className="space-y-3">
            {estimate.estimates?.filter((e: any) => e.enabled !== false).map((est: any, index: number) => (
              <div 
                key={index} 
                className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg transition-all duration-300 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                }`}
                style={{ transitionDelay: `${250 + (index * 50)}ms` }}
              >
                <span className="text-sm font-medium text-gray-700">{est.type}</span>
                <span className="text-sm font-bold text-green-600">
                  ${est.minPrice?.toLocaleString()} - ${est.maxPrice?.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total Estimate */}
        <div className={`px-6 py-4 bg-green-50 border-b border-green-100 transition-all duration-500 delay-300 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Total Preliminary Estimate</p>
              <p className="text-2xl font-bold text-green-800">
                ${totalMinPrice.toLocaleString()} - ${totalMaxPrice.toLocaleString()}*
              </p>
            </div>
            <DollarSign className={`w-10 h-10 text-green-600 transition-all duration-500 delay-400 ${
              isVisible ? 'rotate-0 scale-100' : 'rotate-180 scale-0'
            }`} />
          </div>
        </div>

        {/* Full Report CTA */}
        <div className={`px-6 py-6 transition-all duration-500 delay-350 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-lg">Want a Detailed Full Report?</h4>
                <p className="text-gray-600 text-sm mt-1 mb-4">
                  Get a comprehensive inspection report with detailed pricing, material specifications, 
                  labor costs breakdown, and timeline estimates.
                </p>
                <div className="bg-white rounded-lg p-4 border border-blue-100 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Full Inspection Report</span>
                    <span className="font-bold text-gray-900">$199</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Detailed Material List</span>
                    <span className="font-bold text-gray-900">Included</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Labor Cost Breakdown</span>
                    <span className="font-bold text-gray-900">Included</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Project Timeline</span>
                    <span className="font-bold text-gray-900">Included</span>
                  </div>
                  <hr className="my-3" />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-green-600 text-xl">$199</span>
                  </div>
                </div>
                <button className={`w-full px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 hover:shadow-lg ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: '450ms', backgroundColor: "#155dfc" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1249c9"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#155dfc"}
                >
                  <CreditCard className="w-5 h-5" />
                  Get Full Report - $199
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">
            *Preliminary estimate. Final pricing subject to on-site inspection.
          </p>
        </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EstimatingPage() {
  const { isAuthenticated, isChecking } = useProtectedRoute();
  const [selectedEstimate, setSelectedEstimate] = useState<any>(null);
  const [isPreliminaryModalOpen, setIsPreliminaryModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [emailingId, setEmailingId] = useState<string | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // User ke instant estimates – GET /api/instant-estimates/user (token se logged-in user ki list)
  const [instantEstimatesFromAPI, setInstantEstimatesFromAPI] = useState<{
    data: any[];
    meta: { totalRecords: number } | null;
  }>({ data: [], meta: null });
  const [loadingInstantEstimates, setLoadingInstantEstimates] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || isChecking) return;
    setLoadingInstantEstimates(true);
    getUserInstantEstimatesAPI()
      .then((res: any) => {
        setInstantEstimatesFromAPI({
          data: res?.data ?? [],
          meta: res?.meta ?? null,
        });
      })
      .catch((err) => {
        console.error("Instant estimates fetch error:", err);
        setInstantEstimatesFromAPI({ data: [], meta: null });
      })
      .finally(() => setLoadingInstantEstimates(false));
  }, [isAuthenticated, isChecking]);

  const refetchInstantEstimates = () => {
    getUserInstantEstimatesAPI()
      .then((res: any) => {
        setInstantEstimatesFromAPI({
          data: res?.data ?? [],
          meta: res?.meta ?? null,
        });
      })
      .catch((err) => console.error("Refetch instant estimates error:", err));
  };

  const handleViewPreliminaryEstimate = (estimate: any) => {
    // API shape ho to modal ke liye transform karo
    const forModal = estimate?._id && estimate?.estimate_price ? apiItemToModalEstimate(estimate) : estimate;
    setSelectedEstimate(forModal);
    setIsPreliminaryModalOpen(true);
  };

  const handleDeleteEstimate = async (id: string) => {
    if (!id || !window.confirm("Are you sure you want to delete this estimate?")) return;
    setDeletingId(id);
    try {
      await deleteInstantEstimateAPI(id);
      refetchInstantEstimates();
    } catch (err) {
      console.error("Delete estimate error:", err);
      alert("Failed to delete estimate. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  /** API estimate ko PDF + send-email ke liye use karo – report PDF customer ke email par bhej deta hai */
  const handleEmailReport = async (est: any) => {
    const email = (est?.email || "").trim();
    if (!email) {
      toast.error("No email on this estimate. Add email in estimate details to send the report.");
      return;
    }
    setEmailingId(est._id);
    try {
      toast.info("Sending report to your email...");
      const addr = est.address || {};
      const addressStr = [addr.street, addr.city, addr.state, addr.zip_code].filter(Boolean).join(", ");
      const parsePriceRange = (pr: string) => {
        const m = (pr || "").match(/\$?\s*([\d,]+)\s*-\s*([\d,]+)/);
        if (!m) return { min: 0, max: 0 };
        return { min: parseInt(String(m[1]).replace(/,/g, ""), 10), max: parseInt(String(m[2]).replace(/,/g, ""), 10) };
      };
      const estimates = (est.estimate_price || []).map((ep: any) => {
        const { min, max } = parsePriceRange(ep.price_range);
        return { type: ep.title, minPrice: min, maxPrice: max, enabled: true };
      });
      const coords = est.coordinates || (est.latitude != null && est.longitude != null ? { lat: est.latitude, lng: est.longitude } : undefined);
      const mapUrl =
        coords && process.env.NEXT_PUBLIC_MAPBOX_TOKEN
          ? `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/pin-l+ff0000(${coords.lng},${coords.lat})/${coords.lng},${coords.lat},20/640x360@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
          : "";
      const estimateRecord = {
        id: est._id,
        address: addressStr,
        totalArea: est.area != null ? parseFloat(String(est.area)) : undefined,
        roofSteepness: est.roof_teep,
        buildingType: est.building_type,
        currentRoofType: est.current_roof_material,
        roofLayers: est.current_roof_layer != null ? String(est.current_roof_layer) : undefined,
        desiredRoofType: est.roof_material,
        firstName: est.first_name,
        lastName: est.last_name,
        email: est.email,
        phone: est.mobile_number,
        estimates,
      };
      const pdfBlob = await generateEstimateReportPdfFromHtml({ estimate: estimateRecord, mapUrl });
      await sendPdfsAPI(pdfBlob, email);
      toast.success("Report sent to your email!");
    } catch (err: any) {
      console.error("Email report error:", err);
      const msg = err?.response?.data?.message || err?.message || "Could not send report. Please try again.";
      toast.error(msg);
    } finally {
      setEmailingId(null);
    }
  };

  const apiData = instantEstimatesFromAPI.data ?? [];
  const totalFromAPI = instantEstimatesFromAPI.meta?.totalRecords ?? apiData.length;
  const avgFromEstimatePrices = () => {
    let count = 0;
    let sum = 0;
    apiData.forEach((est: any) => {
      (est.estimate_price || []).forEach((ep: any) => {
        const m = (ep.price_range || "").match(/\$?\s*([\d,]+)\s*-\s*([\d,]+)/);
        if (m) {
          const min = parseInt(String(m[1]).replace(/,/g, ""), 10);
          const max = parseInt(String(m[2]).replace(/,/g, ""), 10);
          sum += (min + max) / 2;
          count += 1;
        }
      });
    });
    return count > 0 ? Math.round(sum / count) : 0;
  };
  const latestDate =
    apiData.length > 0
      ? new Date(
          Math.max(...apiData.map((e: any) => new Date(e?.createdAt || 0).getTime()))
        ).toLocaleDateString()
      : "N/A";

  return (
    <CustomerDashboardLayout>
      <div className="space-y-6 min-h-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Estimating</h1>
            <p className="text-gray-600 mt-1">
              Get instant estimates for your roofing project
            </p>
          </div>
          <Link
            href="/customer-panel/instant-estimate"
            className="px-6 py-3 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 w-fit"
            style={{ backgroundColor: "#8b0e0f" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#6d0b0c")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#8b0e0f")}
          >
            <TrendingUp className="w-5 h-5" />
            Get Free Estimate
          </Link>
        </div>

        {/* Stats Cards – user ke instant estimates (API) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Estimates</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {loadingInstantEstimates ? "…" : totalFromAPI}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Average Estimate</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {loadingInstantEstimates ? "…" : `$${avgFromEstimatePrices().toLocaleString()}`}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Recent Estimate</p>
                <p className="text-lg font-semibold text-gray-900 mt-2">
                  {loadingInstantEstimates ? "…" : latestDate}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Estimates Table – user ke instant estimates (API) */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden flex-1">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Your Estimates
              {totalFromAPI > 0 && (
                <span className="text-sm font-normal text-gray-500 ml-2">({totalFromAPI} total)</span>
              )}
            </h2>
          </div>

          {loadingInstantEstimates ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
              <p className="text-gray-500">Loading your estimates…</p>
            </div>
          ) : apiData.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No estimates yet</p>
              <p className="text-gray-400 mb-6">
                Get your first estimate on the Instant Estimate page
              </p>
              <Link
                href="/customer-panel/instant-estimate"
                className="px-6 py-2 text-white rounded-lg transition cursor-pointer inline-block"
                style={{ backgroundColor: "#8b0e0f" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#6d0b0c")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#8b0e0f")}
              >
                Get Your First Estimate
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Building
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Roof
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Desired Roof
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Steepness
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Area (sq ft)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timeline
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {apiData.map((est: any) => {
                    const addr = est.address || {};
                    const addressStr = [addr.street, addr.city, addr.state, addr.zip_code].filter(Boolean).join(", ") || "N/A";
                    const isExpanded = expandedRowId === est._id;
                    return (
                      <React.Fragment key={est._id}>
                        <tr
                          onClick={() => setExpandedRowId((prev) => (prev === est._id ? null : est._id))}
                          className={`hover:bg-gray-50 cursor-pointer transition-colors ${isExpanded ? "bg-slate-50" : ""}`}
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400 flex-shrink-0">
                                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              </span>
                              <div className="text-sm font-medium text-gray-900 max-w-[180px] truncate" title={addressStr}>
                                {addressStr}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              est.building_type === "Residential"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-purple-100 text-purple-700"
                            }`}>
                              {est.building_type || "N/A"}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {est.current_roof_material || "N/A"}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-green-600">
                              {est.roof_material || "N/A"}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {est.roof_teep || "N/A"}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">
                              {est.area ? String(est.area) : "N/A"}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              est.timeline === "Now"
                                ? "bg-red-100 text-red-700"
                                : est.timeline === "1-3 months" || est.timeline?.includes("1-3")
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                            }`}>
                              {est.timeline || "N/A"}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {est.createdAt ? new Date(est.createdAt).toLocaleDateString() : "N/A"}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewPreliminaryEstimate(est)}
                                className="px-3 py-1.5 text-white text-xs font-medium rounded-lg transition flex items-center gap-1 cursor-pointer"
                                style={{ backgroundColor: "#8b0e0f" }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#6d0b0c")}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#8b0e0f")}
                              >
                                <Eye className="w-3 h-3" />
                                Preliminary Estimate
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleEmailReport(est); }}
                                disabled={emailingId === est._id}
                                title="Send report PDF to your email"
                                className="px-3 py-1.5 border border-[#8b0e0f] text-[#8b0e0f] text-xs font-medium rounded-lg hover:bg-red-50 transition flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Mail className="w-3 h-3" />
                                {emailingId === est._id ? "Sending…" : "Email report"}
                              </button>
                              <button
                                onClick={() => handleDeleteEstimate(est._id)}
                                disabled={deletingId === est._id}
                                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete estimate"
                                aria-label="Delete estimate"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${est._id}-detail`} className="bg-slate-50/80">
                            <td colSpan={9} className="px-4 pb-4 pt-0 align-top">
                              <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                  {/* Address & Contact */}
                                  <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                      <MapPin className="w-4 h-4 text-gray-500" />
                                      Address & Contact
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <p className="font-medium text-gray-900">{addressStr}</p>
                                      <div className="flex items-center gap-2 text-gray-600">
                                        <User className="w-4 h-4 text-gray-400" />
                                        {[est.first_name, est.last_name].filter(Boolean).join(" ") || "—"}
                                      </div>
                                      {est.email && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                          <Mail className="w-4 h-4 text-gray-400" />
                                          <a href={`mailto:${est.email}`} className="text-blue-600 hover:underline">{est.email}</a>
                                        </div>
                                      )}
                                      {est.mobile_number && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                          <Phone className="w-4 h-4 text-gray-400" />
                                          {est.mobile_number}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {/* Property & Roof */}
                                  <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                      <Home className="w-4 h-4 text-gray-500" />
                                      Property & Roof
                                    </h4>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                      <div>
                                        <p className="text-gray-500">Area</p>
                                        <p className="font-medium text-gray-900">{est.area ?? "—"}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500">Building</p>
                                        <p className="font-medium text-gray-900">{est.building_type ?? "—"}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500">Steepness</p>
                                        <p className="font-medium text-gray-900">{est.roof_teep ?? "—"}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500">Current roof</p>
                                        <p className="font-medium text-gray-900">{est.current_roof_material ?? "—"}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500">Layers</p>
                                        <p className="font-medium text-gray-900">{est.current_roof_layer ?? "—"}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500">Desired roof</p>
                                        <p className="font-medium text-green-700">{est.roof_material ?? "—"}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500">Timeline</p>
                                        <p className="font-medium text-gray-900">{est.timeline ?? "—"}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500">Financing</p>
                                        <p className="font-medium text-gray-900">{est.interested_in_financing === "true" ? "Yes" : est.interested_in_financing ?? "—"}</p>
                                      </div>
                                    </div>
                                  </div>
                                  {/* Estimate Prices */}
                                  <div className="space-y-4 md:col-span-2 lg:col-span-1">
                                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                      <DollarSign className="w-4 h-4 text-gray-500" />
                                      Estimate Prices
                                    </h4>
                                    <div className="space-y-2">
                                      {(est.estimate_price || []).map((ep: any) => (
                                        <div
                                          key={ep._id || ep.title}
                                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm"
                                        >
                                          <div>
                                            <p className="font-medium text-gray-900">{ep.title}</p>
                                            {ep.description && <p className="text-xs text-gray-500 mt-0.5">{ep.description}</p>}
                                          </div>
                                          <span className="font-semibold text-green-600 whitespace-nowrap ml-2">{ep.price_range}</span>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="pt-2 flex items-center gap-2 text-xs text-gray-500">
                                      <Calendar className="w-3.5 h-3.5" />
                                      Created {est.createdAt ? new Date(est.createdAt).toLocaleString() : "—"}
                                    </div>
                                  </div>
                                </div>
                                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleViewPreliminaryEstimate(est); }}
                                    className="px-3 py-1.5 text-white text-xs font-medium rounded-lg cursor-pointer"
                                    style={{ backgroundColor: "#8b0e0f" }}
                                  >
                                    <Eye className="w-3 h-3 inline mr-1" /> Preliminary
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleEmailReport(est); }}
                                    disabled={emailingId === est._id}
                                    title="Send report PDF to your email"
                                    className="px-3 py-1.5 border border-[#8b0e0f] text-[#8b0e0f] rounded-lg text-xs font-medium hover:bg-red-50 cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                                  >
                                    <Mail className="w-3 h-3" />
                                    {emailingId === est._id ? "Sending…" : "Email report"}
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteEstimate(est._id); }}
                                    disabled={deletingId === est._id}
                                    className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 cursor-pointer disabled:opacity-50"
                                  >
                                    <Trash2 className="w-3 h-3 inline mr-1" /> Delete
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Preliminary Estimate Modal */}
        <PreliminaryEstimateModal
          isOpen={isPreliminaryModalOpen}
          onClose={() => setIsPreliminaryModalOpen(false)}
          estimate={selectedEstimate}
        />
      </div>
    </CustomerDashboardLayout>
  );
}
