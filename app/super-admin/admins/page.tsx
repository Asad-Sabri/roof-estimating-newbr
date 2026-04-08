"use client";

import PlatformLayout from "@/components/layout/PlatformLayout";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";
import { Fragment, useState, useEffect, useCallback } from "react";
import {
  Shield,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  X,
  ChevronRight,
  ChevronDown,
  Save,
} from "lucide-react";
import {
  getAdminsAPI,
  getAdminByIdAPI,
  createAdminAPI,
  updateAdminAPI,
  deleteAdminAPI,
  deleteAdminLegacyAPI,
  getPlatformPermissionsCatalogAPI,
  getPlatformAdminPermissionsAPI,
  putPlatformAdminPermissionsAPI,
} from "@/services/superAdminAPI";
import { toast } from "react-toastify";
import { usePlatformAccess } from "@/lib/auth/usePlatformAccess";
import { normalizePermissionCode } from "@/lib/auth/platformPermissions";

/** Temporarily hidden — platform super admin does not manage customer assignment via this UI. */
const HIDDEN_PLATFORM_PERMISSION_CODES = new Set(["customers.assign"]);

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
    name: (a.name ?? ([a.first_name, a.last_name].filter(Boolean).join(" ") || a.email)) ?? "—",
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

/** Display label for backend role (response returns "platform_admin" | "admin") */
function formatRoleLabel(role: string | undefined): string {
  if (!role) return "Admin";
  const r = (role || "").toLowerCase().replace(/\s+/g, "_");
  if (r === "platform_admin" || r === "platform-admin") return "Platform Admin";
  return "Subscriber Admin";
}

function normalizeRoleKey(role: string | undefined): string {
  return (role || "").toLowerCase().replace(/\s+/g, "_");
}

function isPlatformAdminRole(role: string | undefined): boolean {
  return normalizeRoleKey(role) === "platform_admin";
}

/** Subscriber admin = tenant/company admin; not the platform-level role. */
function isSubscriberAdminRole(role: string | undefined): boolean {
  return !isPlatformAdminRole(role);
}

/**
 * Super Admin: may delete any admin row.
 * Platform Admin with admins.write: may delete subscriber admins only (not other platform admins).
 */
function canDeleteAdminRow(
  admin: Admin,
  isPlatformSuperAdminUser: boolean,
  canManagePlatformAdmins: boolean
): boolean {
  if (isPlatformSuperAdminUser) return true;
  if (!canManagePlatformAdmins) return false;
  return isSubscriberAdminRole(admin.role);
}

type PermCatalogEntry = { code: string; label: string };

function normalizePermissionCatalog(res: unknown): PermCatalogEntry[] {
  const r = res as Record<string, unknown>;
  const raw =
    (Array.isArray(r?.permissions) && r.permissions) ||
    (Array.isArray((r?.data as Record<string, unknown>)?.permissions) &&
      (r?.data as Record<string, unknown>).permissions) ||
    (Array.isArray(r?.data) && r.data) ||
    [];
  if (!Array.isArray(raw)) return [];
  return raw.map((item: unknown) => {
    if (typeof item === "string") return { code: item, label: item };
    const o = item as Record<string, unknown>;
    const code = String(o.code ?? o.id ?? o.key ?? "");
    const label = String(o.label ?? o.name ?? o.title ?? code);
    return { code, label };
  })
    .filter((x) => x.code.length > 0)
    .filter((x) => !HIDDEN_PLATFORM_PERMISSION_CODES.has(normalizePermissionCode(x.code)));
}

function normalizePermissionsResponse(res: unknown): string[] {
  const r = res as Record<string, unknown>;
  const raw =
    (Array.isArray(r?.permissions) && r.permissions) ||
    (Array.isArray((r?.data as Record<string, unknown>)?.permissions) &&
      (r?.data as Record<string, unknown>).permissions) ||
    (Array.isArray(r?.data) && r.data) ||
    [];
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x) => String(x))
    .filter(Boolean)
    .filter((c) => !HIDDEN_PLATFORM_PERMISSION_CODES.has(normalizePermissionCode(c)));
}

const emptyForm = {
  first_name: "",
  last_name: "",
  middle_name: "",
  email: "",
  mobile_number: "",
  password: "",
  is_active: true,
  role: "admin" as "admin" | "platform_admin",
  company: "",
  postal_code: "",
};

