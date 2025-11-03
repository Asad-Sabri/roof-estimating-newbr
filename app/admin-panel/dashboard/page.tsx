"use client";

import AdminDashboardLayout from "@/app/dashboard/admin/page";
import {
  Users,
  Briefcase,
  FileText,
  CreditCard,
  BarChart3,
  ClipboardPlus,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

// ✅ Stats Overview
const stats = [
  { name: "Total Customers", value: "120", icon: Users, color: "from-green-500 to-emerald-600", link: "/admin-panel/customers" },
  { name: "Active Jobs", value: "35", icon: Briefcase, color: "from-blue-500 to-indigo-600", link: "/admin-panel/job-progress" },
  { name: "Proposals Sent", value: "220", icon: FileText, color: "from-purple-500 to-pink-600", link: "/admin-panel/proposals" },
  { name: "Payments Received", value: "$85,000", icon: CreditCard, color: "from-yellow-500 to-orange-600", link: "/admin-panel/payments" },
  { name: "Job Progress Updates", value: "150", icon: BarChart3, color: "from-cyan-500 to-teal-600", link: "/admin-panel/job-progress" },
  { name: "Estimates Requested", value: "50", icon: ClipboardPlus, color: "from-red-500 to-pink-600", link: "/admin-panel/estimates" },
];

// ✅ Recent Activities
const activities = [
  { id: 1, user: "John Doe", action: "Requested an estimate", time: "2h ago" },
  { id: 2, user: "Alice Smith", action: "Signed a proposal", time: "5h ago" },
  { id: 3, user: "Mark Johnson", action: "Made a payment of $1,200", time: "1d ago" },
  { id: 4, user: "Sarah Lee", action: "Uploaded job progress photos", time: "2d ago" },
];

export default function AdminDashboardPage() {
  return (
    <AdminDashboardLayout>
      <div className="space-y-10 animate-fadeIn">
        {/* 🔹 Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-gradient-to-r from-green-600 to-teal-600 text-white p-6 rounded-2xl shadow-md">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-green-100 mt-1">
              Overview of customer activity and performance
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              href="/admin-panel/reports"
              className="flex items-center gap-2 bg-white text-green-700 font-semibold px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition"
            >
              View Reports <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* 🔹 Stats Section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.name} href={stat.link}>
                <div className="group bg-white rounded-xl shadow-lg p-6 flex items-center gap-5 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer relative overflow-hidden">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white shadow-md`}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{stat.name}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <ArrowRight className="absolute right-4 text-gray-400 group-hover:text-gray-600 transition" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* 🔹 Recent Activities */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            Recent Customer Activities
          </h2>
          <ul className="divide-y divide-gray-200">
            {activities.map((activity) => (
              <li
                key={activity.id}
                className="py-4 flex justify-between items-center hover:bg-gray-50 px-3 rounded-lg transition"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {activity.user}
                  </p>
                  <p className="text-sm text-gray-500">{activity.action}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 🔹 Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/admin-panel/job-progress"
              className="flex flex-col items-center justify-center gap-2 bg-blue-50 border border-blue-100 rounded-xl p-4 hover:bg-blue-100 transition"
            >
              <Briefcase className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-medium">Manage Jobs</span>
            </Link>
            <Link
              href="/admin-panel/proposals"
              className="flex flex-col items-center justify-center gap-2 bg-purple-50 border border-purple-100 rounded-xl p-4 hover:bg-purple-100 transition"
            >
              <FileText className="h-6 w-6 text-purple-600" />
              <span className="text-sm font-medium">View Proposals</span>
            </Link>
            <Link
              href="/admin-panel/payments"
              className="flex flex-col items-center justify-center gap-2 bg-yellow-50 border border-yellow-100 rounded-xl p-4 hover:bg-yellow-100 transition"
            >
              <CreditCard className="h-6 w-6 text-yellow-600" />
              <span className="text-sm font-medium">Track Payments</span>
            </Link>
            <Link
              href="/admin-panel/estimates"
              className="flex flex-col items-center justify-center gap-2 bg-red-50 border border-red-100 rounded-xl p-4 hover:bg-red-100 transition"
            >
              <ClipboardPlus className="h-6 w-6 text-red-600" />
              <span className="text-sm font-medium">Review Estimates</span>
            </Link>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
