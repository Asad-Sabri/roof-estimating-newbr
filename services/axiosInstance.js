// services/axiosInstance.js
import axios from "axios";
import { parseCookies } from "nookies";

// ✅ Base URL from environment (Vercel env ya local .env)
export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Add Authorization token if available
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const cookies = parseCookies();
      let token = cookies.token;

      if (!token && typeof window !== "undefined") {
        token = localStorage.getItem("token");
      }

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

// ✅ Handle response errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    // if (status === 401 && typeof window !== "undefined") {
    //   window.location.href = "/login";
    // }
    return Promise.reject(error);
  }
);

// ✅ Unified API handler
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
