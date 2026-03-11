"use client";

import CustomerDashboardLayout from "@/components/layout/CustomerDashboardLayout";
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
