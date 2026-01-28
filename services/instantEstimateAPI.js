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

/** GET /api/instant-estimates/user – logged-in user ke instant estimates */
export const getUserInstantEstimatesAPI = () => {
  return handleAPIRequest(
    (endpoint) => axiosInstance.get(endpoint),
    "/api/instant-estimates/user",
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
