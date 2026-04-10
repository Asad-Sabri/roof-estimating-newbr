"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
import { toast } from "react-toastify";
import SubscriberLayout from "@/components/layout/SubscriberLayout";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";
import { useSubscriberAccess } from "@/lib/auth/useSubscriberAccess";
import { STORAGE_PROFILE } from "@/lib/auth/roles";
import { normalizeSubscriberPermissionCode } from "@/lib/auth/subscriberPermissions";
import {
  getSubscriberTeamAPI,
  createSubscriberTeamMemberAPI,
  updateSubscriberTeamMemberAPI,
  deleteSubscriberTeamMemberAPI,
  getSubscriberPermissionsCatalogAPI,
  getSubscriberAdminPermissionsAPI,
  putSubscriberAdminPermissionsAPI,
} from "@/services/subscriberAPI";

type TeamMember = {
  _id?: string;
  id?: number;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  mobile_number?: string;
  is_active?: boolean;
};

type PermCatalogEntry = { code: string; label: string };

function normalizeTeamList(res: unknown): TeamMember[] {
  let list: unknown[] = [];
  const r = res as Record<string, unknown> | unknown[] | null;
  if (Array.isArray(r)) list = r;
  else if (r && typeof r === "object") {
    const o = r as Record<string, unknown>;
    if (Array.isArray(o.data)) list = o.data as unknown[];
    else if (Array.isArray(o.team)) list = o.team as unknown[];
    else if (Array.isArray(o.users)) list = o.users as unknown[];
    else if (Array.isArray(o.members)) list = o.members as unknown[];
  }
  return list.map((item: unknown) => {
    const a = item as Record<string, unknown>;
    return {
      _id: (a._id ?? a.id) as string | undefined,
      id: typeof a.id === "number" ? a.id : undefined,
      name:
        (a.name as string) ??
        ([a.first_name, a.last_name].filter(Boolean).join(" ") || (a.email as string)) ??
        "—",
      email: (a.email as string) ?? "—",
      role: (a.role as string) ?? (a.user_type as string) ?? "admin",
      status: (a.status as string) ?? (a.is_active === false ? "Inactive" : "Active"),
      createdAt: (a.createdAt ?? a.created_at ?? "—") as string,
      first_name: a.first_name as string | undefined,
      last_name: a.last_name as string | undefined,
      middle_name: (a.middle_name ?? a.middleName) as string | undefined,
      mobile_number: (a.mobile_number ?? a.phone ?? a.mobile) as string | undefined,
      is_active: a.is_active as boolean | undefined,
    };
  });
}

function formatDate(s: string) {
  if (!s || s === "—") return s;
  try {
    return new Date(s).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return s;
  }
}

function normalizeRoleKey(role: string | undefined): string {
  return (role || "").toLowerCase().replace(/\s+/g, "_");
}

/** Tenant-level super admin — full access; permissions matrix hidden or read-only. */
function isTenantSuperAdminRole(role: string | undefined): boolean {
  const r = normalizeRoleKey(role);
  return (
    r === "subscriber_super_admin" ||
    r === "subscriber-super-admin" ||
    r === "subscribersuperadmin"
  );
}

function formatRoleLabel(role: string | undefined): string {
  if (!role) return "Member";
  const r = normalizeRoleKey(role);
  if (isTenantSuperAdminRole(role)) return "Subscriber Super Admin";
  if (r === "admin" || r === "subscriber_admin") return "Subscriber Admin";
  if (r === "manager") return "Manager";
  if (r === "staff" || r === "subscriber_staff") return "Staff";
  return role;
}

function normalizePermissionCatalog(res: unknown): PermCatalogEntry[] {
  const r = res as Record<string, unknown>;
  const raw =
    (Array.isArray(r?.permissions) && r.permissions) ||
    (Array.isArray((r?.data as Record<string, unknown>)?.permissions) &&
      (r?.data as Record<string, unknown>).permissions) ||
    (Array.isArray(r?.data) && r.data) ||
    [];
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item: unknown) => {
      if (typeof item === "string") return { code: item, label: item };
      const o = item as Record<string, unknown>;
      const code = String(o.code ?? o.id ?? o.key ?? "");
      const label = String(o.label ?? o.name ?? o.title ?? code);
      return { code, label };
    })
    .filter((x) => x.code.length > 0);
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
  return raw.map((x) => String(x)).filter(Boolean);
}

