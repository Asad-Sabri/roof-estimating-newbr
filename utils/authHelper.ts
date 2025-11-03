// utils/authHelpers.ts
import { destroyCookie } from "nookies";
import { toast } from "react-toastify";

export const handleLogout = () => {
  destroyCookie(null, "token", {
    path: "/",
    // domain: ".esycles.com"
  });
  destroyCookie(null, "token", { path: "/" });

  localStorage.removeItem("persist:root");

  toast.success("Logged out successfully!");

  setTimeout(() => {
    window.location.href = "/login";
  }, 1000);
};
