// services/axiosInstance.js
import axios from "axios";
import { parseCookies } from "nookies";

// ✅ Base URL ko relative rakho taake proxy handle kare
export const axiosInstance = axios.create({
  baseURL: "/", // 👈 ye most important change hai
});

// ✅ Interceptor for adding Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const cookies = parseCookies();
      let token = cookies.token;

      // Fallback: if no cookie and we're on client, check localStorage
      if (!token && typeof window !== "undefined") {
        token = localStorage.getItem("token");
      }

      // Add token if exists
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (err) {
      console.error("Error in request interceptor:", err);
      return Promise.reject(err);
    }
  },
  (error) => Promise.reject(error)
);

// ✅ Interceptor for handling response errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    // Optional redirect on 401 (uncomment if needed)
    // if (status === 401 && typeof window !== "undefined") {
    //   window.location.href = "/login";
    // }

    return Promise.reject(error);
  }
);

// ✅ Unified API handler for error handling
export const handleAPIRequest = async (requestFunc, endpoint, requestData) => {
  try {
    const { data } = await requestFunc(endpoint, requestData);
    return data;
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message || error.message || "Unknown error";
    console.error(`API Error (${endpoint}):`, errorMessage);
    throw error;
  }
};
