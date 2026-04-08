/**
 * Public URL prefixes per portal tier (browser address bar).
 * Internal app routes stay under `super-admin`, `admin-panel`, `customer-panel` (rewritten in next.config).
 */

export const PLATFORM_SUPER_ADMIN_BASE = "/platform-super-admin";
export const PLATFORM_ADMIN_BASE = "/platform-admin";
export const SUBSCRIBER_SUPER_ADMIN_BASE = "/subscriber-super-admin";
export const SUBSCRIBER_ADMIN_BASE = "/subscriber-admin";
export const CUSTOMER_BASE = "/customer";

export const CANONICAL_ROLE_COOKIE = "canonical_role";

/** For middleware + client: keep cookie in sync with `loginRole` / profile. */
export function setCanonicalRoleCookieClient(role: string): void {
  if (typeof window === "undefined") return;
  const maxAge = 30 * 24 * 60 * 60;
  document.cookie = `${CANONICAL_ROLE_COOKIE}=${encodeURIComponent(role)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/** Map public platform shell URL → legacy `/super-admin` for permission matching. */
export function normalizePlatformShellPath(href: string): string {
  return href
    .replace(/^\/platform-super-admin(?=\/|$)/, "/super-admin")
    .replace(/^\/platform-admin(?=\/|$)/, "/super-admin");
}

/** Map public subscriber shell URL → legacy `/admin-panel` for guards. */
export function normalizeSubscriberShellPath(href: string): string {
  return href
    .replace(/^\/subscriber-super-admin(?=\/|$)/, "/admin-panel")
    .replace(/^\/subscriber-admin(?=\/|$)/, "/admin-panel");
}

/** Map public customer shell URL → legacy `/customer-panel`. */
export function normalizeCustomerShellPath(href: string): string {
  return href.replace(/^\/customer(?=\/|$)/, "/customer-panel");
}

export function platformBaseForRole(role: string | null | undefined): string {
  if (role === "PLATFORM_ADMIN") return PLATFORM_ADMIN_BASE;
  return PLATFORM_SUPER_ADMIN_BASE;
}

export function subscriberBaseForRole(role: string | null | undefined): string {
  if (role === "SUBSCRIBER_SUPER_ADMIN") return SUBSCRIBER_SUPER_ADMIN_BASE;
  return SUBSCRIBER_ADMIN_BASE;
}
