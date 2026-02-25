import { axiosInstance, handleAPIRequest } from "./axiosInstance";

/** Har request pe fresh data – cache nahi */
const freshConfig = () => ({
  params: { _t: Date.now() },
  headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
});

/**
 * Company APIs – tumhare pass jo hai:
 * - GET /api/company       → app/tenant ki company (sab ke liye same, admin save karta hai)
 * - GET /api/company/user  → current user ki company (admin load/save ke liye; backend agar customer ko bhi wohi de to report me use)
 * - GET /api/company/:id   → company by ID (jab companyId pehle se pata ho)
 * - POST /api/company      → admin company create/update
 */

/** GET /api/company – app/tenant company, report ke liye (admin jo save karta hai wohi) */
export const getCompanyAPI = () => {
  return handleAPIRequest(
    (endpoint) => axiosInstance.get(endpoint, freshConfig()),
    "/api/company",
    null
  );
};

/** GET /api/company/user – current user ki company; admin settings load + report fallback */
export const getCompanyUserAPI = () => {
  return handleAPIRequest(
    (endpoint) => axiosInstance.get(endpoint, freshConfig()),
    "/api/company/user",
    null
  );
};

/** GET /api/company/for-customer – customer panel / instant estimate report ke liye company details */
export const getCompanyForCustomerAPI = () => {
  return handleAPIRequest(
    (endpoint) => axiosInstance.get(endpoint, freshConfig()),
    "/api/company/for-customer",
    null
  );
};

/** GET /api/company/customers – admin: sirf wo customers jo us admin ne banaye ya assign kiye */
export const getCompanyCustomersAPI = () => {
  return handleAPIRequest(
    (endpoint) => axiosInstance.get(endpoint, freshConfig()),
    "/api/company/customers",
    null
  );
};

/** GET /api/company/:id – company by ID (jab companyId ho, e.g. estimate/user se) */
export const getCompanyByIdAPI = (id) => {
  if (!id) return Promise.reject(new Error("Company ID required"));
  return handleAPIRequest(
    (endpoint) => axiosInstance.get(endpoint, freshConfig()),
    `/api/company/${id}`,
    null
  );
};

/** GET /api/company/:adminId – us admin ki sari companies (admin panel list + customer form dropdown) */
export const getCompaniesByAdminAPI = (adminId) => {
  if (!adminId) return Promise.reject(new Error("Admin ID required"));
  return handleAPIRequest(
    (endpoint) => axiosInstance.get(endpoint, freshConfig()),
    `/api/company/${adminId}`,
    null
  );
};

/** POST /api/company – admin company create */
export const createCompanyAPI = (data) => {
  return handleAPIRequest(
    axiosInstance.post,
    "/api/company",
    data
  );
};

/** GET /api/company – all companies (admin list) */
export const getAllCompaniesAPI = () => {
  return handleAPIRequest(
    (endpoint) => axiosInstance.get(endpoint, freshConfig()),
    "/api/company",
    null
  );
};

/** PUT /api/company/:id – update company */
export const updateCompanyAPI = (id, data) => {
  if (!id) return Promise.reject(new Error("Company ID required"));
  return handleAPIRequest(
    (endpoint, body) => axiosInstance.put(endpoint, body),
    `/api/company/${id}`,
    data
  );
};

/** GET /api/company/settings – admin: fetch own company settings (real-time) */
export const getCompanySettingsAPI = () => {
  return handleAPIRequest(
    (endpoint) => axiosInstance.get(endpoint, freshConfig()),
    "/api/company/settings",
    null
  );
};

/** PUT /api/company/settings – admin: update own company settings */
export const putCompanySettingsAPI = (data) => {
  return handleAPIRequest(
    (endpoint, body) => axiosInstance.put(endpoint, body),
    "/api/company/settings",
    data
  );
};

/** DELETE /api/company/:id */
export const deleteCompanyAPI = (id) => {
  if (!id) return Promise.reject(new Error("Company ID required"));
  return handleAPIRequest(
    (endpoint) => axiosInstance.delete(endpoint, freshConfig()),
    `/api/company/${id}`,
    null
  );
};
