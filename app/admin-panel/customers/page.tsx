"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Edit,
  Trash2,
  Eye,
  ToggleLeft,
  ToggleRight,
  Plus,
  X,
  CheckCircle,
  Loader2,
} from "lucide-react";
import AdminDashboardLayout from "@/app/dashboard/admin/page";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";
import { signupAPI, approveUserAPI, getProfileAPI } from "@/services/auth";
import { assignCustomerToAdminAPI } from "@/services/superAdminAPI";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type Customer = {
  id?: number;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  status: "Active" | "Inactive";
  totalJobs: number;
  totalProposals: number;
  totalPayments: number;
  approved?: boolean;
};

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
    approved: true,
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
    approved: true,
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
    approved: true,
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
    approved: true,
  },
];

const emptyForm = {
  first_name: "",
  middle_name: "",
  last_name: "",
  email: "",
  mobile_number: "",
  password: "",
  company: "",
  postal_code: "",
  account_type: "customer",
  // role_id: 1,
};

// Backend expects mobile with + and digits (e.g. +923000000000)
function normalizeMobile(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return "";
  return value.trim().startsWith("+") ? value.trim() : `+${digits}`;
}

function isValidMobile(value: string): boolean {
  const normalized = normalizeMobile(value);
  return /^\+?\d{10,15}$/.test(normalized) && normalized.length >= 10;
}

