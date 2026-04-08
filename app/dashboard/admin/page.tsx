import { redirect } from "next/navigation";

/** Redirect-only page; admin layout lives in @/components/layout/SubscriberLayout */
export default function DashboardAdminPage(): never {
  redirect("/subscriber-admin/dashboard");
}
