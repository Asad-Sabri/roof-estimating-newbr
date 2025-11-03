"use client";

import AdminDashboardLayout from "@/app/dashboard/admin/page"; // ✅ Admin layout
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard as CreditCardIcon,
  Loader2,
  Check,
  XCircle,
  Download,
} from "lucide-react";
import jsPDF from "jspdf";

interface Payment {
  id: string;
  invoiceId: string;
  customer: string;
  amount: number;
  date: string;
  status: "Paid" | "Failed" | "Pending";
  cardLast4?: string;
}

export default function AdminPaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Simulated API load
  useEffect(() => {
    setTimeout(() => {
      setPayments([
        {
          id: "R-1001",
          invoiceId: "INV-5001",
          customer: "John Doe",
          amount: 5200,
          date: new Date().toLocaleDateString(),
          status: "Pending",
          cardLast4: "4242",
        },
        {
          id: "R-1002",
          invoiceId: "INV-5002",
          customer: "Jane Smith",
          amount: 3800,
          date: new Date().toLocaleDateString(),
          status: "Paid",
          cardLast4: "1111",
        },
        {
          id: "R-1003",
          invoiceId: "INV-5003",
          customer: "Michael Brown",
          amount: 2500,
          date: new Date().toLocaleDateString(),
          status: "Failed",
          cardLast4: "9999",
        },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  // Generate receipt PDF
  function generateReceiptPdf(p: Payment) {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const left = 40;

    doc.setFontSize(20).setFont("helvetica", "bold");
    doc.text("Payment Receipt", left, 60);

    doc.setFontSize(12).setFont("helvetica", "normal");
    doc.text(`Receipt ID: ${p.id}`, left, 100);
    doc.text(`Invoice ID: ${p.invoiceId}`, left, 120);
    doc.text(`Customer: ${p.customer}`, left, 140);
    doc.text(`Date: ${p.date}`, left, 160);
    if (p.cardLast4) doc.text(`Card Last4: ${p.cardLast4}`, left, 180);
    doc.text(`Amount: $${p.amount.toLocaleString()}`, left, 200);
    doc.text(`Status: ${p.status}`, left, 220);

    doc.setFontSize(10).setTextColor(120);
    doc.text(
      "This receipt confirms the payment for roofing service. Please keep it for records.",
      left,
      260,
      { maxWidth: 520 }
    );

    doc.save(`receipt-${p.id}.pdf`);
  }

  // Update payment status
  function updateStatus(id: string, status: "Paid" | "Failed") {
    setProcessingId(id);
    setTimeout(() => {
      setPayments((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status } : p))
      );
      setProcessingId(null);
    }, 1000);
  }

  return (
    <AdminDashboardLayout>
      <motion.main
        className="flex flex-col text-gray-900"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className=" md:text-2xl font-bold flex items-center gap-3">
            <CreditCardIcon /> Admin Payments Management
          </h1>

        {/* Content */}
        <section className="flex-1 my-10 overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-20 text-gray-500">
              <Loader2 className="animate-spin h-6 w-6" />
            </div>
          ) : (
            <motion.table
              className="w-full border-collapse bg-white rounded-lg  overflow-hidden min-w-[1000px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <thead className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
                <tr>
                  <th className="p-3 text-left">Invoice ID</th>
                  <th className="p-3 text-left">Customer</th>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-200">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="p-3">{p.invoiceId}</td>
                    <td className="p-3">{p.customer}</td>
                    <td className="p-3">${p.amount.toLocaleString()}</td>
                    <td className="p-3">{p.date}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-semibold ${
                          p.status === "Paid"
                            ? "bg-green-100 text-green-700"
                            : p.status === "Failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 flex gap-2 justify-center">
                      {/* Mark Paid */}
                      <button
                        onClick={() => updateStatus(p.id, "Paid")}
                        disabled={processingId === p.id || p.status === "Paid"}
                        className="px-3 py-1 cursor-pointer bg-green-600 hover:bg-green-700 text-white text-xs rounded-md flex items-center gap-1 disabled:opacity-60"
                      >
                        {processingId === p.id ? (
                          <Loader2 className="animate-spin h-4 w-4" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        Paid
                      </button>

                      {/* Mark Failed */}
                      <button
                        onClick={() => updateStatus(p.id, "Failed")}
                        disabled={processingId === p.id || p.status === "Failed"}
                        className="px-3 py-1 cursor-pointer bg-red-600 hover:bg-red-700 text-white text-xs rounded-md flex items-center gap-1 disabled:opacity-60"
                      >
                        {processingId === p.id ? (
                          <Loader2 className="animate-spin h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        Failed
                      </button>

                      {/* Download Receipt */}
                      <button
                        onClick={() => generateReceiptPdf(p)}
                        disabled={p.status !== "Paid"}
                        className="px-3 py-1 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md flex items-center gap-1 disabled:opacity-60"
                      >
                        <Download className="h-4 w-4" />
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </motion.table>
          )}
        </section>

        {/* Footer */}
        <footer className="bg-white text-gray-500 text-center py-6 border-t">
          © {new Date().getFullYear()} Roof Estimate CRM Admin. All rights reserved.
        </footer>
      </motion.main>
    </AdminDashboardLayout>
  );
}
