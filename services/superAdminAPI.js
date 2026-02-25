import { handleAPIRequest } from "./axiosInstance";
import { axiosInstance } from "./axiosInstance";

// —— ADMINS ——

/** GET /api/admins – all admins list */
export const getAdminsAPI = () =>
  handleAPIRequest((endpoint) => axiosInstance.get(endpoint), "/api/admins", null);

/** GET /api/admins/:id – one admin by id */
export const getAdminByIdAPI = (id) =>
  handleAPIRequest((endpoint) => axiosInstance.get(endpoint), `/api/admins/${id}`, null);

/** POST /api/admins – create admin */
export const createAdminAPI = (body) =>
  handleAPIRequest(axiosInstance.post, "/api/admins", body);

/** PUT /api/admins/:id – update admin */
export const updateAdminAPI = (id, body) =>
  handleAPIRequest(axiosInstance.put, `/api/admins/${id}`, body);

/** DELETE /api/admins/:id – delete admin */
export const deleteAdminAPI = (id) =>
  handleAPIRequest(
    (endpoint) => axiosInstance.delete(endpoint),
    `/api/admins/${id}`,
    null
  );

// —— CUSTOMERS ——

/** GET /api/customers – all customers list (super-admin) */
export const getCustomersAPI = () =>
  handleAPIRequest((endpoint) => axiosInstance.get(endpoint), "/api/customers", null);

/** GET /api/admin/customers – current admin ke against jitne customers hain (assigned/created) wohi list */
export const getAdminCustomersAPI = () =>
  handleAPIRequest((endpoint) => axiosInstance.get(endpoint), "/api/admin/customers", null);

/** GET /api/customers/:id – one customer by id */
export const getCustomerByIdAPI = (id) =>
  handleAPIRequest((endpoint) => axiosInstance.get(endpoint), `/api/customers/${id}`, null);

/** POST /api/customers – create customer */
export const createCustomerAPI = (body) =>
  handleAPIRequest(axiosInstance.post, "/api/customers", body);

/** PUT /api/customers/:id – update customer */
export const updateCustomerAPI = (id, body) =>
  handleAPIRequest(axiosInstance.put, `/api/customers/${id}`, body);

/** PUT /api/customers/:id/assign – assign customer to admin */
export const assignCustomerToAdminAPI = (customerId, adminId) =>
  handleAPIRequest(
    axiosInstance.put,
    `/api/customers/${customerId}/assign`,
    adminId != null ? { adminId } : {}
  );

/** DELETE /api/customers/:id – delete customer */
export const deleteCustomerAPI = (id) =>
  handleAPIRequest(
    (endpoint) => axiosInstance.delete(endpoint),
    `/api/customers/${id}`,
    null
  );
