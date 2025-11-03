"use client";

import DashboardLayout from "@/app/page";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import {
  FileText,
  CheckCircle,
  XCircle,
  Download,
  Eye,
  Clock,
  User,
} from "lucide-react";
import AdminDashboardLayout from "@/app/dashboard/admin/page";

/* ---------------- Types ---------------- */
type SignedRecord = {
  name: string;
  signatureDataUrl: string;
  timestamp: string;
  userAgent: string;
  ip?: string;
};

type Proposal = {
  id: string;
  title: string;
  customer: string;
  total: string;
  status: "Pending" | "Signed" | "Declined";
  signedRecord?: SignedRecord | null;
};

/* ---------------- Component ---------------- */
export default function AdminProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selected, setSelected] = useState<Proposal | null>(null);

  /* Load proposals from localStorage */
  useEffect(() => {
    const demoProposals: Proposal[] = [
      {
        id: "101",
        title: "Roofing Proposal #101",
        customer: "Jane Doe",
        total: "$12,500",
        status: "Pending",
      },
      {
        id: "102",
        title: "Roofing Proposal #102",
        customer: "John Smith",
        total: "$8,700",
        status: "Pending",
      },
    ];

    // check localStorage for signed records
    const enriched = demoProposals.map((p) => {
      const saved = localStorage.getItem(`proposal-signed-${p.id}`);
      if (saved) {
        const record: SignedRecord = JSON.parse(saved);
        return { ...p, status: "Signed" as const, signedRecord: record };
      }
      const declined = localStorage.getItem(`proposal-declined-${p.id}`);
      if (declined) {
        return { ...p, status: "Declined" as const };
      }
      return p;
    });

    setProposals(enriched);
  }, []);

  /* Generate PDF from signed record */
  async function downloadSignedPdf(id: string, record: SignedRecord) {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 40;

    doc.setFontSize(18).text(`Proposal #${id}`, margin, 60);
    doc.setFontSize(12).text(`Signed by: ${record.name}`, margin, 100);
    doc.text(
      `Date: ${new Date(record.timestamp).toLocaleString()}`,
      margin,
      120
    );
    if (record.ip) doc.text(`IP: ${record.ip}`, margin, 140);

    try {
      doc.addImage(record.signatureDataUrl, "PNG", margin, 180, 200, 80);
    } catch {}

    doc.save(`proposal-${id}-signed.pdf`);
  }

  return (
    <AdminDashboardLayout>
      <motion.main
        className=" text-gray-900"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FileText /> Proposals Dashboard
        </h1>

        {/* Table */}
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
              <tr>
                <th className="p-3">Proposal ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3">Signed Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((p) => (
                <tr key={p.id} className="border-t border-gray-300 transition">
                  <td className="p-3">{p.id}</td>
                  <td className="p-3 flex items-center gap-2">
                    <User size={14} /> {p.customer}
                  </td>
                  <td className="p-3">{p.total}</td>
                  <td className="p-3">
                    {p.status === "Signed" && (
                      <span className="px-2 py-1 rounded bg-green-100 text-green-700 flex items-center gap-1 text-sm">
                        <CheckCircle size={14} /> Signed
                      </span>
                    )}
                    {p.status === "Declined" && (
                      <span className="px-2 py-1 rounded bg-red-100 text-red-700 flex items-center gap-1 text-sm">
                        <XCircle size={14} /> Declined
                      </span>
                    )}
                    {p.status === "Pending" && (
                      <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 flex items-center gap-1 text-sm">
                        <Clock size={14} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-sm text-gray-500">
                    {p.signedRecord
                      ? new Date(p.signedRecord.timestamp).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-3 text-right flex justify-end gap-2">
                    <button
                      onClick={() => setSelected(p)}
                      className="px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 text-sm flex items-center gap-1"
                    >
                      <Eye size={14} /> View
                    </button>
                    {p.signedRecord && (
                      <button
                        onClick={() => downloadSignedPdf(p.id, p.signedRecord!)}
                        className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center gap-1"
                      >
                        <Download size={14} /> PDF
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal for details */}
        {selected && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div
              className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <h2 className="text-xl font-bold mb-4">
                Proposal #{selected.id}
              </h2>
              <p className="text-gray-700 mb-2">
                <strong>Customer:</strong> {selected.customer}
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Total:</strong> {selected.total}
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Status:</strong> {selected.status}
              </p>
              {selected.signedRecord && (
                <>
                  <p className="text-gray-700 mb-2">
                    <strong>Signed By:</strong> {selected.signedRecord.name}
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Date:</strong>{" "}
                    {new Date(selected.signedRecord.timestamp).toLocaleString()}
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>IP:</strong> {selected.signedRecord.ip}
                  </p>
                  <img
                    src={selected.signedRecord.signatureDataUrl}
                    alt="Signature"
                    className="border rounded mt-3 max-h-32"
                  />
                </>
              )}
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </motion.div>
          </div>
        )}
      </motion.main>
    </AdminDashboardLayout>
  );
}
