"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { parseCookies } from "nookies";
import InstantEstimateLanding from "@/components/estimating/InstantEstimateLanding";

export default function InstantEstimatePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    if (typeof window !== "undefined") {
      const { token } = parseCookies();
      const tokenFromStorage = localStorage.getItem("token");

      // If user is logged in, redirect to dashboard
      if (token || tokenFromStorage) {
        router.replace("/customer-panel/dashboard");
      }
    }
  }, [router]);

  // Show landing page for non-logged users
  return <InstantEstimateLanding />;
}
