import { axiosInstance, handleAPIRequest } from "./axiosInstance";

export const createInstantEstimateAPI = (data) => {
  return handleAPIRequest(
    axiosInstance.post,
    "/api/instant-estimates",
    data
  );
};

export const updateInstantEstimateAPI = (id, data) => {
  return handleAPIRequest(
    axiosInstance.patch,
    `/api/instant-estimates/${id}`,
    data
  );
};

/** GET /api/instant-estimates/user – logged-in user ke instant estimates (legacy) */
export const getUserInstantEstimatesAPI = () => {
  return handleAPIRequest(
    (endpoint) => axiosInstance.get(endpoint),
    "/api/instant-estimates/user",
    null
  );
};

/** GET /api/instant-estimates/:id – user id ke against usi user ke instant estimates */
export const getInstantEstimatesByUserIdAPI = (userId) => {
  if (!userId) return Promise.reject(new Error("User ID is required"));
  return handleAPIRequest(
    (endpoint) => axiosInstance.get(endpoint),
    `/api/instant-estimates/${userId}`,
    null
  );
};

/** DELETE /api/instant-estimates/:id */
export const deleteInstantEstimateAPI = (id) => {
  return handleAPIRequest(
    (endpoint) => axiosInstance.delete(endpoint),
    `/api/instant-estimates/${id}`,
    null
  );
};

/** POST /api/instant-estimates/:id/request-full-report – customer requests full report (Auth: customer token) */
export const requestFullReportAPI = (id) => {
  if (!id) return Promise.reject(new Error("Estimate ID is required"));
  return handleAPIRequest(
    (endpoint) => axiosInstance.post(endpoint),
    `/api/instant-estimates/${id}/request-full-report`,
    null
  );
};

/** GET /api/instant-estimates/preliminary-requests – admin list of full-report requests (Auth: admin token) */
export const getPreliminaryRequestsAPI = () => {
  return handleAPIRequest(
    (endpoint) => axiosInstance.get(endpoint),
    "/api/instant-estimates/preliminary-requests",
    null
  );
};
