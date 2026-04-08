// services/auth.js
import { axiosInstance, handleAPIRequest } from "./axiosInstance";
import { subscriberPaths, customerPaths } from "./apiPaths";
import { applyProfileToStorage } from "@/lib/auth/roles";

// ✅ Get logged-in user profile (user.canonicalRole + tenantId)
export const getProfileAPI = () =>
  handleAPIRequest(axiosInstance.get, "/api/profile");

/** Fetch profile and persist canonicalRole + tenantId to localStorage. */
export const syncProfileToStorage = async () => {
  const data = await getProfileAPI();
  applyProfileToStorage(data);
  return data;
};

// ✅ Login user
export const loginAPI = (data) =>
  handleAPIRequest(axiosInstance.post, "/api/login", data);

// ✅ Get all roles
export const roleListAPI = () =>
  handleAPIRequest(axiosInstance.get, "/api/role_list");

export const signupAPI = (data) =>
  handleAPIRequest(axiosInstance.post, "/api/signup/", data);

// ✅ Approve user (admin) – POST /api/approve-user body: { userId: "..." }
export const approveUserAPI = (data) =>
  handleAPIRequest(axiosInstance.post, "/api/approve-user", data);

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

/** GET /api/roof-estimate-projects/ – all projects (platform / legacy) */
export const getAllProjectsAPI = () =>
  handleAPIRequest(axiosInstance.get, "/api/roof-estimate-projects");

/** Subscriber-scoped projects (same router as legacy per backend). */
export const getSubscriberProjectsAPI = () =>
  handleAPIRequest(
    (endpoint) => axiosInstance.get(endpoint),
    subscriberPaths.projects,
    null
);

/** GET /api/subscriber/context */
export const getSubscriberContextAPI = () =>
  handleAPIRequest(
    (endpoint) => axiosInstance.get(endpoint),
    subscriberPaths.context,
    null
);

/** Same as subscriberAPI — list team (tries `/members`, then `/team` on 404). */
export { getSubscriberTeamAPI } from "./subscriberAPI";

/** GET /api/customer/dashboard */
export const getCustomerDashboardAPI = () =>
  handleAPIRequest(
    (endpoint) => axiosInstance.get(endpoint),
    customerPaths.dashboard,
    null
  );

export const deleteUserProjectsAPI = (id) =>
  handleAPIRequest(axiosInstance.delete, `/api/roof-estimate-projects/${id}`);



export const deleteProject = async (id) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `http://88.99.241.139:5000/api/roof-estimate-projects/${id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
};