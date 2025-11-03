import axios from "axios";
import { parseCookies } from "nookies";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// Interceptor for adding Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      // Get token from cookies (works on both SSR and client)
      const cookies = parseCookies();
      let token = cookies.token;

      // Fallback: if no cookie and we're on client, check localStorage
      if (!token && typeof window !== "undefined") {
        token = localStorage.getItem("token");
      }

      // Add token only if it exists
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

// Interceptor for handling response errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    // Redirect to login if unauthorized (client-side)
    // if (status === 401 && typeof window !== "undefined") {
    //   window.location.href = "/login";
    // }

    return Promise.reject(error);
  }
);

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