/** Used when GET /api/subscriber/permissions is missing — backend `constants/subscriberPermissions.js`. */
const FALLBACK_SUBSCRIBER_PERM_CATALOG: PermCatalogEntry[] = [
  { code: "tenant.customers", label: "Customers" },
  { code: "tenant.projects", label: "Projects" },
  { code: "tenant.reports", label: "Reports" },
  { code: "tenant.estimates", label: "Estimates" },
  { code: "tenant.proposals", label: "Proposals" },
  { code: "tenant.payments", label: "Payments" },
];

/** Permission matrix applies to manager/staff only (not Subscriber Super Admin or team Subscriber Admin). */
function isTenantTeamManagerOrStaff(role: string | undefined): boolean {
  const r = normalizeRoleKey(role);
  return r === "manager" || r === "staff" || r === "subscriber_staff";
}

function memberRowId(m: TeamMember): string | null {
  const id = m._id;
  if (id === undefined || id === null || id === "") return null;
  return String(id);
}

function getCurrentProfileId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_PROFILE);
    if (!raw) return null;
    const p = JSON.parse(raw) as Record<string, unknown>;
    const id = p._id ?? p.id;
    return id != null && String(id).length > 0 ? String(id) : null;
  } catch {
    return null;
  }
}

function normalizeMobile(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return "";
  return value.trim().startsWith("+") ? value.trim() : `+${digits}`;
}

function isValidMobile(value: string): boolean {
  const n = normalizeMobile(value);
  return /^\+?\d{10,15}$/.test(n) && n.replace(/\D/g, "").length >= 10;
}

type FormRole = "subscriber_admin" | "admin" | "manager" | "staff";

/** POST /api/subscriber/team — backend allows only these on create. */
type CreateTeamRole = "manager" | "staff";

const CREATE_TEAM_ROLE_OPTIONS: { value: CreateTeamRole; label: string }[] = [
  { value: "manager", label: "Manager" },
  { value: "staff", label: "Staff" },
];

function mapMemberRoleToForm(role: string | undefined): FormRole {
  const r = normalizeRoleKey(role);
  if (r === "subscriber_admin" || r === "subscriber-admin") return "subscriber_admin";
  if (r === "manager") return "manager";
  if (r === "staff" || r === "subscriber_staff") return "staff";
  return "admin";
}

function formatApiError(err: unknown): string {
  const e = err as {
    response?: { data?: { message?: string; errors?: Array<{ msg?: string }> } };
  };
  const data = e?.response?.data;
  if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    const parts = data.errors.map((x) => x.msg).filter(Boolean);
    if (parts.length > 0) return parts.join(" ");
  }
  return data?.message ?? (err as Error)?.message ?? "Request failed.";
}

const emptyForm = {
  first_name: "",
  last_name: "",
  middle_name: "",
  email: "",
  mobile_number: "",
  password: "",
  is_active: true,
  role: "manager" as FormRole,
};

const TEAM_ROLE_OPTIONS: { value: FormRole; label: string }[] = [
  // { value: "subscriber_admin", label: "Subscriber Admin" },
  // { value: "admin", label: "Subscriber Admin (legacy)" },
  { value: "manager", label: "Manager" },
  // { value: "staff", label: "Staff" },
];

