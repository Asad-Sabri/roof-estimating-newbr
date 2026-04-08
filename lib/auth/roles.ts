/**
 * Canonical SaaS roles — aligned with backend POST /api/login & GET /api/profile.
 * Backend sends `role` as canonical string; DB legacy value may appear as `legacyRole`.
 */

import {
  CUSTOMER_BASE,
  PLATFORM_ADMIN_BASE,
  PLATFORM_SUPER_ADMIN_BASE,
  SUBSCRIBER_ADMIN_BASE,
  SUBSCRIBER_SUPER_ADMIN_BASE,
  setCanonicalRoleCookieClient,
} from "@/lib/routes/portalPaths";

export type CanonicalRole =
  | "PLATFORM_SUPER_ADMIN"
  | "PLATFORM_ADMIN"
  | "SUBSCRIBER_SUPER_ADMIN"
  | "SUBSCRIBER_ADMIN"
  | "SUBSCRIBER_STAFF"
  | "CUSTOMER";

const CANONICAL_SET = new Set<string>([
  "PLATFORM_SUPER_ADMIN",
  "PLATFORM_ADMIN",
  "SUBSCRIBER_SUPER_ADMIN",
  "SUBSCRIBER_ADMIN",
  "SUBSCRIBER_STAFF",
  "CUSTOMER",
]);

export const STORAGE_ROLE = "loginRole";
export const STORAGE_TENANT = "tenantId";
export const STORAGE_ACCESS = "access_type";
export const STORAGE_PROFILE = "userProfile";

export function isPlatformRole(role: string | null | undefined): boolean {
  return role === "PLATFORM_SUPER_ADMIN" || role === "PLATFORM_ADMIN";
}

/** Full platform control: subscribers CRUD, admins CRUD, settings, reports. */
export function isPlatformSuperAdmin(role: string | null | undefined): boolean {
  return role === "PLATFORM_SUPER_ADMIN";
}

/** Limited platform operator — subscribers view/edit (no create/delete), admins read-only, settings read-only. */
export function isPlatformAdminOnly(role: string | null | undefined): boolean {
  return role === "PLATFORM_ADMIN";
}

export function isSubscriberRole(role: string | null | undefined): boolean {
  return (
    role === "SUBSCRIBER_SUPER_ADMIN" ||
    role === "SUBSCRIBER_ADMIN" ||
    role === "SUBSCRIBER_STAFF"
  );
}

/** Full control inside one subscriber (tenant): create subscriber admins, company settings. */
export function isSubscriberSuperAdmin(role: string | null | undefined): boolean {
  return role === "SUBSCRIBER_SUPER_ADMIN";
}

/** Company operators — permissions are scoped by subscriber super admin (backend + future UI flags). */
export function isSubscriberAdminOrStaff(role: string | null | undefined): boolean {
  return role === "SUBSCRIBER_ADMIN" || role === "SUBSCRIBER_STAFF";
}

/**
 * Three-level product hierarchy (frontend routing & copy).
 * 1 = aiROOFS.pro platform, 2 = subscriber company portal, 3 = end customer.
 */
export type HierarchyLevel = 1 | 2 | 3;

export function getHierarchyLevel(
  role: CanonicalRole | null | undefined
): HierarchyLevel | null {
  if (!role) return null;
  if (isPlatformRole(role)) return 1;
  if (isSubscriberRole(role)) return 2;
  if (isCustomerRole(role)) return 3;
  return null;
}

export function isCustomerRole(role: string | null | undefined): boolean {
  return role === "CUSTOMER";
}

/** True if string is already a backend canonical role. */
export function isCanonicalRoleString(s: string | null | undefined): s is CanonicalRole {
  return Boolean(s && CANONICAL_SET.has(s));
}

