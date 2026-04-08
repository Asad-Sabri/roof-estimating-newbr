  // services/axiosInstance.js
  import axios from "axios";
  import { parseCookies } from "nookies";
  import { sendTenantHeader, autoTenantForSubscriberAndCustomer } from "@/lib/auth/env";
  import {
    getStoredCanonicalRole,
    isCustomerRole,
    isSubscriberRole,
  } from "@/lib/auth/roles";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // ab /api hai
  headers: {
    "Content-Type": "application/json",
  },
});


  // ✅ Add Authorization token if available; FormData pe Content-Type mat lagao (browser multipart + boundary set karega)
  axiosInstance.interceptors.request.use(
    (config) => {
      try {
        if (config.data instanceof FormData) {
          delete config.headers["Content-Type"];
        }
        const cookies = parseCookies();
        let token = cookies.token;

        if (!token && typeof window !== "undefined") {
          token = localStorage.getItem("token");
        }

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        if (typeof window !== "undefined") {
          const tenantId = localStorage.getItem("tenantId");
          if (tenantId) {
            let attachTenant = sendTenantHeader();
            if (!attachTenant && autoTenantForSubscriberAndCustomer()) {
              const role = getStoredCanonicalRole();
              if (
                role &&
                (isSubscriberRole(role) || isCustomerRole(role))
              ) {
                attachTenant = true;
              }
            }
            if (attachTenant) {
              config.headers["X-Tenant-Id"] = tenantId;
            }
          }
        }

        return config;
      } catch (err) {
        console.error("Error in request interceptor:", err);
        return Promise.reject(err);
      }
    },
    (error) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;
      const data = error?.response?.data;
      const msg =
        (typeof data?.message === "string" && data.message) ||
        (typeof data?.detail === "string" && data.detail) ||
        "";

      if (typeof window !== "undefined") {
        const reqUrl = String(error?.config?.url || "");
        const isLoginPost = reqUrl.includes("/api/login");
        if (status === 401 && !isLoginPost) {
          import("react-toastify").then(({ toast }) => {
            toast.error(msg || "Session expired — please sign in again");
          });
        } else if (status === 403) {
          import("react-toastify").then(({ toast }) => {
            toast.error(msg || "Access denied");
          });
        }
      }
      return Promise.reject(error);
    }
  );

  // ✅ Unified API handler
  export const handleAPIRequest = async (requestFunc, endpoint, requestData) => {
    try {
      const { data } = await requestFunc(endpoint, requestData);
      return data;
    } catch (error) {
      const body = error?.response?.data;
      const errorMessage =
        (typeof body?.message === "string" && body.message) ||
        (typeof body?.detail === "string" && body.detail) ||
        error.message ||
        "Unknown error";
      console.error(`API Error (${endpoint}):`, errorMessage);
      throw error;
    }
  };
