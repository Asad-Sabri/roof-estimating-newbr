// services/auth.js
import { axiosInstance, handleAPIRequest } from "./axiosInstance";

// ✅ Get logged-in user profile
export const getProfileAPI = () =>
  handleAPIRequest(axiosInstance.get, "/api/profile");

// ✅ Login user
export const loginAPI = (data) =>
  handleAPIRequest(axiosInstance.post, "/api/login", data);

// ✅ Get all roles
export const roleListAPI = () =>
  handleAPIRequest(axiosInstance.get, "/api/role_list");

export const signupAPI = (data) =>
  handleAPIRequest(axiosInstance.post, "/api/signup/", data);
// ✅ Verify OTP after signup
export const verifyOTPAPI = (data) =>
  handleAPIRequest(axiosInstance.post, "/api/verify-otp", data);

// ✅ Forgot/Reset password
export const forgotPasswordAPI = (data) =>
  handleAPIRequest(axiosInstance.post, "/api/reset_password", data);

// ✅ Resend OTP
export const resendOTPAPI = (data) =>
  handleAPIRequest(axiosInstance.post, "/api/resend-otp", data);


// ✅ Create new roof estimate project
export const createProjectAPI = (data) =>
  handleAPIRequest(axiosInstance.post, "/api/roof-estimate-projects", data);


export const getUserProjectsAPI = () =>
  handleAPIRequest(axiosInstance.get, "/api/roof-estimate-projects/user");

export const deleteUserProjectsAPI = (id) =>
  handleAPIRequest(axiosInstance.delete, `/api/roof-estimate-projects/${id}`);
