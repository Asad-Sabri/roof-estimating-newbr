"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  X,
  Loader2,
  Search,
} from "lucide-react";
import SuperAdminDashboardLayout from "@/app/dashboard/super-admin/page";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";
import {
  getAllCompaniesAPI,
  getCompanyByIdAPI,
  createCompanyAPI,
  updateCompanyAPI,
  deleteCompanyAPI,
} from "@/services/companyAPI";
import type {
  Company,
  CompanyAddress,
  CreateCompanyPayload,
} from "@/types/company";

const emptyAddress: CompanyAddress = {
  street: "",
  city: "",
  state: "",
  country: "",
  zip_code: "",
};

const emptyForm: CreateCompanyPayload = {
  companyName: "",
  licenseNumber: "",
  website: "",
  email: "",
  mobile_number: "",
  address: { ...emptyAddress },
};

function formatAddress(addr: CompanyAddress | undefined): string {
  if (!addr) return "—";
  const parts = [
    addr.street,
    addr.city,
    addr.state,
    addr.country,
    addr.zip_code,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

function formatDate(s: string) {
  try {
    return new Date(s).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return s;
  }
}

export default function SuperAdminCompaniesPage() {
  useProtectedRoute();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState<"add" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateCompanyPayload>(emptyForm);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllCompaniesAPI();
      let list: Company[] = [];
      if (Array.isArray(res)) list = res;
      else if (res?.data && Array.isArray(res.data)) list = res.data;
      else if (res?.companies && Array.isArray(res.companies)) list = res.companies;
      else if (res && typeof res === "object" && "_id" in res) list = [res as Company];
      setCompanies(list);
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "message" in e
          ? String((e as { message: string }).message)
          : "Failed to load companies";
      setError(msg);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen("add");
  };

  const openEdit = async (id: string) => {
    setEditingId(id);
    setModalOpen("edit");
    setSubmitLoading(false);
    try {
      const res = await getCompanyByIdAPI(id);
      const c = res?.data ?? res;
      if (c && typeof c === "object") {
        const addr = c.address && typeof c.address === "object" ? c.address : {};
        setForm({
          companyName: c.companyName ?? "",
          licenseNumber: c.licenseNumber ?? "",
          website: c.website ?? "",
          email: c.email ?? "",
          mobile_number: c.mobile_number ?? "",
          address: {
            street: addr.street ?? "",
            city: addr.city ?? "",
            state: addr.state ?? "",
            country: addr.country ?? "",
            zip_code: addr.zip_code ?? "",
          },
        });
      }
    } catch {
      setError("Failed to load company for edit");
    }
  };

  const closeModal = () => {
    setModalOpen(null);
    setEditingId(null);
    setForm(emptyForm);
    setSubmitLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);
    try {
      const payload: CreateCompanyPayload = {
        companyName: form.companyName.trim(),
        licenseNumber: form.licenseNumber.trim(),
        website: form.website.trim(),
        email: form.email.trim(),
        mobile_number: form.mobile_number.trim(),
        address: {
          street: form.address?.street?.trim() ?? "",
          city: form.address?.city?.trim() ?? "",
          state: form.address?.state?.trim() ?? "",
          country: form.address?.country?.trim() ?? "",
          zip_code: form.address?.zip_code?.trim() ?? "",
        },
      };
      if (modalOpen === "add") {
        await createCompanyAPI(payload);
      } else if (editingId) {
        await updateCompanyAPI(editingId, payload);
      }
      closeModal();
      await fetchCompanies();
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "message" in e
          ? String((e as { message: string }).message)
          : "Request failed";
      setError(msg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this company?")) return;
    setDeleteLoadingId(id);
    setError(null);
    try {
      await deleteCompanyAPI(id);
      await fetchCompanies();
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "message" in e
          ? String((e as { message: string }).message)
          : "Delete failed";
      setError(msg);
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const filtered = companies.filter(
    (c) =>
      c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.website?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SuperAdminDashboardLayout>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-gray-900"
      >
        <header className="bg-gray-200 text-white py-5 px-2 md:px-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-sm md:text-2xl font-bold flex items-center gap-2 text-black">
            <Building2 className="w-6 h-6" />
            Companies
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-black font-medium">
              {companies.length} Companies
            </span>
            <button
              type="button"
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#8b0e0f] text-white hover:opacity-90 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Company
            </button>
          </div>
        </header>

        {error && (
          <div className="mx-2 md:mx-6 mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <section className="my-6 mx-2 md:mx-6">
          <div className="mb-4 relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, license, email, website..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0e0f] text-sm"
            />
          </div>

          <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[#8b0e0f]" />
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      License
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Website
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mobile
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {c.companyName || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {c.licenseNumber || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {c.website ? (
                          <a
                            href={
                              c.website.startsWith("http")
                                ? c.website
                                : `https://${c.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#8b0e0f] hover:underline truncate max-w-[120px] block"
                          >
                            {c.website}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {c.email || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {c.mobile_number || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">
                        {formatAddress(c.address)}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {formatDate(c.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(c._id)}
                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-[#8b0e0f]"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(c._id)}
                            disabled={deleteLoadingId === c._id}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50"
                            title="Delete"
                          >
                            {deleteLoadingId === c._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loading && filtered.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                {companies.length === 0
                  ? "No companies found. Add one to get started."
                  : "No companies match your search."}
              </div>
            )}
          </div>
        </section>

        {/* Add / Edit Modal */}
        {modalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="company-modal-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 id="company-modal-title" className="text-lg font-semibold">
                  {modalOpen === "add" ? "Add Company" : "Edit Company"}
                </h2>
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.companyName}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, companyName: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0e0f]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.licenseNumber}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        licenseNumber: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0e0f]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="text"
                    value={form.website}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, website: e.target.value }))
                    }
                    placeholder="www.example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0e0f]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0e0f]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.mobile_number}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        mobile_number: e.target.value,
                      }))
                    }
                    placeholder="+923000000000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0e0f]"
                  />
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <span className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">
                        Street
                      </label>
                      <input
                        type="text"
                        value={form.address?.street ?? ""}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            address: {
                              ...prev.address,
                              street: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0e0f]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={form.address?.city ?? ""}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            address: {
                              ...prev.address,
                              city: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0e0f]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={form.address?.state ?? ""}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            address: {
                              ...prev.address,
                              state: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0e0f]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        value={form.address?.country ?? ""}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            address: {
                              ...prev.address,
                              country: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0e0f]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Zip Code
                      </label>
                      <input
                        type="text"
                        value={form.address?.zip_code ?? ""}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            address: {
                              ...prev.address,
                              zip_code: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0e0f]"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="flex-1 px-4 py-2 rounded-lg bg-[#8b0e0f] text-white hover:opacity-90 disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {submitLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : modalOpen === "add" ? (
                      "Add Company"
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </motion.main>
    </SuperAdminDashboardLayout>
  );
}