export default function AdminCustomersPage() {
  useProtectedRoute();
  const [customers, setCustomers] = useState<Customer[]>(mockData);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [createLoading, setCreateLoading] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("customers_admin");
    if (saved) {
      try {
        setCustomers(JSON.parse(saved));
      } catch {
        localStorage.setItem("customers_admin", JSON.stringify(mockData));
      }
    } else {
      localStorage.setItem("customers_admin", JSON.stringify(mockData));
    }
  }, []);

  useEffect(() => {
    if (customers.length > 0) {
      localStorage.setItem("customers_admin", JSON.stringify(customers));
    }
  }, [customers]);

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

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name?.trim() || !form.last_name?.trim() || !form.email?.trim() || !form.mobile_number?.trim() || !form.password?.trim()) {
      toast.error("Please fill all required fields.");
      return;
    }
    const mobile = normalizeMobile(form.mobile_number);
    if (!isValidMobile(form.mobile_number)) {
      toast.error("Enter a valid mobile number with country code (e.g. +923001234567).");
      return;
    }
    setCreateLoading(true);
    try {
      const payload = {
        account_type: form.account_type,
        first_name: form.first_name.trim(),
        middle_name: form.middle_name?.trim() || "",
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        password: form.password,
        company: form.company?.trim() || "",
        postal_code: form.postal_code?.trim() || "",
        mobile_number: mobile,
        role: "customer",
      };
      const response: any = await signupAPI(payload);
      const data = response?.data ?? response;
      const userId = data?._id ?? data?.user?._id ?? data?.id ?? data?.user?.id;
      const newCustomer: Customer = {
        _id: userId,
        name: `${form.first_name.trim()} ${form.last_name.trim()}`.trim(),
        email: form.email.trim(),
        phone: mobile,
        status: "Active",
        totalJobs: 0,
        totalProposals: 0,
        totalPayments: 0,
        approved: false,
      };
      setCustomers((prev) => [newCustomer, ...prev]);
      setForm(emptyForm);
      setModalOpen(false);
      toast.success("Customer created. They can login after you approve.");
      if (userId) {
        try {
          const profileRes: any = await getProfileAPI();
          const profile = profileRes?.data ?? profileRes;
          const adminId = profile?._id ?? profile?.id ?? profile?.user_id;
          if (adminId) {
            await assignCustomerToAdminAPI(userId, adminId);
            toast.success("Customer assigned to you.");
          }
        } catch {
          // Assign may be super-admin only; customer is still created
        }
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.response?.data?.detail ?? err?.message ?? "Failed to create customer.";
      toast.error(msg);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    setApprovingId(userId);
    try {
      await approveUserAPI({ userId });
      setCustomers((prev) =>
        prev.map((c) => (c._id === userId ? { ...c, approved: true } : c))
      );
      toast.success("Customer approved. They can now login.");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Approve failed.";
      toast.error(msg);
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <AdminDashboardLayout>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-gray-900"
      >
        <header className="bg-gray-200 text-white py-5 px-2 md:px-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-sm md:text-2xl font-bold flex items-center gap-2 text-black">
            <User /> Customers
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-black font-bold">{customers.length} Customers</span>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#8b0e0f] text-white hover:opacity-90 text-sm font-medium"
            >
              <Plus size={18} /> Create Customer
            </button>
          </div>
        </header>

        <section className="my-8">
          <div className="overflow-x-auto bg-white">
            <table className="w-full border border-gray-300 rounded-lg shadow text-sm min-w-[1200px]">
              <thead className="text-white" style={{ backgroundColor: "#8b0e0f" }}>
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Approved</th>
                  <th className="p-3 text-left">Jobs</th>
                  <th className="p-3 text-left">Proposals</th>
                  <th className="p-3 text-left">Payments</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr
                    key={c._id ?? c.id ?? c.email}
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
                    <td className="p-3">
                      {c.approved !== false ? (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1 w-fit">
                          <CheckCircle size={14} /> Approved
                        </span>
                      ) : (
                        <span className="text-amber-700 text-xs font-semibold">
                          Not Approved
                        </span>
                      )}
                      {c.approved === false && c._id && (
                        <button
                          type="button"
                          onClick={() => handleApprove(c._id!)}
                          disabled={approvingId === c._id}
                          className="ml-2 px-2 py-1 bg-[#8b0e0f] text-white rounded text-xs hover:opacity-90 disabled:opacity-60 flex items-center gap-1"
                        >
                          {approvingId === c._id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            "Approve"
                          )}
                        </button>
                      )}
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
                      {typeof c.id === "number" && (
                        <>
                          <button
                            onClick={() => toggleStatus(c.id!)}
                            className="flex items-center gap-1 px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                          >
                            {c.status === "Active" ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                            {c.status === "Active" ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            onClick={() => deleteCustomer(c.id!)}
                            className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-6 text-gray-500">
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Create Customer Modal */}
        {modalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => !createLoading && setModalOpen(false)}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Create Customer</h2>
                <button
                  type="button"
                  onClick={() => !createLoading && setModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateCustomer} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Type *</label>
                    <select
                      value={form.account_type}
                      onChange={(e) => setForm((p) => ({ ...p, account_type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b0e0f] focus:border-transparent bg-white"
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role ID *</label>
                    <select
                      value={form.role_id}
                      onChange={(e) => setForm((p) => ({ ...p, role_id: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b0e0f] focus:border-transparent bg-white"
                    >
                      <option value={1}>1 - Customer</option>
                      <option value={2}>2 - Admin</option>
                      <option value={3}>3 - Other</option>
                    </select>
                  </div> */}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      value={form.first_name}
                      onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b0e0f] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      value={form.last_name}
                      onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b0e0f] focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                  <input
                    type="text"
                    value={form.middle_name}
                    onChange={(e) => setForm((p) => ({ ...p, middle_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b0e0f] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b0e0f] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    value={form.mobile_number}
                    onChange={(e) => setForm((p) => ({ ...p, mobile_number: e.target.value }))}
                    placeholder="+923001234567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b0e0f] focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Include country code with + (e.g. +923001234567)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b0e0f] focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Min 6 characters. Customer will use this to login.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
                    placeholder="MyCompany"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b0e0f] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={form.postal_code}
                    onChange={(e) => setForm((p) => ({ ...p, postal_code: e.target.value }))}
                    placeholder="54000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b0e0f] focus:border-transparent"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    disabled={createLoading}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="flex-1 px-4 py-2 rounded-lg bg-[#8b0e0f] text-white hover:opacity-90 disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {createLoading ? <Loader2 size={18} className="animate-spin" /> : null}
                    {createLoading ? "Creating..." : "Create Customer"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </motion.main>
    </AdminDashboardLayout>
  );
}
