import { axiosInstance, handleAPIRequest } from "./axiosInstance";

export const orderRoofAPI = (data) =>
  handleAPIRequest(axiosInstance.post, "api/reports/", data);

export const generateOrderRoofPDFAPI = (email) =>
  handleAPIRequest(axiosInstance.get, `api/roof-report/pdf/?email=${email}`);
