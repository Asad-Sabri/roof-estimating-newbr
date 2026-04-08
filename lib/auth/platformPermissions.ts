import { STORAGE_PROFILE } from "@/lib/auth/roles";
import type { CanonicalRole } from "@/lib/auth/roles";
import { isPlatformSuperAdmin, isPlatformAdminOnly } from "@/lib/auth/roles";
import { normalizePlatformShellPath } from "@/lib/routes/portalPaths";

/** Backend catalog codes (see constants/permissions.js on API). */
export const PLATFORM_PERMISSION_CODES = [
  "companies.read",
  "companies.write",
  "companies.delete",
  "admins.read",
  "admins.write",
  "customers.assign",
  "reports.view",
] as const;

export type PlatformPermissionCode = (typeof PLATFORM_PERMISSION_CODES)[number];

export function normalizePermissionCode(code: string): string {
  return String(code).trim().toLowerCase();
}

/**
 * Raw list from login/profile: `user.permissions` or `user.platformPermissions`.
 * `undefined` / missing = legacy full access. Explicit `[]` = no module access (dashboard only).
 * Values are normalized (trim + lowercase) so API casing matches UI checks.
 */
export function getStoredPlatformPermissions(): string[] | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = localStorage.getItem(STORAGE_PROFILE);
    if (!raw) return undefined;
    const p = JSON.parse(raw) as Record<string, unknown>;
    const nested =
      p.user && typeof p.user === "object"
        ? (p.user as Record<string, unknown>)
        : null;
    const perms =
      p.permissions ??
      p.platformPermissions ??
      p.platform_permissions ??
      nested?.permissions ??
      nested?.platformPermissions ??
      nested?.platform_permissions;
    if (perms === undefined) return undefined;
    if (perms === null) return undefined;
    if (Array.isArray(perms)) return perms.map((x) => normalizePermissionCode(String(x)));
  } catch {
    /* ignore */
  }
  return undefined;
}

export function hasPlatformPermissionCode(
  role: CanonicalRole | null,
  ...codes: string[]
): boolean {
  if (isPlatformSuperAdmin(role)) return true;
  const perms = getStoredPlatformPermissions();
  if (perms === undefined) return true;
  if (perms.length === 0) return false;
  const want = codes.map(normalizePermissionCode);
  return want.some((c) => perms.includes(c));
}

/** Backend catalog label "Create or update subscribers" may use companies.write or subscribers.* */
const SUBSCRIBER_CREATE_UPDATE_CODES = [
  "companies.write",
  "companies.create",
  "companies.update",
  "subscribers.write",
  "subscribers.create",
  "subscribers.update",
  "subscribers.create_update",
  "create_update_subscribers",
] as const;

const SUBSCRIBER_DELETE_CODES = ["companies.delete", "subscribers.delete"] as const;

/** Create or update subscriber (company) rows — any of the known codes. */
export function hasSubscriberCreateUpdatePermission(role: CanonicalRole | null): boolean {
  if (!role) return false;
  if (isPlatformSuperAdmin(role)) return true;
  return hasPlatformPermissionCode(role, ...SUBSCRIBER_CREATE_UPDATE_CODES);
}

/** Delete subscriber — companies.delete or subscribers.delete */
export function hasSubscriberDeletePermission(role: CanonicalRole | null): boolean {
  if (!role) return false;
  if (isPlatformSuperAdmin(role)) return true;
  return hasPlatformPermissionCode(role, ...SUBSCRIBER_DELETE_CODES);
}

function hasCompaniesAccess(perms: string[] | undefined): boolean {
  if (perms === undefined) return true;
  return perms.some((p) => {
    return (
      p.startsWith("companies.") ||
      p.startsWith("subscribers.") ||
      p === "create_update_subscribers"
    );
  });
}

function hasAdminsAccess(perms: string[] | undefined): boolean {
  if (perms === undefined) return true;
  return perms.some((p) => p.startsWith("admins."));
}

/** Whether a platform user may see a sidebar link. Super Admin: no Customers/Projects. Platform Admin: no Projects. */
export function canShowPlatformNavPath(
  role: CanonicalRole | null,
  href: string
): boolean {
  if (!role) return true;
  const h = normalizePlatformShellPath(href);
  if (isPlatformSuperAdmin(role)) {
    if (h.startsWith("/super-admin/customers")) return false;
    if (h.startsWith("/super-admin/project-details")) return false;
    return true;
  }
  if (isPlatformAdminOnly(role) && h.startsWith("/super-admin/project-details")) {
    return false;
  }
  /** System settings UI — Platform Super Admin only (not Platform Admin, even with admins.write). */
  if (isPlatformAdminOnly(role) && h.startsWith("/super-admin/settings")) {
    return false;
  }
  const perms = getStoredPlatformPermissions();
  if (perms === undefined) return true;
  if (perms.length === 0) {
    return h === "/super-admin/dashboard" || h === "/super-admin/dashboard/";
  }
  if (h.startsWith("/super-admin/dashboard")) return true;
  if (h.startsWith("/super-admin/companies")) return hasCompaniesAccess(perms);
  if (h.startsWith("/super-admin/customers"))
    return perms.includes(normalizePermissionCode("customers.assign"));
  if (h.startsWith("/super-admin/reports"))
    return perms.includes(normalizePermissionCode("reports.view"));
  if (h.startsWith("/super-admin/admins")) return hasAdminsAccess(perms);
  return false;
}

/** Route guard: block direct URL access when the user has no permission. */
export function platformUserMayAccessPath(
  pathname: string | null,
  role: CanonicalRole | null
): boolean {
  if (!pathname) return true;
  const p = normalizePlatformShellPath(pathname);
  if (!p.startsWith("/super-admin")) return true;
  if (!role) return true;
  if (
    isPlatformSuperAdmin(role) &&
    (p.startsWith("/super-admin/customers") || p.startsWith("/super-admin/project-details"))
  ) {
    return false;
  }
  if (isPlatformSuperAdmin(role)) return true;
  if (isPlatformAdminOnly(role) && p.startsWith("/super-admin/project-details")) {
    return false;
  }
  return canShowPlatformNavPath(role, pathname);
}
