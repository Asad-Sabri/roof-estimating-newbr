"use client";

import SuperAdminDashboardLayout from "@/app/dashboard/super-admin/page";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";
import { useState, useEffect, useCallback } from "react";
import { Users, Plus, Search, Edit, Trash2, MapPin, Loader2, X, UserPlus } from "lucide-react";
import {
  getCustomersAPI,
  getCustomerByIdAPI,
  getAdminsAPI,
  updateCustomerAPI,
  assignCustomerToAdminAPI,
  deleteCustomerAPI,
} from "@/services/superAdminAPI";
import { signupAPI } from "@/services/auth";

type AdminOption = { _id: string; name: string };

type Customer = {
  _id?: string;
  id?: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  assignedTo?: string;
  assignedToId?: string | null;
  status: string;
  createdAt: string;
  first_name?: string;
  last_name?: string;
  mobile_number?: string;
  is_active?: boolean;
};

function normalizeCustomersList(res: any): Customer[] {
  let list: any[] = [];
  if (Array.isArray(res)) list = res;
  else if (res?.data && Array.isArray(res.data)) list = res.data;
  else if (res?.customers && Array.isArray(res.customers)) list = res.customers;
  else if (res && typeof res === "object") list = [res];
  return list.map((c: any) => {
    const addr =
      c.address && typeof c.address === "object"
        ? [c.address.street, c.address.city, c.address.state, c.address.zip_code, c.address.country].filter(Boolean).join(", ")
        : typeof c.address === "string"
          ? c.address
          : "";
    const at = c.assignedTo ?? c.assigned_to;
    const assignedToId = at?._id ?? (typeof at === "string" ? at : null);
    const assignedToName =
      (at && typeof at === "object" && at.name) ||
      (typeof at === "string" ? at : null) ||
      c.admin_name ||
      "—";
    return {
      _id: c._id ?? c.id,
      id: c.id ?? 0,
      name: c.name ?? [c.first_name, c.last_name].filter(Boolean).join(" ") || c.email ?? "—",
      email: c.email ?? "—",
      phone: c.phone ?? c.mobile_number ?? c.mobile ?? "—",
      address: addr || "—",
      assignedTo: assignedToName,
      assignedToId: assignedToId || undefined,
      status: c.status ?? (c.is_active === false ? "Inactive" : "Active"),
      createdAt: c.createdAt ?? c.created_at ?? "—",
      first_name: c.first_name,
      last_name: c.last_name,
      mobile_number: c.mobile_number,
      is_active: c.is_active,
    };
  });
}

