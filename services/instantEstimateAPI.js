 // services/instantEstimateAPI.js
import { axiosInstance, handleAPIRequest } from "./axiosInstance";

/**
 * Create Instant Estimate Project
 * This API is called when user completes all steps in instant estimate flow
 * Endpoint: POST /api/instant-estimates
 */
export const createInstantEstimateAPI = (data) => {
  return handleAPIRequest(
    axiosInstance.post,
    "/api/instant-estimates",
    data
  );
};

/**
 * Update Instant Estimate Project
 * This API is called to update existing estimate (for saving progress on each step)
 * Endpoint: PATCH /api/instant-estimates/{id}
 */ 
export const updateInstantEstimateAPI = (id, data) => {
  return handleAPIRequest(
    axiosInstance.patch,
    `/api/instant-estimates/${id}`,
    data
  );
};