/** Map legacy DB / JWT role strings to canonical (when `legacyRole` is present). */
export function mapLegacyRoleToCanonical(legacy: string): CanonicalRole {
  const raw = legacy.toString().toLowerCase().replace(/\s+/g, "_");
  if (raw === "super_admin" || raw === "super-admin" || raw === "superadmin")
    return "PLATFORM_SUPER_ADMIN";
  if (raw === "platform_admin" || raw === "platform-admin") return "PLATFORM_ADMIN";
  if (
    raw === "subscriber_super_admin" ||
    raw === "subscriber-super-admin" ||
    raw === "subscribersuperadmin"
  )
    return "SUBSCRIBER_SUPER_ADMIN";
  if (raw === "subscriber_admin" || raw === "subscriber-admin")
    return "SUBSCRIBER_ADMIN";
  if (raw === "manager" || raw === "staff") return "SUBSCRIBER_STAFF";
  if (raw === "admin") return "SUBSCRIBER_ADMIN";
  if (raw === "customer") return "CUSTOMER";
  return "CUSTOMER";
}

/**
 * Resolve canonical role from login/profile payload.
 * Priority: canonicalRole → role (if already canonical) → legacyRole → legacy heuristics on role.
 */
export function normalizeLoginRole(user: any, data?: any): CanonicalRole {
  const u = user ?? {};
  const d = data ?? {};

  const canonical =
    u.canonicalRole ??
    d.canonicalRole ??
    (typeof u.role === "string" && isCanonicalRoleString(u.role) ? u.role : undefined) ??
    (typeof d.role === "string" && isCanonicalRoleString(d.role) ? d.role : undefined);

  if (canonical && isCanonicalRoleString(String(canonical))) {
    return canonical as CanonicalRole;
  }

  const legacy = u.legacyRole ?? d.legacyRole;
  if (legacy != null && String(legacy).length > 0) {
    return mapLegacyRoleToCanonical(String(legacy));
  }

  const raw = (u.role ?? d.role ?? "").toString().toLowerCase().replace(/\s+/g, "_");

  const isSuperAdmin =
    raw === "super_admin" ||
    raw === "super-admin" ||
    raw === "superadmin" ||
    u.is_super_admin === true ||
    u.isSuperAdmin === true ||
    d.is_super_admin === true ||
    d.isSuperAdmin === true;

  if (isSuperAdmin) return "PLATFORM_SUPER_ADMIN";

  if (raw === "platform_admin" || raw === "platform-admin") return "PLATFORM_ADMIN";

  if (
    raw === "subscriber_super_admin" ||
    raw === "subscriber-super-admin" ||
    raw === "subscribersuperadmin"
  )
    return "SUBSCRIBER_SUPER_ADMIN";

  if (raw === "subscriber_admin" || raw === "subscriber-admin")
    return "SUBSCRIBER_ADMIN";

  if (raw === "manager" || raw === "staff") return "SUBSCRIBER_STAFF";

  if (raw === "admin") return "SUBSCRIBER_ADMIN";

  return "CUSTOMER";
}