const ADMIN_ROLE_OPTIONS = [
  { value: "admin", label: "Subscriber Admin (admin, manager, staff)" },
  { value: "platform_admin", label: "Platform Admin" },
];

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
  const { canManagePlatformAdmins, isPlatformSuperAdmin, isPlatformAdminOnly } = usePlatformAccess();
  /** List visible with admins.read; CRUD needs admins.write */
  const isAdminsViewOnly = !isPlatformSuperAdmin && !canManagePlatformAdmins;

  const [expandedPermAdminId, setExpandedPermAdminId] = useState<string | null>(null);
  const [permCatalog, setPermCatalog] = useState<PermCatalogEntry[]>([]);
  const [permDraftByAdmin, setPermDraftByAdmin] = useState<Record<string, string[]>>({});
  const [permLoadingId, setPermLoadingId] = useState<string | null>(null);
  const [permSavingId, setPermSavingId] = useState<string | null>(null);

  const loadPermissionCatalog = useCallback(async () => {
    try {
      const res = await getPlatformPermissionsCatalogAPI();
      const list = normalizePermissionCatalog(res);
      setPermCatalog((prev) => (prev.length > 0 ? prev : list));
    } catch {
      toast.error("Could not load permission list");
    }
  }, []);

  const toggleExpandPermissions = async (admin: Admin) => {
    const id = admin._id;
    if (!id || !isPlatformAdminRole(admin.role)) return;
    if (expandedPermAdminId === id) {
      setExpandedPermAdminId(null);
      return;
    }
    setExpandedPermAdminId(id);
    await loadPermissionCatalog();
    setPermLoadingId(id);
    try {
      const res = await getPlatformAdminPermissionsAPI(id);
      const list = normalizePermissionsResponse(res);
      setPermDraftByAdmin((prev) => ({ ...prev, [id]: list }));
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Could not load permissions");
      setPermDraftByAdmin((prev) => ({ ...prev, [id]: [] }));
    } finally {
      setPermLoadingId(null);
    }
  };

  const togglePermissionCode = (adminId: string, code: string, enabled: boolean) => {
    setPermDraftByAdmin((prev) => {
      const cur = new Set(prev[adminId] ?? []);
      if (enabled) cur.add(code);
      else cur.delete(code);
      return { ...prev, [adminId]: Array.from(cur) };
    });
  };

  const savePermissions = async (adminId: string) => {
    const list = permDraftByAdmin[adminId] ?? [];
    setPermSavingId(adminId);
    try {
      const filtered = list.filter(
        (c) => !HIDDEN_PLATFORM_PERMISSION_CODES.has(normalizePermissionCode(c))
      );
      await putPlatformAdminPermissionsAPI(adminId, { permissions: filtered });
      toast.success("Permissions updated");
      setExpandedPermAdminId(null);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to save permissions");
    } finally {
      setPermSavingId(null);
    }
  };

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
      role: (admin.role === "platform_admin" || (admin.role || "").toLowerCase() === "platform_admin") ? "platform_admin" : "admin",
      company: admin.company ?? "",
      postal_code: "",
    });
    try {
      const res = await getAdminByIdAPI(id);
      const a = res?.data ?? res?.admin ?? res?.user ?? res;
      if (a && typeof a === "object") {
        const roleRaw = (a.role ?? admin.role ?? "").toString().toLowerCase().replace(/\s+/g, "_");
        setForm((prev) => ({
          ...prev,
          first_name: a.first_name ?? (admin.first_name ?? admin.name?.split(" ")[0] ?? "") ?? "",
          last_name: a.last_name ?? (admin.last_name ?? admin.name?.split(" ").slice(1).join(" ") ?? "") ?? "",
          middle_name: a.middle_name ?? "",
          email: a.email ?? admin.email ?? "",
          mobile_number: a.mobile_number ?? admin.mobile_number ?? "",
          password: "",
          is_active: a.is_active !== false,
          role: roleRaw === "platform_admin" ? "platform_admin" : "admin",
        }));
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
      // POST /api/admins – same as Postman; signup API does not allow platform_admin
      const payload: Record<string, string> = {
        role: form.role || "admin",
        first_name: form.first_name,
        last_name: form.last_name,
        middle_name: form.middle_name || "",
        email: form.email,
        password: form.password,
        mobile_number: mobile || form.mobile_number,
      };
      if (form.company?.trim()) payload.company = form.company.trim();
      if (form.postal_code?.trim()) payload.postal_code = form.postal_code.trim();
      const data: any = await createAdminAPI(payload);
      toast.success(data?.message ?? (form.role === "platform_admin" ? "Platform Admin created successfully" : "Admin created successfully"));
      closeModal();
      fetchAdmins();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.response?.data?.errors?.[0]?.msg ?? e?.message ?? "Failed to create admin";
      setFormError(msg);
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
    if (isPlatformSuperAdmin) payload.role = form.role;
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
    const target = admins.find((a) => (a._id ?? "") === id);
    if (target && !canDeleteAdminRow(target, isPlatformSuperAdmin, canManagePlatformAdmins)) {
      toast.error("Only Platform Super Admin can remove a Platform Admin account.");
      setDeleteConfirm(null);
      return;
    }
    setDeleteLoading(true);
    setError(null);
    try {
      const subscriberRow = target && isSubscriberAdminRole(target.role);
      /**
       * Platform Admin + subscriber admin: try DELETE /api/admins/:id first (admins.write);
       * if that fails, fall back to DELETE /api/platform/admins/:id (e.g. legacy 404).
       */
      if (!isPlatformSuperAdmin && subscriberRow) {
        try {
          await deleteAdminLegacyAPI(id);
        } catch {
          try {
            await deleteAdminAPI(id);
          } catch (platformErr: any) {
            throw platformErr;
          }
        }
      } else {
        await deleteAdminAPI(id);
      }
      setDeleteConfirm(null);
      await fetchAdmins();
      toast.success("Admin deleted");
    } catch (e: any) {
      const errMsg = e?.response?.data?.message || e?.message || "Failed to delete admin";
      setError(errMsg);
      toast.error(errMsg);
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
    <PlatformLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="text-[#8b0e0f]" size={32} />
              Admins Management
            </h1>
            <p className="text-gray-600 mt-1">
              {isAdminsViewOnly
                ? "View platform and subscriber admins — create, edit, and delete need admins.write permission."
                : isPlatformSuperAdmin
                  ? "Manage all admin accounts and permissions"
                  : "Create and edit admins; delete subscriber (company) admins. Removing a Platform Admin requires Super Admin."}
            </p>
          </div>
          {canManagePlatformAdmins && (
            <button
              type="button"
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition shadow-md"
              style={{ backgroundColor: "#8b0e0f" }}
            >
              <Plus size={20} />
              Create New Admin
            </button>
          )}
        </div>

        {isAdminsViewOnly && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <strong className="font-semibold">View only.</strong> You can list admins but cannot create,
            edit, or delete accounts without <span className="font-medium">admins.write</span>.
          </div>
        )}

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
            <p className="text-sm text-gray-600">Platform Admins</p>
            <p className="text-2xl font-bold text-[#8b0e0f]">
              {admins.filter((a) => (a.role || "").toLowerCase().replace(/\s+/g, "_") === "platform_admin").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Subscriber Admins</p>
            <p className="text-2xl font-bold text-purple-600">
              {admins.filter((a) => (a.role || "").toLowerCase().replace(/\s+/g, "_") !== "platform_admin").length}
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
                    {isPlatformSuperAdmin && (
                      <th className="px-3 py-3 w-10 text-left text-xs font-medium uppercase tracking-wider">
                        Perms
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Admin</th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Company</th> */}
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAdmins.map((admin) => (
                    <Fragment key={admin._id || admin.id || admin.email}>
                    <tr className="hover:bg-gray-50 transition">
                      {isPlatformSuperAdmin && (
                        <td className="px-3 py-4 whitespace-nowrap align-middle">
                          {isPlatformAdminRole(admin.role) && admin._id ? (
                            <button
                              type="button"
                              onClick={() => toggleExpandPermissions(admin)}
                              className="p-1 rounded-md text-[#8b0e0f] hover:bg-red-50"
                              title="Platform permissions"
                              aria-expanded={expandedPermAdminId === admin._id}
                            >
                              {expandedPermAdminId === admin._id ? (
                                <ChevronDown className="w-5 h-5" />
                              ) : (
                                <ChevronRight className="w-5 h-5" />
                              )}
                            </button>
                          ) : (
                            <span className="inline-block w-7" />
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{admin.name}</p>
                          <p className="text-sm text-gray-500">{admin.email}</p>
                        </div>
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-900">{admin.company}</p>
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            (admin.role || "").toLowerCase().replace(/\s+/g, "_") === "platform_admin"
                              ? "bg-red-50 text-[#8b0e0f]"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {formatRoleLabel(admin.role)}
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
                          {canManagePlatformAdmins && (
                            <button
                              type="button"
                              onClick={() => openEdit(admin)}
                              className="text-[#8b0e0f] hover:opacity-80"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                          )}
                          {canDeleteAdminRow(admin, isPlatformSuperAdmin, canManagePlatformAdmins) && (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(admin._id ?? null)}
                              className="text-red-600 hover:text-red-900"
                              title={
                                isPlatformAdminRole(admin.role)
                                  ? "Delete platform admin"
                                  : "Delete subscriber admin"
                              }
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isPlatformSuperAdmin &&
                      expandedPermAdminId === admin._id &&
                      isPlatformAdminRole(admin.role) && (
                        <tr>
                          <td
                            colSpan={isPlatformSuperAdmin ? 7 : 6}
                            className="px-0 py-0 border-t border-red-100 bg-red-50/60"
                          >
                            <div className="px-6 py-4 space-y-3">
                              <p className="text-sm font-semibold text-red-950">
                                Platform access for {admin.name}
                              </p>
                              <p className="text-xs text-gray-600 max-w-3xl">
                                Turn permissions on or off for this Platform Admin. Only enabled items appear in their
                                sidebar. Empty selection means no module access (dashboard only). Legacy accounts
                                without saved permissions still receive full access until you save here.
                              </p>
                              {permLoadingId === admin._id ? (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Loader2 className="w-5 h-5 animate-spin text-[#8b0e0f]" />
                                  Loading permissions…
                                </div>
                              ) : (
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {(permCatalog.length > 0
                                    ? permCatalog
                                    : [{ code: "companies.read", label: "companies.read" }]
                                  ).map((entry) => {
                                    const id = admin._id as string;
                                    const active = (permDraftByAdmin[id] ?? []).includes(entry.code);
                                    return (
                                      <label
                                        key={entry.code}
                                        className="flex items-center justify-between gap-3 rounded-lg border border-red-100 bg-white px-3 py-2 shadow-sm"
                                      >
                                        <span className="text-sm text-gray-800">{entry.label}</span>
                                        <button
                                          type="button"
                                          role="switch"
                                          aria-checked={active}
                                          onClick={() => togglePermissionCode(id, entry.code, !active)}
                                          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
                                            active ? "bg-[#8b0e0f]" : "bg-gray-300"
                                          }`}
                                        >
                                          <span
                                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                                              active ? "translate-x-5" : "translate-x-0.5"
                                            } mt-0.5`}
                                          />
                                        </button>
                                      </label>
                                    );
                                  })}
                                </div>
                              )}
                              <div className="flex justify-end pt-2">
                                <button
                                  type="button"
                                  onClick={() => admin._id && savePermissions(admin._id)}
                                  disabled={permSavingId === admin._id || permLoadingId === admin._id}
                                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
                                  style={{ backgroundColor: "#8b0e0f" }}
                                >
                                  {permSavingId === admin._id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Save className="w-4 h-4" />
                                  )}
                                  Save permissions
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
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
                  readOnly={modal === "edit" && isPlatformAdminOnly}
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
              {modal === "edit" && isPlatformSuperAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, role: e.target.value as "admin" | "platform_admin" }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b0e0f] focus:border-transparent"
                  >
                    {ADMIN_ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Platform Admin: create/configure subscribers only. Subscriber Admin: company data only.
                  </p>
                </div>
              )}
              {modal === "edit" && isPlatformAdminOnly && (
                <div className="text-sm text-gray-600">
                  Role: <span className="font-medium text-gray-900">{formatRoleLabel(form.role)}</span>
                  <span className="ml-1 text-gray-400">(set at creation, cannot change here)</span>
                </div>
              )}
              {modal === "create" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={form.role}
                      onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as "admin" | "platform_admin" }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b0e0f] focus:border-transparent"
                    >
                      {ADMIN_ROLE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Platform Admin: create/configure subscribers only. Subscriber Admin: company data only.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company (optional)</label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b0e0f] focus:border-transparent"
                      placeholder="e.g. MyCompany"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal code (optional)</label>
                    <input
                      type="text"
                      value={form.postal_code}
                      onChange={(e) => setForm((f) => ({ ...f, postal_code: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b0e0f] focus:border-transparent"
                      placeholder="e.g. 54000"
                    />
                  </div>
                </>
              )}
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
                <>
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
    </PlatformLayout>
  );
}
