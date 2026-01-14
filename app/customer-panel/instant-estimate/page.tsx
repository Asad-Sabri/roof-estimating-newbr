"use client";

import CustomerDashboardLayout from "@/app/dashboard/customer/page";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";
import InstantEstimateLanding from "@/components/estimating/InstantEstimateLanding";

export default function InstantEstimatePage() {
  useProtectedRoute();

  return (
    <CustomerDashboardLayout>
      <InstantEstimateLanding />
    </CustomerDashboardLayout>
  );
}
