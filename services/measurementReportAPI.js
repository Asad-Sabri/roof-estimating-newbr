import { axiosInstance, handleAPIRequest } from "./axiosInstance";

/** GET /api/measurement-reports – list (scoped by backend to current user/subscriber) */
export const getMeasurementReportsAPI = () =>
  handleAPIRequest(
    (endpoint) => axiosInstance.get(endpoint),
    "/api/measurement-reports",
    null
  );

/** GET /api/measurement-reports/:id */
export const getMeasurementReportAPI = (id) => {
  if (!id) return Promise.reject(new Error("Report ID required"));
  return handleAPIRequest(
    (endpoint) => axiosInstance.get(endpoint),
    `/api/measurement-reports/${id}`,
    null
  );
};

/** POST /api/measurement-reports – create */
export const createMeasurementReportAPI = (data) =>
  handleAPIRequest(axiosInstance.post, "/api/measurement-reports", data);

/** PATCH /api/measurement-reports/:id – update */
export const updateMeasurementReportAPI = (id, data) => {
  if (!id) return Promise.reject(new Error("Report ID required"));
  return handleAPIRequest(
    (endpoint, body) => axiosInstance.patch(endpoint, body),
    `/api/measurement-reports/${id}`,
    data
  );
};

/** DELETE /api/measurement-reports/:id */
export const deleteMeasurementReportAPI = (id) => {
  if (!id) return Promise.reject(new Error("Report ID required"));
  return handleAPIRequest(
    (endpoint) => axiosInstance.delete(endpoint),
    `/api/measurement-reports/${id}`,
    null
  );
};

/** GET /api/measurement-reports/:id/pdf – download PDF */
export const downloadMeasurementReportPdfAPI = async (id, filename = "measurement-report.pdf") => {
  const res = await axiosInstance.get(`/api/measurement-reports/${id}/pdf`, { responseType: "blob" });
  const url = window.URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

/** GET /api/measurement-reports/:id/xactimate – download Xactimate XML */
export const downloadMeasurementReportXactimateAPI = async (id, filename = "measurement-report.xactimate.xml") => {
  const res = await axiosInstance.get(`/api/measurement-reports/${id}/xactimate`, { responseType: "blob" });
  const url = window.URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};
