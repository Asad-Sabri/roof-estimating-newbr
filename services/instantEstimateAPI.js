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
