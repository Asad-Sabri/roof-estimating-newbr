import { handleAPIRequest } from "./axiosInstance";
import { axiosInstance } from "./axiosInstance";
import { platformPaths, subscriberPaths } from "./apiPaths";

export const getPlatformPermissionsCatalogAPI = () =>
  handleAPIRequest(
    (endpoint) => axiosInstance.get(endpoint),
    platformPaths.permissionsCatalog,
    null
);

export const getPlatformAdminPermissionsAPI = (id) =>
  handleAPIRequest(
    (endpoint) => axiosInstance.get(endpoint),
    platformPaths.platformAdminPermissions(id),
    null
);

export const putPlatformAdminPermissionsAPI = (id, body) =>
  handleAPIRequest(
    axiosInstance.put,
    platformPaths.platformAdminPermissions(id),
    body
  );

// —— PLATFORM ADMINS (preferred: /api/platform/admins) ——

export const getAdminsAPI = () =>
  handleAPIRequest(
    (endpoint) => axiosInstance.get(endpoint),
    platformPaths.admins,
    null
);

export const getAdminByIdAPI = (id) =>
  handleAPIRequest(
    (endpoint) => axiosInstance.get(endpoint),
    platformPaths.admin(id),
    null
);

export const createAdminAPI = (body) =>
  handleAPIRequest(axiosInstance.post, platformPaths.admins, body);

export const updateAdminAPI = (id, body) =>
  handleAPIRequest(axiosInstance.put, platformPaths.admin(id), body);

export const deleteAdminAPI = (id) =>
  handleAPIRequest(
    (endpoint) => axiosInstance.delete(endpoint),
    platformPaths.admin(id),
    null
);

/**
 * Legacy DELETE /api/admins/:id — some backends allow Platform Admin (admins.write) to remove
 * subscriber/company admins here while DELETE /api/platform/admins/:id stays super-admin-only.
 */
export const deleteAdminLegacyAPI = (id) =>
  handleAPIRequest(
    (endpoint) => axiosInstance.delete(endpoint),
    `/api/admins/${id}`,
    null
  );

// —— CUSTOMERS (legacy + subscriber-scoped; tenantId required for /api/customers) ——

/** Legacy: full list — platform flows; prefer not calling from platform UI per RBAC. */
export const getCustomersAPI = () =>
  handleAPIRequest((endpoint) => axiosInstance.get(endpoint), "/api/customers", null);

/** Subscriber-scoped customer list (recommended). */
export const getSubscriberCustomersAPI = () =>
  handleAPIRequest(
    (endpoint) => axiosInstance.get(endpoint),
    subscriberPaths.customers,
    null
);

/** @deprecated use getSubscriberCustomersAPI — kept name for gradual migration */
export const getAdminCustomersAPI = () => getSubscriberCustomersAPI();

export const getCustomerByIdAPI = (id) =>
  handleAPIRequest(
    (endpoint) => axiosInstance.get(endpoint),
    `/api/customers/${id}`,
    null
);

export const createCustomerAPI = (body) =>
  handleAPIRequest(axiosInstance.post, "/api/customers", body);

export const updateCustomerAPI = (id, body) =>
  handleAPIRequest(axiosInstance.put, `/api/customers/${id}`, body);

/** Platform: assign customer to admin — PUT /api/platform/customers/:id/assign */
export const assignCustomerToAdminAPI = (customerId, adminId) =>
  handleAPIRequest(
    axiosInstance.put,
    platformPaths.assignCustomer(customerId),
    adminId != null ? { adminId } : {}
  );

export const deleteCustomerAPI = (id) =>
  handleAPIRequest(
    (endpoint) => axiosInstance.delete(endpoint),
    `/api/customers/${id}`,
    null
);
