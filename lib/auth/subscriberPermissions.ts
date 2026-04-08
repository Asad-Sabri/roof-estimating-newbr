import { STORAGE_PROFILE } from "@/lib/auth/roles";
import type { CanonicalRole } from "@/lib/auth/roles";
import { isSubscriberSuperAdmin } from "@/lib/auth/roles";
import { normalizeSubscriberShellPath } from "@/lib/routes/portalPaths";

/** Backend catalog — `constants/subscriberPermissions.js` (tenant-scoped modules). */
export const SUBSCRIBER_TENANT_PERMISSION_CODES = [
  "tenant.customers",
  "tenant.projects",
  "tenant.reports",
  "tenant.estimates",
  "tenant.proposals",
  "tenant.payments",
] as const;

export type SubscriberTenantPermissionCode = (typeof SUBSCRIBER_TENANT_PERMISSION_CODES)[number];

export function normalizeSubscriberPermissionCode(code: string): string {
  return String(code).trim().toLowerCase();
}

/**
 * From login/profile: `user.subscriberPermissions`.
 * `undefined` / missing = legacy full access (same idea as platform permissions).
 * Explicit `[]` = no module access except always-allowed routes (e.g. dashboard).
 */
export function getStoredSubscriberPermissions(): string[] | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = localStorage.getItem(STORAGE_PROFILE);
    if (!raw) return undefined;
    const p = JSON.parse(raw) as Record<string, unknown>;
    const nested =
      p.user && typeof p.user === "object" ? (p.user as Record<string, unknown>) : null;
    const perms =
      p.subscriberPermissions ??
      p.subscriber_permissions ??
      nested?.subscriberPermissions ??
      nested?.subscriber_permissions;
    if (perms === undefined) return undefined;
    if (perms === null) return undefined;
    if (Array.isArray(perms)) return perms.map((x) => normalizeSubscriberPermissionCode(String(x)));
  } catch {
    /* ignore */
  }
  return undefined;
}

/**
 * Subscriber Super Admin: always full tenant access (no matrix).
 * Subscriber Admin + staff: `subscriberPermissions` — undefined = legacy full; else require codes.
 */
export function hasSubscriberTenantPermission(
  role: CanonicalRole | null,
  ...codes: string[]
): boolean {
  if (!role) return true;
  if (isSubscriberSuperAdmin(role)) return true;
  const perms = getStoredSubscriberPermissions();
  if (perms === undefined) return true;
  if (perms.length === 0) return false;
  const want = codes.map(normalizeSubscriberPermissionCode);
  return want.some((c) => perms.includes(c));
}

/**
 * Codes required for route, or `[]` if allowed without a module code.
 * `null` = unmapped route: allow only when legacy full access (no explicit subscriberPermissions array in profile).
 */
function pathNeedsCodes(normalizedAdminPanelPath: string): string[] | null {
  const p = normalizedAdminPanelPath.split("?")[0] || "";
  if (p.startsWith("/admin-panel/dashboard")) return [];
  if (p.startsWith("/admin-panel/subscriber-profile")) return [];
  if (p.startsWith("/admin-panel/customers")) return ["tenant.customers"];
  if (p.startsWith("/admin-panel/project-details")) return ["tenant.projects"];
  if (p.startsWith("/admin-panel/request-estimate")) return ["tenant.estimates"];
  if (p.startsWith("/admin-panel/preliminary-estimates")) return ["tenant.estimates"];
  if (p.startsWith("/admin-panel/estimates")) return ["tenant.estimates"];
  if (p.startsWith("/admin-panel/measurement-reports")) return ["tenant.reports"];
  if (p.startsWith("/admin-panel/proposals")) return ["tenant.proposals"];
  if (p.startsWith("/admin-panel/payments")) return ["tenant.payments"];
  if (p.startsWith("/admin-panel/job-progress")) return ["tenant.projects"];
  if (p.startsWith("/admin-panel/estimating-pricing")) return ["tenant.estimates"];
  if (
    p.startsWith("/admin-panel/subscriber-admins") ||
    p.startsWith("/admin-panel/assign-role") ||
    p.startsWith("/admin-panel/company-settings")
  ) {
    return [];
  }
  return null;
}

/**
 * Sidebar: whether to show a nav item for tenant users (non-Subscriber Super Admin use permission list).
 * `requiredCodes` empty = always show (when parent shell allows).
 */
export function canShowSubscriberNavItem(
  role: CanonicalRole | null,
  requiredCodes: string[]
): boolean {
  if (!role) return true;
  if (isSubscriberSuperAdmin(role)) return true;
  if (requiredCodes.length === 0) return true;
  return hasSubscriberTenantPermission(role, ...requiredCodes);
}

/** Route guard: Subscriber Admin + staff with explicit `subscriberPermissions`. */
export function subscriberUserMayAccessPath(
  pathname: string | null,
  role: CanonicalRole | null
): boolean {
  if (!pathname || !role) return true;
  if (!isSubscriberRoleRestricted(role)) return true;
  const n = normalizeSubscriberShellPath(pathname);
  if (!n.startsWith("/admin-panel")) return true;
  const need = pathNeedsCodes(n);
  if (need === null) {
    const perms = getStoredSubscriberPermissions();
    if (perms === undefined) return true;
    return false;
  }
  if (need.length === 0) return true;
  return hasSubscriberTenantPermission(role, ...need);
}

/** Subscriber Super Admin: unrestricted. Others follow `subscriberPermissions` when set. */
function isSubscriberRoleRestricted(role: CanonicalRole): boolean {
  return role === "SUBSCRIBER_ADMIN" || role === "SUBSCRIBER_STAFF";
}
