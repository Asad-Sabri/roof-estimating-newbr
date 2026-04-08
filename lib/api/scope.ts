import { STORAGE_TENANT } from "@/lib/auth/roles";

/**
 * Prefix React Query keys with tenant id so cached data does not leak across subscribers.
 * Use for subscriber/customer-scoped lists after login.
 */
export function withTenantKey(base: readonly unknown[]): unknown[] {
  if (typeof window === "undefined") return [...base];
  const t = localStorage.getItem(STORAGE_TENANT);
  return t ? [...base, "t", t] : [...base];
}
