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

/** GET /api/company/:id – company by ID (jab companyId ho, e.g. estimate/user se) */
export const getCompanyByIdAPI = (id) => {
  if (!id) return Promise.reject(new Error("Company ID required"));
  return handleAPIRequest(
    (endpoint) => axiosInstance.get(endpoint, freshConfig()),
    `/api/company/${id}`,
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

/** DELETE /api/company/:id */
export const deleteCompanyAPI = (id) => {
  if (!id) return Promise.reject(new Error("Company ID required"));
  return handleAPIRequest(
    (endpoint) => axiosInstance.delete(endpoint, freshConfig()),
    `/api/company/${id}`,
    null
  );
};