export default function SubscriberAdminsPage() {
  useProtectedRoute();
  const router = useRouter();
  const { isSubscriberSuperAdmin, role: subscriberRole } = useSubscriberAccess();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editMemberId, setEditMemberId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [expandedPermMemberId, setExpandedPermMemberId] = useState<string | null>(null);
  const [permCatalog, setPermCatalog] = useState<PermCatalogEntry[]>([]);
  const [permDraftByMember, setPermDraftByMember] = useState<Record<string, string[]>>({});
  const [permLoadingId, setPermLoadingId] = useState<string | null>(null);
  const [permSavingId, setPermSavingId] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSubscriberTeamAPI();
      setMembers(normalizeTeamList(res));
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to load team.";
      setError(String(msg));
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (subscriberRole === null) return;
    if (!isSubscriberSuperAdmin) {
      router.replace("/unauthorized");
      return;
    }
    loadMembers();
  }, [isSubscriberSuperAdmin, subscriberRole, router, loadMembers]);

  const loadPermissionCatalog = useCallback(async () => {
    try {
      const res = await getSubscriberPermissionsCatalogAPI();
      const list = normalizePermissionCatalog(res);
      setPermCatalog((prev) => (list.length > 0 ? list : prev.length > 0 ? prev : FALLBACK_SUBSCRIBER_PERM_CATALOG));
    } catch {
      setPermCatalog((prev) => (prev.length > 0 ? prev : FALLBACK_SUBSCRIBER_PERM_CATALOG));
    }
  }, []);

  const toggleExpandPermissions = async (member: TeamMember) => {
    const rowId = memberRowId(member);
    if (!rowId) return;
    if (expandedPermMemberId === rowId) {
      setExpandedPermMemberId(null);
      return;
    }
    setExpandedPermMemberId(rowId);

    if (isTenantSuperAdminRole(member.role)) {
      return;
    }

    if (!isTenantTeamManagerOrStaff(member.role)) {
      return;
    }

    await loadPermissionCatalog();
    setPermLoadingId(rowId);
    try {
      const res = await getSubscriberAdminPermissionsAPI(rowId);
      const list = normalizePermissionsResponse(res);
      setPermDraftByMember((prev) => ({ ...prev, [rowId]: list }));
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Could not load access settings");
      setPermDraftByMember((prev) => ({ ...prev, [rowId]: prev[rowId] ?? [] }));
    } finally {
      setPermLoadingId(null);
    }
  };

  const togglePermissionCode = (memberId: string, code: string, enabled: boolean) => {
    const key = String(memberId);
    setPermDraftByMember((prev) => {
      const cur = new Set(prev[key] ?? []);
      if (enabled) cur.add(code);
      else cur.delete(code);
      return { ...prev, [key]: Array.from(cur) };
    });
  };

  const savePermissions = async (memberId: string) => {
    const key = String(memberId);
    const list = permDraftByMember[key] ?? [];
    setPermSavingId(key);
    try {
      await putSubscriberAdminPermissionsAPI(key, { permissions: list });
      toast.success("Access updated");
      setExpandedPermMemberId(null);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to save access");
    } finally {
      setPermSavingId(null);
    }
  };

  const openCreate = () => {
    setForm(emptyForm);
    setFormError(null);
    setEditMemberId(null);
    setModal("create");
  };

  const openEdit = (m: TeamMember) => {
    if (!m._id) return;
    setForm({
      first_name: m.first_name ?? m.name.split(" ")[0] ?? "",
      last_name: m.last_name ?? m.name.split(" ").slice(1).join(" ") ?? "",
      middle_name: m.middle_name ?? "",
      email: m.email,
      mobile_number: m.mobile_number ?? "",
      password: "",
      is_active: m.is_active !== false,
      role: mapMemberRoleToForm(m.role),
    });
    setFormError(null);
    setEditMemberId(m._id);
    setModal("edit");
  };

  const closeModal = () => {
    setModal(null);
    setFormError(null);
    setEditMemberId(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name?.trim() || !form.last_name?.trim() || !form.email?.trim() || !form.password?.trim()) {
      setFormError("First name, last name, email, and password are required.");
      return;
    }
    if (form.password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }
    const mobile = normalizeMobile(form.mobile_number);
    if (!isValidMobile(form.mobile_number)) {
      setFormError("Enter a valid mobile with country code (e.g. +923001234567).");
      return;
    }
    const createRole: CreateTeamRole =
      form.role === "manager" || form.role === "staff" ? form.role : "manager";

    setFormLoading(true);
    setFormError(null);
    try {
      /** POST /api/subscriber/team — tenant from token; role manager | staff */
      const payload: Record<string, string> = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim().toLowerCase(),
        mobile_number: mobile,
        password: form.password,
        role: createRole,
      };
      if (form.middle_name?.trim()) payload.middle_name = form.middle_name.trim();

      await createSubscriberTeamMemberAPI(payload);
      toast.success("Team member created. They can log in on the subscriber portal with this email and password.");
      closeModal();
      loadMembers();
    } catch (err: unknown) {
      setFormError(formatApiError(err));
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMemberId) return;
    if (!form.first_name?.trim() || !form.last_name?.trim() || !form.email?.trim()) {
      setFormError("First name, last name, and email are required.");
      return;
    }
    const mobile = normalizeMobile(form.mobile_number);
    if (form.mobile_number && !isValidMobile(form.mobile_number)) {
      setFormError("Enter a valid mobile with country code.");
      return;
    }
    setFormLoading(true);
    setFormError(null);
    try {
      const body: Record<string, unknown> = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim().toLowerCase(),
        mobile_number: mobile || undefined,
        role: form.role,
        is_active: form.is_active,
      };
      if (form.middle_name?.trim()) body.middle_name = form.middle_name.trim();
      if (form.password?.trim()) {
        body.password = form.password.trim();
      }
      await updateSubscriberTeamMemberAPI(editMemberId, body);
      toast.success("Team member updated.");
      closeModal();
      loadMembers();
    } catch (err: unknown) {
      setFormError(formatApiError(err));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteLoading(true);
    try {
      await deleteSubscriberTeamMemberAPI(id);
      toast.success("Team member removed.");
      setDeleteConfirm(null);
      setExpandedPermMemberId((cur) => (cur === String(id) ? null : cur));
      loadMembers();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err as Error)?.message ??
        "Delete failed.";
      toast.error(String(msg));
    } finally {
      setDeleteLoading(false);
    }
  };

  const currentUserId = typeof window !== "undefined" ? getCurrentProfileId() : null;

  /** Hide Subscriber Super Admin rows — this page is for manager / staff / subscriber admin team only. */
  const membersWithoutSuperAdmin = useMemo(
    () => members.filter((m) => !isTenantSuperAdminRole(m.role)),
    [members]
  );

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return membersWithoutSuperAdmin.filter((m) => {
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        formatRoleLabel(m.role).toLowerCase().includes(q)
      );
    });
  }, [membersWithoutSuperAdmin, searchTerm]);

  const catalog =
    permCatalog.length > 0 ? permCatalog : FALLBACK_SUBSCRIBER_PERM_CATALOG;

  if (subscriberRole === null) {
    return (
      <SubscriberLayout>
        <div className="flex justify-center items-center py-24 text-gray-600 gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-[#8b0e0f]" />
          Loading…
        </div>
      </SubscriberLayout>
    );
  }

  if (!isSubscriberSuperAdmin) {
    return null;
  }

  return (
    <SubscriberLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto text-gray-900 px-1"
      >
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="h-8 w-8 text-[#8b0e0f]" />
              Subscriber admins
            </h1>
            {/* <p className="text-sm text-gray-600 mt-1 max-w-2xl">
              Creates users via <code className="text-xs bg-gray-100 px-1 rounded">POST /api/subscriber/team</code> as{" "}
              <strong>manager</strong> or <strong>staff</strong> (tenant-scoped; they can log in immediately). Expand a
              row to set <strong>tenant.*</strong> module permissions.
            </p> */}
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#8b0e0f] text-white text-sm font-medium hover:opacity-95 shadow"
          >
            <Plus className="h-5 w-5" />
            Add member
          </button>
        </header>

        {error && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {error}
          </div>
        )}

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search by name, email, or role…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0e0f]"
          />
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[#8b0e0f]" />
              </div>
            ) : (
              <table className="w-full min-w-[720px]">
                <thead className="text-white" style={{ backgroundColor: "#8b0e0f" }}>
                  <tr>
                    <th className="px-3 py-3 w-12 text-left text-xs font-medium uppercase tracking-wider">Access</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Member</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Created</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map((m) => {
                    const rowId = memberRowId(m);
                    const isExpanded = rowId != null && expandedPermMemberId === rowId;
                    return (
                    <Fragment key={rowId ?? `email-${m.email}`}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-3 py-4 align-middle">
                          {rowId ? (
                            <button
                              type="button"
                              onClick={() => toggleExpandPermissions(m)}
                              className="p-1 rounded-md text-[#8b0e0f] hover:bg-red-50"
                              title="Access & permissions"
                              aria-expanded={isExpanded}
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-5 h-5" />
                              ) : (
                                <ChevronRight className="w-5 h-5" />
                              )}
                            </button>
                          ) : (
                            <span className="inline-block w-7" aria-hidden />
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-medium text-gray-900">{m.name}</p>
                          <p className="text-sm text-gray-500">{m.email}</p>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                              isTenantSuperAdminRole(m.role)
                                ? "bg-red-50 text-[#8b0e0f]"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {formatRoleLabel(m.role)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              (m.status || "").toLowerCase() === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(m.createdAt)}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {m._id && !isTenantSuperAdminRole(m.role) && (
                              <button
                                type="button"
                                onClick={() => openEdit(m)}
                                className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                                title="Edit"
                              >
                                <Edit size={18} />
                              </button>
                            )}
                            {m._id &&
                              !isTenantSuperAdminRole(m.role) &&
                              String(m._id) !== String(currentUserId ?? "") && (
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirm(m._id!)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                  title="Remove"
                                >
                                  <Trash2 size={18} />
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && rowId && (
                        <tr>
                          <td colSpan={6} className="px-0 py-0 border-t border-red-100 bg-red-50/60">
                            <div className="px-6 py-4 space-y-3">
                              {isTenantSuperAdminRole(m.role) ? (
                                <p className="text-sm text-gray-700">
                                  <strong>Subscriber Super Admin</strong> has full access to this subscriber workspace.
                                  Module toggles do not apply.
                                </p>
                              ) : !isTenantTeamManagerOrStaff(m.role) ? (
                                <p className="text-sm text-gray-700">
                                  <strong>Subscriber Admin</strong> accounts use full tenant access. Assign{" "}
                                  <strong>manager</strong> or <strong>staff</strong> to use per-module access.
                                </p>
                              ) : permLoadingId === rowId ? (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Loader2 className="w-5 h-5 animate-spin text-[#8b0e0f]" />
                                  Loading access…
                                </div>
                              ) : (
                                <>
                                  <p className="text-sm font-semibold text-red-950">Access for {m.name}</p>
                                  {/* <p className="text-xs text-gray-600 max-w-3xl">
                                    Enable modules this user can use in the subscriber portal. If your API returns an
                                    empty catalog, the defaults below are shown — align codes with{" "}
                                    <code className="text-xs bg-white px-1 rounded">GET /api/subscriber/permissions</code>{" "}
                                    and <code className="text-xs bg-white px-1 rounded">tenant.*</code> codes.
                                  </p> */}
                                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {catalog.map((entry) => {
                                      const id = rowId;
                                      const active = (permDraftByMember[id] ?? []).some(
                                        (c) =>
                                          normalizeSubscriberPermissionCode(c) ===
                                          normalizeSubscriberPermissionCode(entry.code)
                                      );
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
                                  <div className="flex justify-end pt-2">
                                    <button
                                      type="button"
                                      onClick={() => savePermissions(rowId)}
                                      disabled={permSavingId === rowId || permLoadingId === rowId}
                                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50 bg-[#8b0e0f]"
                                    >
                                      {permSavingId === rowId ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Save className="w-4 h-4" />
                                      )}
                                      Save access
                                    </button>
                                  </div>
                                </>
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
                {membersWithoutSuperAdmin.length === 0
                  ? members.length > 0
                    ? "Subscriber Super Admin accounts are not listed here."
                    : "No team members yet."
                  : "No rows match your search."}
              </div>
            )}
          </div>
        </div>

        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">
                  {modal === "create" ? "Add manager or staff" : "Edit team member"}
                </h2>
                <button type="button" onClick={closeModal} className="p-1 rounded hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={modal === "create" ? handleCreate : handleUpdate} className="p-4 space-y-3">
                {formError && (
                  <div className="p-2 rounded bg-red-50 border border-red-200 text-red-700 text-sm">{formError}</div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">First name *</label>
                    <input
                      required
                      value={form.first_name}
                      onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Last name *</label>
                    <input
                      required
                      value={form.last_name}
                      onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Middle name</label>
                  <input
                    value={form.middle_name}
                    onChange={(e) => setForm({ ...form, middle_name: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Mobile *</label>
                  <input
                    value={form.mobile_number}
                    onChange={(e) => setForm({ ...form, mobile_number: e.target.value })}
                    placeholder="+92..."
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                {modal === "create" ? (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Password * (min 6 characters)</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">New password (optional)</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                )}
                {modal === "create" ? (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Role *</label>
                      <select
                        value={form.role === "manager" || form.role === "staff" ? form.role : "manager"}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            role: e.target.value as CreateTeamRole,
                          })
                        }
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                      >
                        {CREATE_TEAM_ROLE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                      {/* <p className="text-[11px] text-gray-500 mt-1">
                        Backend: <code className="bg-gray-100 px-0.5 rounded">POST /api/subscriber/team</code> — only{" "}
                        <strong>manager</strong> or <strong>staff</strong>. Uses your Bearer token + tenant.
                      </p> */}
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value as FormRole })}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                      {TEAM_ROLE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {modal === "edit" && (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    />
                    Active
                  </label>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg border text-sm">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-4 py-2 rounded-lg bg-[#8b0e0f] text-white text-sm font-medium disabled:opacity-60"
                  >
                    {formLoading ? "Saving…" : modal === "create" ? "Create" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
              <p className="text-gray-900 font-medium">Remove this team member?</p>
              <p className="text-sm text-gray-600 mt-2">They will lose access to this subscriber workspace.</p>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-lg border text-sm">
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm disabled:opacity-60"
                >
                  {deleteLoading ? "Removing…" : "Remove"}
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </SubscriberLayout>
  );
}
