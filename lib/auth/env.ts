/**
 * Feature flags for rolling out SaaS routing without breaking existing deployments.
 * Set in `.env` — all default to safe backward-compatible behavior where noted.
 */

function readPublic(key: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  return process.env[key];
}

/** When false, only legacy rules apply (portal/customer cannot open platform UIs). Default: true. */
export function saasRoleGuardsEnabled(): boolean {
  return readPublic("NEXT_PUBLIC_ENABLE_SAAS_ROLE_GUARDS") !== "false";
}

/** When true, send `X-Tenant-Id` on axios requests. Default: false (avoid breaking APIs that reject unknown headers). */
export function sendTenantHeader(): boolean {
  return readPublic("NEXT_PUBLIC_SEND_TENANT_HEADER") === "true";
}

/** Include legacy `role` field on login POST if API still expects it. Default: true. */
export function loginIncludeRoleField(): boolean {
  return readPublic("NEXT_PUBLIC_LOGIN_INCLUDE_ROLE") !== "false";
}

/**
 * When true (default), attach `X-Tenant-Id` for subscriber/customer sessions if `tenantId` exists,
 * even if `NEXT_PUBLIC_SEND_TENANT_HEADER` is off. Set to "false" to rely on env flag only.
 */
export function autoTenantForSubscriberAndCustomer(): boolean {
  return readPublic("NEXT_PUBLIC_AUTO_TENANT_FOR_SCOPED_ROLES") !== "false";
}
