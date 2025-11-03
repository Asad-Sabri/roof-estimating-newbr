"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  BarChart3,
  DollarSign,
  Briefcase,
  ClipboardList,
  CalendarDays,
} from "lucide-react";
import AdminDashboardLayout from "@/app/dashboard/admin/page";

type Report = {
  id: number;
  type: string;
  description: string;
  date: string;
  value: string;
};

// ✅ Mock reports data
const mockReports: Report[] = [
  {
    id: 1,
    type: "Revenue",
    description: "Total revenue collected",
    date: "2025-09-12",
    value: "$85,000",
  },
  {
    id: 2,
    type: "Jobs",
    description: "Active jobs in progress",
    date: "2025-09-13",
    value: "35",
  },
  {
    id: 3,
    type: "Proposals",
    description: "Proposals sent to customers",
    date: "2025-09-11",
    value: "220",
  },
  {
    id: 4,
    type: "Payments",
    description: "Payments successfully received",
    date: "2025-09-14",
    value: "150",
  },
  {
    id: 5,
    type: "Estimates",
    description: "Estimates requested by customers",
    date: "2025-09-10",
    value: "50",
  },
];

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);

  // ✅ Load mock reports
  useEffect(() => {
    setReports(mockReports);
  }, []);

  return (
    <AdminDashboardLayout>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-gray-900"
      >
        {/* Header */}
        <header className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-5 px-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText /> Admin – Reports
          </h1>
          <span className="text-sm">{reports.length} Reports</span>
        </header>

        {/* Summary Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8 px-6">
          <div className="bg-white p-5 rounded-xl shadow flex items-center gap-4">
            <DollarSign className="h-10 w-10 text-green-600" />
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-xl font-bold">$85,000</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow flex items-center gap-4">
            <Briefcase className="h-10 w-10 text-blue-600" />
            <div>
              <p className="text-gray-500 text-sm">Active Jobs</p>
              <p className="text-xl font-bold">35</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow flex items-center gap-4">
            <ClipboardList className="h-10 w-10 text-purple-600" />
            <div>
              <p className="text-gray-500 text-sm">Proposals Sent</p>
              <p className="text-xl font-bold">220</p>
            </div>
          </div>
        </section>

        {/* Reports Table */}
        <section className=" my-8">
          <div className="bg-white rounded-xl shadow-md p-6 overflow-x-auto">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 /> Reports Overview
            </h2>
            <table className="w-full border border-gray-300 rounded-lg text-sm">
              <thead className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-md">
                <tr>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Description</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Value</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-t border-gray-300 hover:bg-gray-50 transition"
                  >
                    <td className="p-3 font-medium">{report.type}</td>
                    <td className="p-3">{report.description}</td>
                    <td className="p-3 flex items-center gap-1 text-gray-600">
                      <CalendarDays size={16} /> {report.date}
                    </td>
                    <td className="p-3 font-bold">{report.value}</td>
                    <td className="p-3">
                      <button className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-500">
                      No reports available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </motion.main>
    </AdminDashboardLayout>
  );
}
