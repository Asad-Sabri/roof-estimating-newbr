"use client";

import SuperAdminDashboardLayout from "@/app/dashboard/super-admin/page";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";
import { BarChart3, TrendingUp, DollarSign, Users, Building2 } from "lucide-react";

export default function SuperAdminReportsPage() {
  useProtectedRoute();

  return (
    <SuperAdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="text-cyan-600" size={32} />
            System Reports
          </h1>
          <p className="text-gray-600 mt-1">Comprehensive analytics and system insights</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">$2.5M</p>
                <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp size={14} />
                  +24% from last month
                </p>
              </div>
              <DollarSign className="text-green-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">1,248</p>
                <p className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                  <TrendingUp size={14} />
                  +12% from last month
                </p>
              </div>
              <Users className="text-blue-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Companies</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">8</p>
                <p className="text-sm text-purple-600 mt-1 flex items-center gap-1">
                  <TrendingUp size={14} />
                  +2 this month
                </p>
              </div>
              <Building2 className="text-purple-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">156</p>
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <TrendingUp size={14} />
                  +8% from last month
                </p>
              </div>
              <BarChart3 className="text-red-600" size={32} />
            </div>
          </div>
        </div>

        {/* Charts Placeholder */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Revenue Trend</h2>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">Chart will be displayed here</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">User Growth</h2>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">Chart will be displayed here</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">System Activity Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">New Customers This Week</span>
              <span className="font-bold text-gray-900">45</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">New Admins Created</span>
              <span className="font-bold text-gray-900">3</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Total Estimates Generated</span>
              <span className="font-bold text-gray-900">1,234</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Completed Jobs</span>
              <span className="font-bold text-gray-900">89</span>
            </div>
          </div>
        </div>
      </div>
    </SuperAdminDashboardLayout>
  );
}
