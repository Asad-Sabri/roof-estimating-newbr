"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { parseCookies } from "nookies";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const { token } = parseCookies();
    let tokenFromStorage = null;
    if (typeof window !== "undefined") {
      tokenFromStorage = localStorage.getItem("token");
    }

    // If user is logged in, redirect to dashboard
    if (token || tokenFromStorage) {
      router.push("/customer-panel/dashboard");
    } else {
      // If not logged in, redirect to login page
      router.push("/login");
    }
  }, [router]);

  return null;
}
