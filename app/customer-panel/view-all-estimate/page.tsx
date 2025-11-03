"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Eye, ArrowLeft, DownloadCloud, X } from "lucide-react";
import CustomerDashboardLayout from "@/app/dashboard/customer/page";

type EstimateStatus = "Pending" | "Approved" | "Rejected";

interface EstimateLine {
  id: number;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
}

interface Estimate {
  id: number;
  title: string;
  description: string;
  status: EstimateStatus;
  createdAt: string;
  total: number;
  items: EstimateLine[];
}

export default function ViewAllEstimatesPage() {
  const router = useRouter();

  // Sample data (you can replace with API data)
  const [estimates] = useState<Estimate[]>([
    {
      id: 301,
      title: "Estimate #301 - Roof Replacement",
      description: "Complete shingle replacement for Smith House",
      status: "Pending",
      createdAt: "2025-09-10",
      total: 1323.0,
      items: [
        { id: 1, description: "Shingles (packs)", qty: 10, unit: "pack", unitPrice: 25, lineTotal: 250 },
        { id: 2, description: "Underlayment (rolls)", qty: 3, unit: "roll", unitPrice: 80, lineTotal: 240 },
        { id: 3, description: "Labor", qty: 16, unit: "hours", unitPrice: 50, lineTotal: 800 },
      ],
    },
    {
      id: 300,
      title: "Estimate #300 - Leak Repair",
      description: "Leak fix for Johnson Villa",
      status: "Approved",
      createdAt: "2025-09-07",
      total: 420.0,
      items: [
        { id: 1, description: "Flashings & seals", qty: 1, unit: "set", unitPrice: 120, lineTotal: 120 },
        { id: 2, description: "Labor", qty: 6, unit: "hours", unitPrice: 50, lineTotal: 300 },
      ],
    },
    {
      id: 299,
      title: "Estimate #299 - Inspection",
      description: "Inspection report for Green Cottage",
      status: "Rejected",
      createdAt: "2025-09-03",
      total: 180.0,
      items: [
        { id: 1, description: "Inspection & report", qty: 1, unit: "job", unitPrice: 180, lineTotal: 180 },
      ],
    },
  ]);

  const [selected, setSelected] = useState<Estimate | null>(null);

  const statusColor = (status: EstimateStatus) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // open modal
  const openEstimate = (e: Estimate) => {
    setSelected(e);
    // optional: prevent background scroll
    document.body.style.overflow = "hidden";
  };

  // close modal
  const closeModal = () => {
    setSelected(null);
    document.body.style.overflow = "";
  };

  // close on Escape
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // navigate to full page
  const openFullPage = (id: number) => {
    closeModal();
    router.push(`/customer-panel/estimates/${id}`);
  };

  return (
    <CustomerDashboardLayout>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
            <FileText className="text-blue-600" /> All Estimates
          </h1>
          <Link
            href="/customer-panel/dashboard"
            className="inline-flex items-center gap-1 text-sm px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-100"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </header>

        {/* Estimates Grid */}
        <motion.section
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {estimates.map((estimate) => (
            <motion.article
              key={estimate.id}
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition flex flex-col justify-between"
              whileHover={{ scale: 1.02 }}
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText size={18} className="text-blue-600" /> {estimate.title}
                </h3>
                <p className="text-sm text-gray-500 mt-2">{estimate.description}</p>
                <div className="mt-3 text-xs text-gray-400">Created: {estimate.createdAt}</div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusColor(
                    estimate.status
                  )}`}
                >
                  {estimate.status}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEstimate(estimate)}
                    className="flex items-center gap-1 px-3 cursor-pointer py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Eye size={14} /> View
                  </button>

                  <Link
                    href={`/customer-panel/estimates/${estimate.id}`}
                    className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Details
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.section>

        {/* Modal: Estimate details */}
        {selected && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center"
            aria-modal="true"
            role="dialog"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={closeModal}
            />

            {/* Modal panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="relative z-10 w-full max-w-3xl mx-4 bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center gap-3">
                  <FileText className="text-blue-600" />
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{selected.title}</div>
                    <div className="text-xs text-gray-500">Created: {selected.createdAt}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      // placeholder download link
                      // replace with real PDF generation endpoint when available
                      const pdfUrl = `/api/estimates/${selected.id}/pdf`;
                      // open in new tab
                      window.open(pdfUrl, "_blank");
                    }}
                    className="inline-flex items-center cursor-pointer gap-2 px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
                  >
                    <DownloadCloud size={16} /> Download PDF
                  </button>

                  <button
                    onClick={closeModal}
                    className="p-2 rounded-md cursor-pointer hover:bg-gray-100"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="px-6 py-4">
                <p className="text-sm text-gray-700 mb-4">{selected.description}</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-500 border-b">
                        <th className="py-2">Item</th>
                        <th className="py-2">Qty</th>
                        <th className="py-2">Unit Price</th>
                        <th className="py-2 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.items.map((it) => (
                        <tr key={it.id} className="border-b last:border-b-0">
                          <td className="py-3">{it.description}</td>
                          <td className="py-3">{it.qty} {it.unit}</td>
                          <td className="py-3">{it.unitPrice.toLocaleString(undefined, { style: "currency", currency: "USD" })}</td>
                          <td className="py-3 text-right">{it.lineTotal.toLocaleString(undefined, { style: "currency", currency: "USD" })}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="py-3 text-sm font-medium text-gray-700 text-right">Total</td>
                        <td className="py-3 text-right font-semibold">{selected.total.toLocaleString(undefined, { style: "currency", currency: "USD" })}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusColor(selected.status)}`}>
                    {selected.status}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openFullPage(selected.id)}
                      className="bg-blue-600 text-white cursor-pointer px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Open Full Page
                    </button>

                    <button
                      onClick={closeModal}
                      className="border border-gray-300 cursor-pointer px-4 py-2 rounded-md hover:bg-gray-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </CustomerDashboardLayout>
  );
}
