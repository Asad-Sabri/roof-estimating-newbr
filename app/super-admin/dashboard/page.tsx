"use client";

import SuperAdminDashboardLayout from "@/app/dashboard/super-admin/page";
import {
  Users,
  Shield,
  Building2,
  BarChart3,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";

// Stats Overview
const stats = [
  { 
    name: "Total Admins", 
    value: "12", 
    icon: Shield, 
    color: "from-blue-600 to-blue-700", 
    link: "/super-admin/admins" 
  },
  { 
    name: "Total Customers", 
    value: "1,248", 
    icon: Users, 
    color: "from-green-600 to-green-700", 
    link: "/super-admin/customers" 
  },
  { 
    name: "Active Subscribers", 
    value: "8", 
    icon: Building2, 
    color: "from-purple-600 to-purple-700", 
    link: "/super-admin/companies" 
  },
  { 
    name: "Total Revenue", 
    value: "$2.5M", 
    icon: DollarSign, 
    color: "from-yellow-600 to-yellow-700", 
    link: "/super-admin/reports" 
  },
  { 
    name: "Active Jobs", 
    value: "156", 
    icon: Activity, 
    color: "from-red-600 to-red-700", 
    link: "/super-admin/reports" 
  },
  { 
    name: "Growth Rate", 
    value: "+24%", 
    icon: TrendingUp, 
    color: "from-cyan-600 to-cyan-700", 
    link: "/super-admin/reports" 
  },
];

// Recent Activities
const activities = [
  { id: 1, type: "admin", user: "John Admin", action: "Created new admin account", time: "5m ago" },
  { id: 2, type: "customer", user: "Sarah Customer", action: "Registered new account", time: "12m ago" },
  { id: 3, type: "company", user: "ABC Roofing Co", action: "New company registered", time: "1h ago" },
  { id: 4, type: "admin", user: "Mike Admin", action: "Updated customer assignment", time: "2h ago" },
  { id: 5, type: "customer", user: "David Customer", action: "Requested estimate", time: "3h ago" },
];

export default function SuperAdminDashboardPage() {
  useProtectedRoute();

  return (
    <SuperAdminDashboardLayout>
      <div className="space-y-8 animate-fadeIn">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between text-white p-6 rounded-2xl shadow-md" style={{ backgroundColor: "#8b0e0f" }}>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Super Admin Dashboard</h1>
            <p className="text-sm text-white opacity-90 mt-1">
              Full system overview and management
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              href="/super-admin/reports"
              className="flex items-center gap-2 bg-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition"
              style={{ color: "#8b0e0f" }}
            >
              View Full Reports <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.name} href={stat.link}>
                <div className="group bg-white rounded-xl shadow-lg p-6 flex items-center gap-5 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer relative overflow-hidden">
                  <div className={`p-4 rounded-xl bg-gradient-to-r ${stat.color} text-white shadow-md`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <ArrowRight className="absolute right-4 text-gray-400 group-hover:text-gray-600 transition" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Recent System Activities
          </h2>
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    activity.type === "admin" ? "bg-blue-100" :
                    activity.type === "customer" ? "bg-green-100" :
                    "bg-purple-100"
                  }`}>
                    {activity.type === "admin" ? (
                      <Shield className="h-4 w-4 text-blue-600" />
                    ) : activity.type === "customer" ? (
                      <Users className="h-4 w-4 text-green-600" />
                    ) : (
                      <Building2 className="h-4 w-4 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/super-admin/admins/create"
                className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition"
              >
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Create New Admin</span>
              </Link>
              <Link
                href="/super-admin/customers"
                className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-lg hover:bg-green-100 transition"
              >
                <Users className="h-5 w-5 text-green-600" />
                <span className="font-medium">Manage Customers</span>
              </Link>
              <Link
                href="/super-admin/companies"
                className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-100 rounded-lg hover:bg-purple-100 transition"
              >
                <Building2 className="h-5 w-5 text-purple-600" />
                <span className="font-medium">View All Subscribers</span>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">System Overview</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Total Users</span>
                <span className="font-bold text-gray-900">1,260</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Active Sessions</span>
                <span className="font-bold text-gray-900">342</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Pending Requests</span>
                <span className="font-bold text-red-600">23</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SuperAdminDashboardLayout>
  );
}