function normalizeAdminsForOptions(res: any): AdminOption[] {
  let list: any[] = [];
  if (Array.isArray(res)) list = res;
  else if (res?.data && Array.isArray(res.data)) list = res.data;
  else if (res?.admins && Array.isArray(res.admins)) list = res.admins;
  else if (res && typeof res === "object") list = [res];
  return list.map((a: any) => ({
    _id: a._id ?? a.id,
    name: a.name ?? [a.first_name, a.last_name].filter(Boolean).join(" ") || a.email ?? "—",
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
  assignedToId: "" as string | null,
};

export default function SuperAdminCustomersPage() {
  useProtectedRoute();
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [admins, setAdmins] = useState<AdminOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<"create" | "edit" | "assign" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editCustomerId, setEditCustomerId] = useState<string | null>(null);
  const [assignCustomerId, setAssignCustomerId] = useState<string | null>(null);
  const [assignAdminId, setAssignAdminId] = useState<string>("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCustomersAPI();
      setCustomers(normalizeCustomersList(res));
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to load customers");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAdmins = useCallback(async () => {
    try {
      const res = await getAdminsAPI();
      setAdmins(normalizeAdminsForOptions(res));
    } catch {
      setAdmins([]);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    if (modal === "assign" || modal === "edit") fetchAdmins();
  }, [modal, fetchAdmins]);

  const openCreate = () => {
    setForm({ ...emptyForm });
    setFormError(null);
    setModal("create");
  };

  const openEdit = async (customer: Customer) => {
    const id = customer._id;
    if (!id) return;
    setEditCustomerId(id);
    setFormError(null);
    setModal("edit");
    setForm({
      first_name: customer.first_name ?? customer.name?.split(" ")[0] ?? "",
      last_name: customer.last_name ?? customer.name?.split(" ").slice(1).join(" ") ?? "",
      middle_name: "",
      email: customer.email ?? "",
      mobile_number: customer.phone ?? customer.mobile_number ?? "",
      password: "",
      is_active: (customer.status || "").toLowerCase() !== "inactive",
      assignedToId: customer.assignedToId ?? null,
    });
    try {
      const res = await getCustomerByIdAPI(id);
      const c = res?.data ?? res;
      if (c) {
        setForm({
          first_name: c.first_name ?? "",
          last_name: c.last_name ?? "",
          middle_name: c.middle_name ?? "",
          email: c.email ?? "",
          mobile_number: c.mobile_number ?? "",
          password: "",
          is_active: c.is_active !== false,
          assignedToId: c.assignedTo?._id ?? c.assignedTo ?? null,
        });
      }
    } catch {
      // keep form from list
    }
  };

  const openAssign = (customer: Customer) => {
    const id = customer._id;
    if (!id) return;
    setAssignCustomerId(id);
    setAssignAdminId(customer.assignedToId || "");
    setModal("assign");
  };

  const closeModal = () => {
    setModal(null);
    setEditCustomerId(null);
    setAssignCustomerId(null);
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
        role: "customer",
        account_type: "Customer",
      });
      closeModal();
      fetchCustomers();
    } catch (e: any) {
      setFormError(e?.response?.data?.message || e?.message || "Failed to create customer");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCustomerId) return;
    setFormLoading(true);
    setFormError(null);
    const payload: any = {
      first_name: form.first_name,
      last_name: form.last_name,
      middle_name: form.middle_name || "",
      email: form.email,
      mobile_number: form.mobile_number,
      is_active: form.is_active,
      assignedTo: form.assignedToId || null,
    };
    if (form.password) payload.password = form.password;
    try {
      await updateCustomerAPI(editCustomerId, payload);
      closeModal();
      fetchCustomers();
    } catch (e: any) {
      setFormError(e?.response?.data?.message || e?.message || "Failed to update customer");
    } finally {
      setFormLoading(false);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignCustomerId) return;
    setAssignLoading(true);
    setError(null);
    try {
      if (assignAdminId) {
        await assignCustomerToAdminAPI(assignCustomerId, assignAdminId);
      } else {
        await updateCustomerAPI(assignCustomerId, { assignedTo: null });
      }
      closeModal();
      fetchCustomers();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to update assignment");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteLoading(true);
    setError(null);
    try {
      await deleteCustomerAPI(id);
      setDeleteConfirm(null);
      fetchCustomers();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to delete customer");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone || "").includes(searchTerm) ||
      customer.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SuperAdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="text-green-600" size={32} />
              Customers Management
            </h1>
            <p className="text-gray-600 mt-1">View and manage all customer accounts</p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md"
          >
            <Plus size={20} />
            Create Customer
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
              placeholder="Search customers by name, email, phone, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Total Customers</p>
            <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {customers.filter((c) => (c.status || "").toLowerCase() === "active").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Inactive</p>
            <p className="text-2xl font-bold text-red-600">
              {customers.filter((c) => (c.status || "").toLowerCase() === "inactive").length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer._id || customer.id || customer.email} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                          <p className="text-sm text-gray-500">{customer.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-900">{customer.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <MapPin className="text-gray-400 mt-0.5 shrink-0" size={16} />
                          <p className="text-sm text-gray-900 max-w-xs truncate">{customer.address}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-900">{customer.assignedTo}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            (customer.status || "").toLowerCase() === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(customer.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openAssign(customer)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Assign to Admin"
                          >
                            <UserPlus size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(customer)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(customer._id || undefined)}
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
            {!loading && filteredCustomers.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                {customers.length === 0 ? "No customers found." : "No customers match your search."}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {(modal === "create" || modal === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                {modal === "create" ? "Create Customer" : "Edit Customer"}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                  <input
                    type="text"
                    required
                    value={form.last_name}
                    onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Middle name (optional)</label>
                <input
                  type="text"
                  value={form.middle_name}
                  onChange={(e) => setForm((f) => ({ ...f, middle_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  readOnly={modal === "edit"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile number</label>
                <input
                  type="text"
                  value={form.mobile_number}
                  onChange={(e) => setForm((f) => ({ ...f, mobile_number: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required={modal === "create"}
                  minLength={6}
                />
              </div>
              {modal === "edit" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned to Admin</label>
                    <select
                      value={form.assignedToId ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, assignedToId: e.target.value || null }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">— Unassign —</option>
                      {admins.map((a) => (
                        <option key={a._id} value={a._id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={form.is_active}
                      onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="is_active" className="text-sm text-gray-700">
                      Active
                    </label>
                  </div>
                </>
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
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {modal === "create" ? "Create" : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign to Admin Modal */}
      {modal === "assign" && assignCustomerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Assign to Admin</h2>
              <button type="button" onClick={closeModal} className="p-1 rounded hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin</label>
                <select
                  value={assignAdminId}
                  onChange={(e) => setAssignAdminId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">— Unassign —</option>
                  {admins.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignLoading}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {assignLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save
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
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this customer? This action cannot be undone.
            </p>
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
                onClick={() => handleDelete(deleteConfirm)}
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
