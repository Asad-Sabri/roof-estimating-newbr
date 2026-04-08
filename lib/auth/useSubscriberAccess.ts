"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  getStoredCanonicalRole,
  isSubscriberSuperAdmin,
  isSubscriberAdminOrStaff,
  type CanonicalRole,
} from "@/lib/auth/roles";

const SUBSCRIBER_PROFILE_SYNC = "subscriber-profile-sync";

/**
 * Client-only subscriber (tenant) role for UI — sidebar, tenant-admin screens.
 * Re-reads on route change and when `subscriber-profile-sync` fires (after GET /api/profile sync).
 */
export function useSubscriberAccess() {
  const pathname = usePathname();
  const [role, setRole] = useState<CanonicalRole | null>(null);

  const refresh = useCallback(() => {
    setRole(getStoredCanonicalRole());
  }, []);

  useEffect(() => {
    refresh();
  }, [pathname, refresh]);

  useEffect(() => {
    const onSync = () => refresh();
    window.addEventListener(SUBSCRIBER_PROFILE_SYNC, onSync);
    return () => window.removeEventListener(SUBSCRIBER_PROFILE_SYNC, onSync);
  }, [refresh]);

  const superAdmin = isSubscriberSuperAdmin(role);
  const adminOrStaff = isSubscriberAdminOrStaff(role);

  return {
    role,
    isSubscriberSuperAdmin: superAdmin,
    isSubscriberAdminOrStaff: adminOrStaff,
    /** Create/manage subscriber-level admins and roles (Level 2 super admin only). */
    canManageTenantAdmins: superAdmin,
    canOpenCompanySettings: superAdmin,
    refreshRole: refresh,
  };
}

export function dispatchSubscriberProfileSync(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SUBSCRIBER_PROFILE_SYNC));
}
