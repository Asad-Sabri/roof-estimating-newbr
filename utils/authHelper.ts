// utils/authHelpers.ts
import { destroyCookie } from "nookies";
import { toast } from "react-toastify";
import { STORAGE_TENANT } from "@/lib/auth/roles";
import { CANONICAL_ROLE_COOKIE } from "@/lib/routes/portalPaths";

export const handleLogout = () => {
  // Set logout flag in sessionStorage before clearing
  if (typeof window !== "undefined") {
    sessionStorage.setItem("logout", "true");
  }

  // Clear all cookies
  destroyCookie(null, "token", {
    path: "/",
  });
  destroyCookie(null, CANONICAL_ROLE_COOKIE, {
    path: "/",
  });
  
  // Clear localStorage
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("loginRole");
    localStorage.removeItem("access_type");
    localStorage.removeItem("userProfile");
    localStorage.removeItem(STORAGE_TENANT);
    localStorage.removeItem("persist:root");
    
    // Also clear document.cookie (multiple formats to ensure it's cleared)
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "token=; path=/; max-age=0";
    document.cookie = `${CANONICAL_ROLE_COOKIE}=; path=/; max-age=0`;
  }

  toast.success("Logged out successfully!");

  // Use window.location.href for complete redirect (forces page reload and clears all state)
  setTimeout(() => {
    window.location.href = "/login";
  }, 500);
};
