"use client";

import SuperAdminDashboardLayout from "@/app/dashboard/super-admin/page";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";
import { useState, useEffect, useCallback } from "react";
import { Shield, Plus, Search, Edit, Trash2, Loader2, X } from "lucide-react";
import {
  getAdminsAPI,
  getAdminByIdAPI,
  updateAdminAPI,
  deleteAdminAPI,
} from "@/services/superAdminAPI";
import { signupAPI } from "@/services/auth";

type Admin = {
  _id?: string;
  id?: number;
  name: string;
  email: string;
  company?: string;
  role: string;
  status: string;
  createdAt: string;
  first_name?: string;
  last_name?: string;
  mobile_number?: string;
  is_active?: boolean;
};

function normalizeAdminsList(res: any): Admin[] {
  let list: any[] = [];
  if (Array.isArray(res)) list = res;
  else if (res?.data && Array.isArray(res.data)) list = res.data;
  else if (res?.admins && Array.isArray(res.admins)) list = res.admins;
  else if (res && typeof res === "object") list = [res];
  return list.map((a: any) => ({
    _id: a._id ?? a.id,
    id: a.id ?? 0,
    name: a.name ?? [a.first_name, a.last_name].filter(Boolean).join(" ") || a.email ?? "—",
    email: a.email ?? "—",
    company: a.company ?? a.companyName ?? a.company_name ?? "—",
    role: a.role ?? a.user_type ?? "Admin",
    status: a.status ?? (a.is_active === false ? "Inactive" : "Active"),
    createdAt: a.createdAt ?? a.created_at ?? "—",
    first_name: a.first_name,
    last_name: a.last_name,
    mobile_number: a.mobile_number,
    is_active: a.is_active,
  }));
}

function formatDate(s: string) {
  if (!s || s === "—") return s;
  try {
    return new Date(s).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return s;
  }
}

const emptyForm = {
  first_name: "",
  last_name: "",
  middle_name: "",
  email: "",
  mobile_number: "",
  password: "",
  is_active: true,
};

