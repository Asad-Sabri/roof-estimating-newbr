"use client";

import { useState, useEffect } from "react";
import CustomerDashboardLayout from "@/app/dashboard/customer/page";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";
import EstimateModal from "@/components/estimating/EstimateModal";
import Link from "next/link";
import { FileText, TrendingUp, DollarSign, Calendar, X, Eye, MapPin, Home, Layers, Clock, CreditCard } from "lucide-react";

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
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isVisible 
          ? 'bg-white/95 backdrop-blur-sm opacity-100' 
          : 'bg-white/0 backdrop-blur-0 opacity-0'
      }`}
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 transform transition-all duration-300 ${
          isVisible 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`sticky top-0 bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4 flex items-center justify-between transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}>
          <div>
            <h2 className="text-xl font-bold text-white">Preliminary Estimate</h2>
            <p className="text-green-100 text-sm mt-1">Estimate #{estimate.id?.slice(-6) || 'N/A'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 text-white transform hover:rotate-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

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
                <button className={`w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 hover:shadow-lg ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: '450ms' }}
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

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
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
  useProtectedRoute();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [estimates, setEstimates] = useState<any[]>([]);
  const [selectedEstimate, setSelectedEstimate] = useState<any>(null);
  const [isPreliminaryModalOpen, setIsPreliminaryModalOpen] = useState(false);

  // Load estimates from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEstimates = localStorage.getItem("customerEstimates");
      if (savedEstimates) {
        setEstimates(JSON.parse(savedEstimates));
      }
    }
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveEstimate = (estimateData: any) => {
    // Save to localStorage
    if (typeof window !== "undefined") {
      const existingEstimates = JSON.parse(
        localStorage.getItem("customerEstimates") || "[]"
      );
      const newEstimate = {
        id: Date.now().toString(),
        ...estimateData,
        createdAt: new Date().toISOString(),
      };
      existingEstimates.push(newEstimate);
      localStorage.setItem("customerEstimates", JSON.stringify(existingEstimates));
      setEstimates(existingEstimates);
    }
    setIsModalOpen(false);
  };

  const handleViewPreliminaryEstimate = (estimate: any) => {
    setSelectedEstimate(estimate);
    setIsPreliminaryModalOpen(true);
  };

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
          <button
            onClick={handleOpenModal}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <TrendingUp className="w-5 h-5" />
            Get Free Estimate
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Estimates</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {estimates.length}
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
                  ${estimates.length > 0
                    ? Math.round(
                        estimates.reduce((sum, e) => {
                          const avg =
                            (e.estimates?.[0]?.minPrice +
                              e.estimates?.[0]?.maxPrice) /
                            2;
                          return sum + avg;
                        }, 0) / estimates.length
                      ).toLocaleString()
                    : "0"}
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
                  {estimates.length > 0
                    ? new Date(estimates[estimates.length - 1].createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Estimates Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden flex-1">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Your Estimates
            </h2>
          </div>

          {estimates.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No estimates yet</p>
              <p className="text-gray-400 mb-6">
                Click "Get Free Estimate" to get started
              </p>
              <button
                onClick={handleOpenModal}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Get Your First Estimate
              </button>
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
                  {estimates.map((estimate) => (
                    <tr key={estimate.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900 max-w-[200px] truncate" title={estimate.address}>
                          {estimate.address || "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          estimate.buildingType === 'Residential' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {estimate.buildingType || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {estimate.currentRoofType || "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">
                          {estimate.desiredRoofType || "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {estimate.roofSteepness || "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          {estimate.totalArea ? Math.round(estimate.totalArea).toLocaleString() : "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          estimate.projectTimeline === 'Now' 
                            ? 'bg-red-100 text-red-700' 
                            : estimate.projectTimeline === 'In 1-3 months'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {estimate.projectTimeline || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(estimate.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleViewPreliminaryEstimate(estimate)}
                            className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            Preliminary Estimate
                          </button>
                          <Link
                            href={`/customer-panel/estimate-report/${estimate.id}`}
                            className="px-3 py-1.5 border text-xs font-medium rounded-lg hover:bg-gray-50 transition"
                          >
                            Report
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Estimate Modal */}
        {isModalOpen && (
          <EstimateModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSaveEstimate}
          />
        )}

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
