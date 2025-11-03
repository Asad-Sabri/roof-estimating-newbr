"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Trash2, FileText } from "lucide-react";
import AdminDashboardLayout from "@/app/dashboard/admin/page";

type Estimate = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  roofType: string;
  areaSize: number;
  fileName?: string;
  status: "Pending" | "Approved" | "Rejected";
};

export default function AdminRequestEstimatePage() {
  const [estimates, setEstimates] = useState<Estimate[]>([]);

  useEffect(() => {
    // ✅ Run only in browser
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("estimates_admin");
      if (saved && saved !== "[]") {
        setEstimates(JSON.parse(saved));
      } else {
        // Mock Data
        const mockData: Estimate[] = [
          {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            phone: "123-456-7890",
            address: "123 Main St",
            roofType: "Asphalt",
            areaSize: 1500,
            fileName: "/roof.png",
            status: "Pending",
          },
          {
            id: 2,
            name: "Sarah Lee",
            email: "sarah@example.com",
            phone: "987-654-3210",
            address: "456 Park Ave",
            roofType: "Metal",
            areaSize: 2200,
            fileName: "/roof.png",
            status: "Approved",
          },
          {
            id: 3,
            name: "Michael Smith",
            email: "michael@example.com",
            phone: "222-333-4444",
            address: "789 Hilltop Rd",
            roofType: "Tile",
            areaSize: 1800,
            fileName: "/roof.png",
            status: "Rejected",
          },
        ];
        setEstimates(mockData);
        localStorage.setItem("estimates_admin", JSON.stringify(mockData));
      }
    }
  }, []);

  // ✅ Keep localStorage synced
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("estimates_admin", JSON.stringify(estimates));
    }
  }, [estimates]);

  const updateStatus = (id: number, status: "Approved" | "Rejected") => {
    setEstimates((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status } : e))
    );
  };

  const deleteEstimate = (id: number) => {
    if (!confirm("Are you sure you want to delete this estimate?")) return;
    setEstimates((prev) => prev.filter((e) => e.id !== id));
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
        <header className="bg-gradient-to-r flex-col md:flex-row from-green-600 to-teal-600 text-white py-5 px-2 md:px-6 flex md:items-center justify-between">
          <h1 className=" md:text-2xl font-bold flex items-center  gap-2">
            <FileText /> Admin – Request Estimates
          </h1>
          <span className="text-xs text-end">{estimates.length} Requests</span>
        </header>

        {/* Table */}
        <section className="my-8">
          <div className="overflow-x-auto bg-white">
            <table className="w-full border border-gray-300 rounded-lg shadow text-sm min-w-[1200px]">
              <thead className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-lg">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">Address</th>
                  <th className="p-3 text-left">Roof Type</th>
                  <th className="p-3 text-left">Area Size</th>
                  <th className="p-3 text-left">File</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {estimates.map((e) => (
                  <tr key={e.id} className="border-t border-gray-300 hover:bg-gray-50">
                    <td className="p-3">{e.name}</td>
                    <td className="p-3">{e.email}</td>
                    <td className="p-3">{e.phone}</td>
                    <td className="p-3">{e.address}</td>
                    <td className="p-3">{e.roofType}</td>
                    <td className="p-3">{e.areaSize} sq. ft.</td>
                    <td className="p-3">
                      {e.fileName ? (
                        <a
                          href={e.fileName}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="text-blue-600 underline cursor-pointer"
                        >
                          {e.fileName}
                        </a>
                      ) : (
                        "No File"
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          e.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : e.status === "Rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className="p-3 flex gap-2 flex-wrap">
                      {e.status === "Pending" && (
                        <>
                          <button
                            onClick={() => updateStatus(e.id, "Approved")}
                            className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            <CheckCircle size={16} /> Approve
                          </button>
                          <button
                            onClick={() => updateStatus(e.id, "Rejected")}
                            className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            <XCircle size={16} /> Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => deleteEstimate(e.id)}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {estimates.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-6 text-gray-500">
                      No requests available.
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
