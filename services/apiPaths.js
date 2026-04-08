/**
 * Backend SaaS route prefixes (prefer these over legacy paths where documented).
 * Legacy routes may still work; tenantId is required for many subscriber flows.
 */

export const platformPaths = {
  subscribers: "/api/platform/subscribers",
  admins: "/api/platform/admins",
  admin: (id) => `/api/platform/admins/${id}`,
  assignCustomer: (customerId) => `/api/platform/customers/${customerId}/assign`,
  permissionsCatalog: "/api/platform/permissions",
  platformAdminPermissions: (id) => `/api/platform/platform-admins/${id}/permissions`,
};

export const subscriberPaths = {
  context: "/api/subscriber/context",
  /** Newer backends — list/create/update/delete team. */
  members: "/api/subscriber/members",
  member: (id) => `/api/subscriber/members/${id}`,
  /** Legacy — still common; `subscriberAPI` falls back here on 404 from `members`. */
  team: "/api/subscriber/team",
  teamMember: (id) => `/api/subscriber/team/${id}`,
  /** Optional — if 404, UI falls back to a default catalog. */
  permissionsCatalog: "/api/subscriber/permissions",
  /** Per-member permissions — prefer `members`; legacy `teamMemberPermissions` on 404. */
  memberPermissions: (id) => `/api/subscriber/members/${id}/permissions`,
  teamMemberPermissions: (id) => `/api/subscriber/team/${id}/permissions`,
  customers: "/api/subscriber/customers",
  projects: "/api/subscriber/projects",
};

export const customerPaths = {
  dashboard: "/api/customer/dashboard",
};
