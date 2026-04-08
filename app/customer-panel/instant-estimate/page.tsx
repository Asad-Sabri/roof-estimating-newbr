"use client";

import CustomerLayout from "@/components/layout/CustomerLayout";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";
import InstantEstimateLanding from "@/components/estimating/InstantEstimateLanding";

export default function InstantEstimatePage() {
  useProtectedRoute();

  return (
    <CustomerLayout>
      <InstantEstimateLanding />
    </CustomerLayout>
  );
}
