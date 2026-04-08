import { axiosInstance, handleAPIRequest } from "./axiosInstance";
import { platformPaths } from "./apiPaths";

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

/** GET /api/company/subscribers – customer: saari subscribers (companies) ki list */
export const getSubscribersListAPI = () => {
  return handleAPIRequest(
    (endpoint) => axiosInstance.get(endpoint, freshConfig()),
    "/api/company/subscribers",
    null
  );
};

/** POST /api/subscribe – customer kisi subscriber ko subscribe kare (assignedTo = adminId) */
export const subscribeAPI = (adminId) => {
  if (!adminId) return Promise.reject(new Error("Admin ID required"));
  return handleAPIRequest(
    (endpoint, body) => axiosInstance.post(endpoint, body),
    "/api/subscribe",
    { adminId }
  );
};

/** POST /api/subscribe with adminId: null – customer unsubscribe (agar backend support kare) */
export const unsubscribeAPI = () => {
  return handleAPIRequest(
    (endpoint, body) => axiosInstance.post(endpoint, body),
    "/api/subscribe",
    { adminId: null }
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

/** GET /api/my-customers – logged-in admin ke against sare customers */
export const getMyCustomersAPI = () => {
  return handleAPIRequest(
    (endpoint) => axiosInstance.get(endpoint, freshConfig()),
    "/api/my-customers",
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

/** Ensure contact fields sent in both camelCase and snake_case for backend compatibility */
function withContactSnakeCase(data) {
  if (!data || typeof data !== "object") return data;
  return {
    ...data,
    contact_person_name: data.contactPersonName ?? data.contact_person_name,
    contact_person_phone: data.contactPersonPhone ?? data.contact_person_phone,
    contact_person_email: data.contactPersonEmail ?? data.contact_person_email,
  };
}

/** POST /api/company – admin company create */
export const createCompanyAPI = (data) => {
  return handleAPIRequest(
    axiosInstance.post,
    "/api/company",
    withContactSnakeCase(data)
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
    withContactSnakeCase(data)
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

/**
 * PUT /api/company/settings — multipart logo (field `logo`).
 * Backend may also accept `company_logo`; axios sends FormData without forcing JSON Content-Type.
 */
export const uploadCompanyLogoAPI = (file) => {
  if (!file) return Promise.reject(new Error("File required"));
  const formData = new FormData();
  formData.append("logo", file);
  return handleAPIRequest(
    (endpoint, body) => axiosInstance.put(endpoint, body),
    "/api/company/settings",
    formData
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

/**
 * Platform shell (super-admin UI) — subscribers CRUD with `requirePlatformPermission(companies.*)`.
 * Use these instead of /api/company for Platform Admin + companies.write; legacy POST /api/company may be super-admin-only.
 */
export const createPlatformSubscriberAPI = (data) => {
  return handleAPIRequest(
    axiosInstance.post,
    platformPaths.subscribers,
    withContactSnakeCase(data)
  );
};

export const updatePlatformSubscriberAPI = (id, data) => {
  if (!id) return Promise.reject(new Error("Subscriber ID required"));
  return handleAPIRequest(
    (endpoint, body) => axiosInstance.put(endpoint, body),
    `${platformPaths.subscribers}/${id}`,
    withContactSnakeCase(data)
  );
};

export const deletePlatformSubscriberAPI = (id) => {
  if (!id) return Promise.reject(new Error("Subscriber ID required"));
  return handleAPIRequest(
    (endpoint) => axiosInstance.delete(endpoint, freshConfig()),
    `${platformPaths.subscribers}/${id}`,
    null
  );
};
