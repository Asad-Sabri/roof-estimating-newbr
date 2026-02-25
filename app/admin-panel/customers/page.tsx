"use client";

import { useState, useEffect, useCallback } from "react";
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
import { getCompanyCustomersAPI, getCompaniesByAdminAPI } from "@/services/companyAPI";
import { assignCustomerToAdminAPI, deleteCustomerAPI } from "@/services/superAdminAPI";
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
  assignedToId?: string | null;
  createdById?: string | null;
};

function normalizeCustomersList(res: any): Customer[] {
  let list: any[] = [];
  if (Array.isArray(res)) list = res;
  else if (res?.data && Array.isArray(res.data)) list = res.data;
  else if (res?.customers && Array.isArray(res.customers)) list = res.customers;
  else if (res && typeof res === "object") list = [res];
  return list.map((c: any) => {
    const at = c.assignedTo ?? c.assigned_to;
    const assignedToId = at?._id ?? (typeof at === "string" ? at : null) ?? null;
    const createdBy = c.createdBy ?? c.created_by;
    const createdById = createdBy?._id ?? (typeof createdBy === "string" ? createdBy : null) ?? null;
    return {
      _id: c._id ?? c.id,
      id: typeof c.id === "number" ? c.id : undefined,
      name: c.name ?? (([c.first_name, c.last_name].filter(Boolean).join(" ") || c.email) || "—"),
      email: c.email ?? "—",
      phone: c.phone ?? c.mobile_number ?? c.mobile ?? "—",
      status: (c.status ?? (c.is_active === false ? "Inactive" : "Active")) as "Active" | "Inactive",
      totalJobs: c.totalJobs ?? c.total_jobs ?? 0,
      totalProposals: c.totalProposals ?? c.total_proposals ?? 0,
      totalPayments: c.totalPayments ?? c.total_payments ?? 0,
      approved: c.approved ?? c.is_approved ?? true,
      assignedToId: assignedToId || undefined,
      createdById: createdById || undefined,
    };
  });
}

const emptyForm = {
  first_name: "",
  middle_name: "",
  last_name: "",
  email: "",
  mobile_number: "",
  password: "",
  company_id: "",
  postal_code: "",
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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [createLoading, setCreateLoading] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [adminCompanies, setAdminCompanies] = useState<{ _id: string; companyName?: string; name?: string }[]>([]);

  const fetchAdminCompanies = useCallback(async () => {
    try {
      const profileRes: any = await getProfileAPI();
      const profile = profileRes?.data ?? profileRes;
      const adminId = profile?._id ?? profile?.id ?? profile?.user_id;
      if (!adminId) return;
      const res = await getCompaniesByAdminAPI(adminId);
      let list: { _id: string; companyName?: string; name?: string }[] = [];
      if (Array.isArray(res)) list = res;
      else if (res?.data && Array.isArray(res.data)) list = res.data;
      else if (res?.companies && Array.isArray(res.companies)) list = res.companies;
      setAdminCompanies(list);
    } catch {
      setAdminCompanies([]);
    }
  }, []);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCompanyCustomersAPI();
      const list = normalizeCustomersList(res);
      setCustomers(list);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? "Failed to load customers.";
      setError(msg);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    fetchAdminCompanies();
  }, [fetchAdminCompanies]);

  const toggleStatus = (id: number) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "Active" ? "Inactive" : "Active" }
          : c
      )
    );
  };

  const deleteCustomer = (id: number | string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    const idStr = typeof id === "string" ? id : undefined;
    const idNum = typeof id === "number" ? id : undefined;
    if (idStr) {
      deleteCustomerAPI(idStr)
        .then(() => {
          toast.success("Customer deleted.");
          fetchCustomers();
        })
        .catch((e: any) => toast.error(e?.response?.data?.message ?? e?.message ?? "Delete failed."));
      return;
    }
    setCustomers((prev) => prev.filter((c) => c.id !== idNum));
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
      const payload: Record<string, string> = {
        first_name: form.first_name.trim(),
        middle_name: form.middle_name?.trim() || "",
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        password: form.password,
        company: form.company_id?.trim() || "",
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
      await fetchCustomers();
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

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center min-h-[40vh] gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-[#8b0e0f]" />
          <span className="text-gray-600">Loading customers...</span>
        </div>
      </AdminDashboardLayout>
    );
  }

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
            {error && (
              <span className="text-xs text-red-600 font-medium">{error}</span>
            )}
            <span className="text-xs text-black font-bold">{customers.length} Customers (yours only)</span>
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
                        <button
                          onClick={() => toggleStatus(c.id!)}
                          className="flex items-center gap-1 px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                          {c.status === "Active" ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                          {c.status === "Active" ? "Deactivate" : "Activate"}
                        </button>
                      )}
                      {(c._id || typeof c.id === "number") && (
                        <button
                          onClick={() => deleteCustomer(c._id ?? c.id!)}
                          className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">My Company</label>
                  <select
                    value={form.company_id}
                    onChange={(e) => setForm((p) => ({ ...p, company_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b0e0f] focus:border-transparent bg-white"
                  >
                    <option value="">Select company (optional)</option>
                    {adminCompanies.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.companyName ?? c.name ?? c._id}
                      </option>
                    ))}
                  </select>
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
