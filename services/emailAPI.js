import { axiosInstance } from "./axiosInstance";

/**
 * POST /api/email/send-pdfs
 * @param {File|Blob} pdfBlob - PDF file (Blob or File)
 * @param {string} email - Recipient email
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const sendPdfsAPI = async (pdfBlob, email) => {
  const formData = new FormData();
  const file = pdfBlob instanceof File ? pdfBlob : new File([pdfBlob], "instant-estimate-report.pdf", { type: "application/pdf" });
  formData.append("pdfs", file);
  formData.append("email", email);

  const { data } = await axiosInstance.post("/api/email/send-pdfs", formData);
  return data;
};
