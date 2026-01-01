"use client";

import { useState, useEffect } from "react";
import CustomerDashboardLayout from "@/app/dashboard/customer/page";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";
import EstimateModal from "@/components/estimating/EstimateModal";
import { FileText, TrendingUp, DollarSign, Calendar } from "lucide-react";

export default function EstimatingPage() {
  useProtectedRoute();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [estimates, setEstimates] = useState<any[]>([]);

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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roof Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estimates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {estimates.map((estimate) => (
                    <tr key={estimate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {estimate.address || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {estimate.desiredRoofType || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {estimate.estimates?.length || 0} estimates
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(estimate.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-green-600 hover:text-green-900">
                          View Details
                        </button>
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
      </div>
    </CustomerDashboardLayout>
  );
}

