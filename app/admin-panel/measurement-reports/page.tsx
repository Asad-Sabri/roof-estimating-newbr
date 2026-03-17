"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Download, FileCode, RefreshCw } from "lucide-react";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";
import {
  getMeasurementReportsAPI,
  downloadMeasurementReportPdfAPI,
  downloadMeasurementReportXactimateAPI,
} from "@/services/measurementReportAPI";
import { toast } from "react-toastify";

export default function MeasurementReportsPage() {
  useProtectedRoute();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pdfId, setPdfId] = useState<string | null>(null);
  const [xactimateId, setXactimateId] = useState<string | null>(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await getMeasurementReportsAPI();
      const data = res?.data ?? res;
      setReports(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load measurement reports.");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleDownloadPdf = async (id: string) => {
    setPdfId(id);
    try {
      await downloadMeasurementReportPdfAPI(id);
      toast.success("PDF downloaded.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to download PDF.");
    } finally {
      setPdfId(null);
    }
  };

  const handleDownloadXactimate = async (id: string) => {
    setXactimateId(id);
    try {
      await downloadMeasurementReportXactimateAPI(id);
      toast.success("Xactimate export downloaded.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to export Xactimate.");
    } finally {
      setXactimateId(null);
    }
  };

  const addressStr = (r: any) => {
    const a = r?.address ?? r?.property_address;
    if (typeof a === "string") return a;
    if (a && typeof a === "object") return [a.street, a.city, a.state, a.zip_code].filter(Boolean).join(", ");
    return "—";
  };

  return (
    <AdminDashboardLayout>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 md:p-6"
      >
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-8 h-8" style={{ color: "#8b0e0f" }} />
            Measurement Reports
          </h1>
          <button
            onClick={fetchList}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </header>

        <p className="text-gray-600 mb-4">
          List is scoped to your company. Download PDF or export Xactimate (XML) per report.
        </p>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#8b0e0f]" />
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No measurement reports yet. Create reports from projects or the measurement flow.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Address</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Area (sq ft)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Roof type / system</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.map((r) => (
                  <tr key={r._id || r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{addressStr(r)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{r.total_roof_area ?? r.totalRoofArea ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {[r.roof_type, r.roof_system].filter(Boolean).join(" / ") || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownloadPdf(r._id || r.id)}
                          disabled={pdfId === (r._id || r.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Download className="w-4 h-4" />
                          {pdfId === (r._id || r.id) ? "…" : "PDF"}
                        </button>
                        <button
                          onClick={() => handleDownloadXactimate(r._id || r.id)}
                          disabled={xactimateId === (r._id || r.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                        >
                          <FileCode className="w-4 h-4" />
                          {xactimateId === (r._id || r.id) ? "…" : "Xactimate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.main>
    </AdminDashboardLayout>
  );
}
