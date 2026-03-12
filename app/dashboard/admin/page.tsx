import { redirect } from "next/navigation";

/** Redirect-only page; admin layout lives in @/components/layout/AdminDashboardLayout */
export default function DashboardAdminPage(): never {
  redirect("/admin-panel/dashboard");
}