export function getStoredCanonicalRole(): CanonicalRole | null {
  if (typeof window === "undefined") return null;
  const r = localStorage.getItem(STORAGE_ROLE);
  if (r) {
    if (r === "super-admin") return "PLATFORM_SUPER_ADMIN";
    if (r === "platform-admin") return "PLATFORM_ADMIN";
    if (isCanonicalRoleString(r)) return r;
    if (r === "admin") return "SUBSCRIBER_ADMIN";
    if (r === "customer") return "CUSTOMER";
    return normalizeLoginRole({ role: r });
  }
  try {
    const raw = localStorage.getItem(STORAGE_PROFILE);
    if (raw) {
      const p = JSON.parse(raw) as Record<string, unknown>;
      const cr = p.canonicalRole ?? p.role;
      if (typeof cr === "string" && isCanonicalRoleString(cr)) return cr;
      return normalizeLoginRole(p);
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function getPostLoginPath(
  role: CanonicalRole,
  accessType: string
): string {
  const portal = accessType?.toLowerCase() === "portal_only";
  if (portal || role === "CUSTOMER") return `${CUSTOMER_BASE}/dashboard`;
  if (role === "PLATFORM_ADMIN") return `${PLATFORM_ADMIN_BASE}/dashboard`;
  if (role === "PLATFORM_SUPER_ADMIN") return `${PLATFORM_SUPER_ADMIN_BASE}/dashboard`;
  if (role === "SUBSCRIBER_SUPER_ADMIN") return `${SUBSCRIBER_SUPER_ADMIN_BASE}/dashboard`;
  if (isSubscriberRole(role)) return `${SUBSCRIBER_ADMIN_BASE}/dashboard`;
  return `${CUSTOMER_BASE}/dashboard`;
}

/**
 * tenantId: Mongo ObjectId string or null — platform users often null.
 * Login may send tenantId on root `data` or inside `user`.
 */
export function getTenantIdFromUser(user: any, data?: any): string | null {
  const top = data?.tenantId ?? data?.tenant_id;
  if (top != null && String(top).length > 0) return String(top);
  if (!user || typeof user !== "object") return null;
  const id =
    user.tenantId ??
    user.tenant_id ??
    user.company_id ??
    user.companyId ??
    user.subscriber_id ??
    user.subscriberId ??
    null;
  return id != null && String(id).length > 0 ? String(id) : null;
}

/**
 * Platform permissions may live on `user`, on the profile payload root, or as `platformPermissions`.
 * If nothing is present, leave user unchanged (undefined = legacy full access in nav helpers).
 */
export function extractPlatformPermissionsFromPayload(
  user: Record<string, unknown> | null | undefined,
  profilePayload: any
): string[] | undefined {
  const u = (user ?? {}) as Record<string, unknown>;
  const p = profilePayload ?? {};
  const nestedUser = p?.user && typeof p.user === "object" ? (p.user as Record<string, unknown>) : null;
  const tryArrays = [
    u.permissions,
    u.platformPermissions,
    u.platform_permissions,
    nestedUser?.permissions,
    nestedUser?.platformPermissions,
    nestedUser?.platform_permissions,
    p.permissions,
    p.platformPermissions,
    p.platform_permissions,
  ];
  for (const c of tryArrays) {
    if (Array.isArray(c)) return c.map(String);
  }
  return undefined;
}

/**
 * Tenant-scoped permission codes from login/profile (`user.subscriberPermissions`).
 */
export function extractSubscriberPermissionsFromPayload(
  user: Record<string, unknown> | null | undefined,
  profilePayload: any
): string[] | undefined {
  const u = (user ?? {}) as Record<string, unknown>;
  const p = profilePayload ?? {};
  const nestedUser =
    p?.user && typeof p.user === "object" ? (p.user as Record<string, unknown>) : null;
  const tryArrays = [
    u.subscriberPermissions,
    u.subscriber_permissions,
    nestedUser?.subscriberPermissions,
    nestedUser?.subscriber_permissions,
    p.subscriberPermissions,
    p.subscriber_permissions,
  ];
  for (const c of tryArrays) {
    if (Array.isArray(c)) return c.map(String);
  }
  return undefined;
}

/** Merge profile GET into stored user (canonicalRole, tenantId). */
export function applyProfileToStorage(profilePayload: any): void {
  if (typeof window === "undefined") return;
  const user = profilePayload?.user ?? profilePayload;
  if (!user || typeof user !== "object") return;
  try {
    const perms = extractPlatformPermissionsFromPayload(user as Record<string, unknown>, profilePayload);
    const subPerms = extractSubscriberPermissionsFromPayload(
      user as Record<string, unknown>,
      profilePayload
    );
    const merged: Record<string, unknown> = { ...(user as Record<string, unknown>) };
    if (perms !== undefined) {
      merged.permissions = perms;
    }
    if (subPerms !== undefined) {
      merged.subscriberPermissions = subPerms;
    }
    localStorage.setItem(STORAGE_PROFILE, JSON.stringify(merged));
    const role = normalizeLoginRole(user, profilePayload);
    localStorage.setItem(STORAGE_ROLE, role);
    setCanonicalRoleCookieClient(role);
    const tid = getTenantIdFromUser(user, profilePayload);
    if (tid) localStorage.setItem(STORAGE_TENANT, tid);
    else localStorage.removeItem(STORAGE_TENANT);
  } catch {
    /* ignore */
  }
}
