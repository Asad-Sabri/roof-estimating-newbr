// services/auth.js
import { axiosInstance, handleAPIRequest } from "./axiosInstance";

// ✅ Get logged-in user profile
export const getProfileAPI = () =>
  handleAPIRequest(axiosInstance.get, "/profile");

// ✅ Login user
export const loginAPI = (data) =>
  handleAPIRequest(axiosInstance.post, "/login", data);

// ✅ Get all roles
export const roleListAPI = () =>
  handleAPIRequest(axiosInstance.get, "/role_list");

// ✅ Signup new user
export const signupAPI = (data) =>
  handleAPIRequest(axiosInstance.post, "/signup", data);

// ✅ Verify OTP after signup
export const verifyOTPAPI = (data) =>
  handleAPIRequest(axiosInstance.post, "/verify-otp", data);

// ✅ Forgot / Reset password
export const forgotPasswordAPI = (data) =>
  handleAPIRequest(axiosInstance.post, "/reset_password", data);

// ✅ Resend OTP
export const resendOTPAPI = (data) =>
  handleAPIRequest(axiosInstance.post, "/resend-otp", data);

// ✅ Create new roof estimate project
export const createProjectAPI = (data) =>
  handleAPIRequest(axiosInstance.post, "/roof-estimate-projects", data);

// ✅ Get all projects for logged-in user
export const getUserProjectsAPI = () =>
  handleAPIRequest(axiosInstance.get, "/roof-estimate-projects/user");

// ✅ Delete a project by ID
export const deleteUserProjectsAPI = (id) =>
  handleAPIRequest(axiosInstance.delete, `/roof-estimate-projects/${id}`);
