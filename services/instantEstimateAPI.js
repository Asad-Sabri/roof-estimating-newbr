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