export default function SuperAdminAdminsPage() {
  useProtectedRoute();
  const [searchTerm, setSearchTerm] = useState("");
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editAdminId, setEditAdminId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminsAPI();
      setAdmins(normalizeAdminsList(res));
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to load admins");
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const openCreate = () => {
    setForm(emptyForm);
    setFormError(null);
    setModal("create");
  };

  const openEdit = async (admin: Admin) => {
    const id = admin._id;
    if (!id) return;
    setEditAdminId(id);
    setFormError(null);
    setModal("edit");
    setForm({
      first_name: admin.first_name ?? (admin.name?.split(" ")[0] || "") ?? "",
      last_name: admin.last_name ?? (admin.name?.split(" ").slice(1).join(" ") || "") ?? "",
      middle_name: "",
      email: admin.email ?? "",
      mobile_number: admin.mobile_number ?? "",
      password: "",
      is_active: (admin.status || "").toLowerCase() !== "inactive",
    });
    try {
      const res = await getAdminByIdAPI(id);
      const a = res?.data ?? res?.admin ?? res?.user ?? res;
      if (a && typeof a === "object") {
        setForm({
          first_name: a.first_name ?? (admin.first_name ?? admin.name?.split(" ")[0] ?? "") ?? "",
          last_name: a.last_name ?? (admin.last_name ?? admin.name?.split(" ").slice(1).join(" ") ?? "") ?? "",
          middle_name: a.middle_name ?? "",
          email: a.email ?? admin.email ?? "",
          mobile_number: a.mobile_number ?? admin.mobile_number ?? "",
          password: "",
          is_active: a.is_active !== false,
        });
      }
    } catch {
      // form already set from list
    }
  };

  const closeModal = () => {
    setModal(null);
    setEditAdminId(null);
    setForm(emptyForm);
    setFormError(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      const raw = form.mobile_number?.trim() || "";
      const digits = raw.replace(/\D/g, "");
      const mobile = digits ? (raw.startsWith("+") ? raw : `+${digits}`) : form.mobile_number;
      await signupAPI({
        first_name: form.first_name,
        last_name: form.last_name,
        middle_name: form.middle_name || "",
        email: form.email,
        mobile_number: mobile || form.mobile_number,
        password: form.password,
        role: "admin",
        account_type: "Admin",
      });
      closeModal();
      fetchAdmins();
    } catch (e: any) {
      setFormError(e?.response?.data?.message || e?.message || "Failed to create admin");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAdminId) return;
    setFormLoading(true);
    setFormError(null);
    const payload: any = {
      first_name: form.first_name,
      last_name: form.last_name,
      middle_name: form.middle_name || "",
      email: form.email,
      mobile_number: form.mobile_number,
      is_active: form.is_active,
    };
    if (form.password) payload.password = form.password;
    try {
      await updateAdminAPI(editAdminId, payload);
      closeModal();
      fetchAdmins();
    } catch (e: any) {
      setFormError(e?.response?.data?.message || e?.message || "Failed to update admin");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteLoading(true);
    setError(null);
    try {
      await deleteAdminAPI(id);
      setDeleteConfirm(null);
      fetchAdmins();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to delete admin");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (admin.company || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SuperAdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="text-[#8b0e0f]" size={32} />
              Admins Management
            </h1>
            <p className="text-gray-600 mt-1">Manage all admin accounts and permissions</p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition shadow-md"
            style={{ backgroundColor: "#8b0e0f" }}
          >
            <Plus size={20} />
            Create New Admin
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search admins by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0e0f]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Total Admins</p>
            <p className="text-2xl font-bold text-gray-900">{admins.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {admins.filter((a) => (a.status || "").toLowerCase() === "active").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Master Admins</p>
            <p className="text-2xl font-bold text-[#8b0e0f]">
              {admins.filter((a) => (a.role || "").toLowerCase().includes("master")).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Sub Admins</p>
            <p className="text-2xl font-bold text-purple-600">
              {admins.filter((a) => (a.role || "").toLowerCase().includes("sub")).length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[#8b0e0f]" />
              </div>
            ) : (
              <table className="w-full">
                <thead className="border-b border-gray-200 text-white" style={{ backgroundColor: "#8b0e0f" }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Admin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAdmins.map((admin) => (
                    <tr key={admin._id || admin.id || admin.email} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{admin.name}</p>
                          <p className="text-sm text-gray-500">{admin.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-900">{admin.company}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            (admin.role || "").toLowerCase().includes("master")
                              ? "bg-red-50 text-[#8b0e0f]"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {admin.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            (admin.status || "").toLowerCase() === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {admin.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(admin.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(admin)}
                            className="text-[#8b0e0f] hover:opacity-80"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(admin._id ?? null)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loading && filteredAdmins.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                {admins.length === 0 ? "No admins found." : "No admins match your search."}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                {modal === "create" ? "Create Admin" : "Edit Admin"}
              </h2>
              <button type="button" onClick={closeModal} className="p-1 rounded hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={modal === "create" ? handleCreate : handleUpdate} className="p-4 space-y-4">
              {formError && (
                <div className="p-2 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                  <input
                    type="text"
                    required
                    value={form.first_name}
                    onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b0e0f] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                  <input
                    type="text"
                    required
                    value={form.last_name}
                    onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b0e0f] focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Middle name (optional)</label>
                <input
                  type="text"
                  value={form.middle_name}
                  onChange={(e) => setForm((f) => ({ ...f, middle_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b0e0f] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b0e0f] focus:border-transparent"
                  readOnly={modal === "edit"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile number</label>
                <input
                  type="text"
                  value={form.mobile_number}
                  onChange={(e) => setForm((f) => ({ ...f, mobile_number: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b0e0f] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {modal === "edit" && "(leave blank to keep current)"}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b0e0f] focus:border-transparent"
                  required={modal === "create"}
                  minLength={6}
                />
              </div>
              {modal === "edit" && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={form.is_active}
                    onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="is_active" className="text-sm text-gray-700">Active</label>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#8b0e0f" }}
                >
                  {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {modal === "create" ? "Create" : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-4">
            <p className="text-gray-700 mb-4">Are you sure you want to delete this admin? This action cannot be undone.</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleteLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </SuperAdminDashboardLayout>
  );
}
