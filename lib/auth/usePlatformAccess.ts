"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  getStoredCanonicalRole,
  isPlatformSuperAdmin,
  isPlatformAdminOnly,
  type CanonicalRole,
} from "@/lib/auth/roles";
import {
  hasPlatformPermissionCode,
  hasSubscriberCreateUpdatePermission,
  hasSubscriberDeletePermission,
} from "@/lib/auth/platformPermissions";

/**
 * Platform shell access — combines role with `user.permissions` / `platformPermissions`.
 * Legacy: missing permissions array = full access (same as backend).
 * Subscriber create/update accepts companies.write and backend aliases (e.g. subscribers.write).
 */
export function usePlatformAccess() {
  const pathname = usePathname();
  const [role, setRole] = useState<CanonicalRole | null>(null);

  useEffect(() => {
    setRole(getStoredCanonicalRole());
  }, [pathname]);

  const superAdmin = isPlatformSuperAdmin(role);
  const platformAdmin = isPlatformAdminOnly(role);

  const can = (...codes: string[]) =>
    Boolean(role && hasPlatformPermissionCode(role, ...codes));

  /** New or edit subscriber (company) — companies.write OR catalog alias for “Create or update subscribers” */
  const canCreateSubscribers = superAdmin || hasSubscriberCreateUpdatePermission(role);
  const canDeleteSubscribers = superAdmin || hasSubscriberDeletePermission(role);
  const canEditSubscribers = superAdmin || hasSubscriberCreateUpdatePermission(role);

  /** @deprecated use canCreateSubscribers / canDeleteSubscribers */
  const canCreateDeleteSubscribers = canCreateSubscribers || canDeleteSubscribers;

  /** Create/edit/delete platform admins + permission toggles — needs admins.write */
  const canManagePlatformAdmins = superAdmin || can("admins.write");

  /** System settings — only Platform Super Admin (sidebar hidden for Platform Admin). */
  const canEditPlatformSettings = superAdmin;

  /** Platform customers page — create/edit/assign/delete */
  const canManagePlatformCustomers = superAdmin || can("customers.assign");

  const hasMutationPermission =
    superAdmin ||
    hasSubscriberCreateUpdatePermission(role) ||
    hasSubscriberDeletePermission(role) ||
    can("admins.write");

  const isReadOnlyPlatformAdmin = platformAdmin && !hasMutationPermission;

  return {
    role,
    isPlatformSuperAdmin: superAdmin,
    isPlatformAdminOnly: platformAdmin,
    canCreateSubscribers,
    canDeleteSubscribers,
    canEditSubscribers,
    canCreateDeleteSubscribers,
    canManagePlatformAdmins,
    canEditPlatformSettings,
    canManagePlatformCustomers,
    isReadOnlyPlatformAdmin,
  };
}
