"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  X,
  Loader2,
  Search,
  ChevronDown,
  ChevronRight,
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
import { getAdminsAPI } from "@/services/superAdminAPI";
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
  contactPersonName: "",
  contactPersonPhone: "",
  contactPersonEmail: "",
  followUpText: "",
  disclaimer: "",
  whatsIncluded: [],
  financingInterestRate: undefined,
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

function getContact(c: any) {
  return {
    contactPersonName: c?.contactPersonName ?? c?.contact_person_name ?? "",
    contactPersonPhone: c?.contactPersonPhone ?? c?.contact_person_phone ?? "",
    contactPersonEmail: c?.contactPersonEmail ?? c?.contact_person_email ?? "",
  };
}
function getCreatedAt(c: any) {
  return c?.createdAt ?? c?.created_at ?? "";
}
function getUpdatedAt(c: any) {
  return c?.updatedAt ?? c?.updated_at ?? "";
}

type AdminOption = { _id: string; name: string };
function normalizeAdminsForOptions(res: any): AdminOption[] {
  let list: any[] = [];
  if (Array.isArray(res)) list = res;
  else if (res?.data && Array.isArray(res.data)) list = res.data;
  else if (res?.admins && Array.isArray(res.admins)) list = res.admins;
  else if (res && typeof res === "object") list = [res];
  return list.map((a: any) => ({
    _id: a._id ?? a.id,
    name: a.name ?? (([a.first_name, a.last_name].filter(Boolean).join(" ") || a.email) ?? "—"),
  }));
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [admins, setAdmins] = useState<AdminOption[]>([]);
  const [selectedAdminId, setSelectedAdminId] = useState<string>("");
  const [adminsLoading, setAdminsLoading] = useState(false);

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

  const fetchAdmins = useCallback(async () => {
    setAdminsLoading(true);
    try {
      const res = await getAdminsAPI();
      setAdmins(normalizeAdminsForOptions(res));
    } catch {
      setAdmins([]);
    } finally {
      setAdminsLoading(false);
    }
  }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setSelectedAdminId("");
    setModalOpen("add");
    fetchAdmins();
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
          contactPersonName: getContact(c).contactPersonName,
          contactPersonPhone: getContact(c).contactPersonPhone,
          contactPersonEmail: getContact(c).contactPersonEmail,
          followUpText: (c as any).followUpText ?? "",
          disclaimer: (c as any).disclaimer ?? "",
          whatsIncluded: Array.isArray((c as any).whatsIncluded) ? (c as any).whatsIncluded : [],
          financingInterestRate: (c as any).financingInterestRate != null ? Number((c as any).financingInterestRate) : undefined,
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
    setSelectedAdminId("");
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
        contactPersonName: form.contactPersonName?.trim() ?? "",
        contactPersonPhone: form.contactPersonPhone?.trim() ?? "",
        contactPersonEmail: form.contactPersonEmail?.trim() ?? "",
        followUpText: form.followUpText?.trim() || undefined,
        disclaimer: form.disclaimer?.trim() || undefined,
        whatsIncluded: Array.isArray(form.whatsIncluded) && form.whatsIncluded.length > 0 ? form.whatsIncluded.filter(Boolean) : undefined,
        financingInterestRate: form.financingInterestRate != null && form.financingInterestRate !== "" ? Number(form.financingInterestRate) : undefined,
      };
      if (modalOpen === "add") {
        const adminId = selectedAdminId?.trim();
        if (!adminId) {
          setError("Please select an Admin for this subscriber.");
          setSubmitLoading(false);
          return;
        }
        payload.admin_id = adminId;
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
    if (!confirm("Are you sure you want to delete this subscriber?")) return;
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
            Subscribers
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-black font-medium">
              {companies.length} Subscribers
            </span>
            <button
              type="button"
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#8b0e0f] text-white hover:opacity-90 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Subscriber
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
                      Subscriber
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
                      Admin
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map((c) => {
                    const isExpanded = expandedId === c._id;
                    const addr = c.address && typeof c.address === "object" ? c.address : {};
                    return (
                      <Fragment key={c._id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => setExpandedId((id) => (id === c._id ? null : c._id))}
                              className="flex items-center gap-2 text-left font-medium text-gray-900 hover:text-[#8b0e0f]"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 shrink-0" />
                              ) : (
                                <ChevronRight className="w-4 h-4 shrink-0" />
                              )}
                              {c.companyName || "—"}
                            </button>
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
                            {getCreatedAt(c) ? formatDate(getCreatedAt(c)) : "—"}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {(c as any).adminName ?? "—"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); openEdit(c._id); }}
                                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-[#8b0e0f]"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleDelete(c._id); }}
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
                        {isExpanded && (
                          <tr className="bg-gray-50">
                            <td colSpan={10} className="px-4 py-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500 block mb-1">Subscriber Name</span>
                                  <span className="text-gray-900">{c.companyName || "—"}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500 block mb-1">License Number</span>
                                  <span className="text-gray-900">{c.licenseNumber || "—"}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500 block mb-1">Website</span>
                                  {c.website ? (
                                    <a href={c.website.startsWith("http") ? c.website : `https://${c.website}`} target="_blank" rel="noopener noreferrer" className="text-[#8b0e0f] hover:underline">{c.website}</a>
                                  ) : "—"}
                                </div>
                                <div>
                                  <span className="text-gray-500 block mb-1">Email</span>
                                  <span className="text-gray-900">{c.email || "—"}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500 block mb-1">Mobile</span>
                                  <span className="text-gray-900">{c.mobile_number || "—"}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500 block mb-1">Created</span>
                                  <span className="text-gray-900">{getCreatedAt(c) ? formatDate(getCreatedAt(c)) : "—"}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500 block mb-1">Updated</span>
                                  <span className="text-gray-900">{getUpdatedAt(c) ? formatDate(getUpdatedAt(c)) : "—"}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500 block mb-1">Admin</span>
                                  <span className="text-gray-900">{(c as any).adminName ?? "—"}</span>
                                </div>
                                <div className="sm:col-span-2">
                                  <span className="text-gray-500 block mb-1">Address</span>
                                  <span className="text-gray-900">
                                    {[addr.street, addr.city, addr.state, addr.country, addr.zip_code].filter(Boolean).join(", ") || "—"}
                                  </span>
                                </div>
                                {(c as any).disclaimer && (
                                  <div className="sm:col-span-2 lg:col-span-3">
                                    <span className="text-gray-500 block mb-1">Disclaimer</span>
                                    <span className="text-gray-900 whitespace-pre-wrap">{(c as any).disclaimer}</span>
                                  </div>
                                )}
                                {(c as any).followUpText && (
                                  <div className="sm:col-span-2 lg:col-span-3">
                                    <span className="text-gray-500 block mb-1">Follow-up Text</span>
                                    <span className="text-gray-900 whitespace-pre-wrap">{(c as any).followUpText}</span>
                                  </div>
                                )}
                                <>
                                  <div>
                                    <span className="text-gray-500 block mb-1">Contact Person Name</span>
                                    <span className="text-gray-900">{getContact(c).contactPersonName || "—"}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 block mb-1">Contact Person Phone</span>
                                    <span className="text-gray-900">{getContact(c).contactPersonPhone || "—"}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 block mb-1">Contact Person Email</span>
                                    <span className="text-gray-900">{getContact(c).contactPersonEmail || "—"}</span>
                                  </div>
                                </>
                                {(c as any).financingInterestRate != null && (c as any).financingInterestRate !== "" && (
                                  <div>
                                    <span className="text-gray-500 block mb-1">Financing Interest Rate (%)</span>
                                    <span className="text-gray-900">{Number((c as any).financingInterestRate)}</span>
                                  </div>
                                )}
                                {Array.isArray((c as any).whatsIncluded) && (c as any).whatsIncluded.length > 0 && (
                                  <div className="sm:col-span-2 lg:col-span-3">
                                    <span className="text-gray-500 block mb-1">What&apos;s Included</span>
                                    <ul className="list-disc pl-4 text-gray-900">
                                      {((c as any).whatsIncluded as string[]).map((item: string, i: number) => (
                                        <li key={i}>{item}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
            {!loading && filtered.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                {companies.length === 0
                  ? "No subscribers found. Add one to get started."
                  : "No subscribers match your search."}
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
                  {modalOpen === "add" ? "Add Subscriber" : "Edit Subscriber"}
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
                {modalOpen === "add" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admin *
                    </label>
                    <select
                      required
                      value={selectedAdminId}
                      onChange={(e) => setSelectedAdminId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0e0f] bg-white"
                    >
                      <option value="">Select admin</option>
                      {adminsLoading ? (
                        <option disabled>Loading admins...</option>
                      ) : (
                        admins.map((a) => (
                          <option key={a._id} value={a._id}>
                            {a.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subscriber Name *
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person Name</label>
                    <input
                      type="text"
                      value={form.contactPersonName ?? ""}
                      onChange={(e) => setForm((prev) => ({ ...prev, contactPersonName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0e0f]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person Phone</label>
                    <input
                      type="text"
                      value={form.contactPersonPhone ?? ""}
                      onChange={(e) => setForm((prev) => ({ ...prev, contactPersonPhone: e.target.value }))}
                      placeholder="+923000000000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0e0f]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person Email</label>
                    <input
                      type="email"
                      value={form.contactPersonEmail ?? ""}
                      onChange={(e) => setForm((prev) => ({ ...prev, contactPersonEmail: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0e0f]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Financing Interest Rate (%)</label>
                  <input
                    type="number"
                    step="any"
                    value={form.financingInterestRate ?? ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, financingInterestRate: e.target.value === "" ? undefined : Number(e.target.value) }))}
                    placeholder="e.g. 5.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0e0f]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Text</label>
                  <textarea
                    rows={2}
                    value={form.followUpText ?? ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, followUpText: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0e0f]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Disclaimer</label>
                  <textarea
                    rows={2}
                    value={form.disclaimer ?? ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, disclaimer: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0e0f]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">What&apos;s Included (one per line)</label>
                  <textarea
                    rows={3}
                    value={Array.isArray(form.whatsIncluded) ? form.whatsIncluded.join("\n") : ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, whatsIncluded: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) }))}
                    placeholder="One item per line"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0e0f]"
                  />
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
                      "Add Subscriber"
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
