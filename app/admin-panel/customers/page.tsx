"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Edit, Trash2, Eye, ToggleLeft, ToggleRight } from "lucide-react";
import AdminDashboardLayout from "@/app/dashboard/admin/page";

type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: "Active" | "Inactive";
  totalJobs: number;
  totalProposals: number;
  totalPayments: number;
};

// ✅ Define mock data once
const mockData: Customer[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "123-456-7890",
    status: "Active",
    totalJobs: 5,
    totalProposals: 3,
    totalPayments: 2,
  },
  {
    id: 2,
    name: "Sarah Lee",
    email: "sarah@example.com",
    phone: "987-654-3210",
    status: "Inactive",
    totalJobs: 2,
    totalProposals: 1,
    totalPayments: 0,
  },
  {
    id: 3,
    name: "Michael Smith",
    email: "michael@example.com",
    phone: "222-333-4444",
    status: "Active",
    totalJobs: 8,
    totalProposals: 5,
    totalPayments: 4,
  },
  {
    id: 4,
    name: "Emma Wilson",
    email: "emma@example.com",
    phone: "111-999-8888",
    status: "Active",
    totalJobs: 1,
    totalProposals: 1,
    totalPayments: 1,
  },
];

export default function AdminCustomersPage() {
  // ✅ Start with mockData
  const [customers, setCustomers] = useState<Customer[]>(mockData);

  // ✅ Load from localStorage only on client
  useEffect(() => {
    const saved = localStorage.getItem("customers_admin");
    if (saved) {
      setCustomers(JSON.parse(saved));
    } else {
      localStorage.setItem("customers_admin", JSON.stringify(mockData));
    }
  }, []);

  // ✅ Save updates to localStorage
  useEffect(() => {
    if (customers.length > 0) {
      localStorage.setItem("customers_admin", JSON.stringify(customers));
    }
  }, [customers]);

  // ✅ Actions
  const toggleStatus = (id: number) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "Active" ? "Inactive" : "Active" }
          : c
      )
    );
  };

  const deleteCustomer = (id: number) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    setCustomers((prev) => prev.filter((c) => c.id !== id));
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
        <header className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-5 px-2 md:px-6 flex items-center justify-between">
          <h1 className=" text-sm md:text-2xl font-bold flex items-center gap-2">
            <User /> Admin – Customers
          </h1>
          <span className="text-xs">{customers.length} Customers</span>
        </header>

        {/* Table */}
        <section className="my-8">
          <div className="overflow-x-auto bg-white">
            <table className="w-full border border-gray-300 rounded-lg shadow text-sm min-w-[1200px]">
              <thead className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Jobs</th>
                  <th className="p-3 text-left">Proposals</th>
                  <th className="p-3 text-left">Payments</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr
                    key={c.id}
                    className="border-t border-gray-300 hover:bg-gray-50"
                  >
                    <td className="p-3">{c.name}</td>
                    <td className="p-3">{c.email}</td>
                    <td className="p-3">{c.phone}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          c.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3">{c.totalJobs}</td>
                    <td className="p-3">{c.totalProposals}</td>
                    <td className="p-3">{c.totalPayments}</td>
                    <td className="p-3 flex gap-2 flex-wrap">
                      <button className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                        <Eye size={16} /> View
                      </button>
                      <button className="flex items-center gap-1 px-2 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700">
                        <Edit size={16} /> Edit
                      </button>
                      <button
                        onClick={() => toggleStatus(c.id)}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        {c.status === "Active" ? (
                          <>
                            <ToggleLeft size={16} /> Deactivate
                          </>
                        ) : (
                          <>
                            <ToggleRight size={16} /> Activate
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => deleteCustomer(c.id)}
                        className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-gray-500">
                      No customers found.
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
