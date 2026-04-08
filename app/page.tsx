"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { parseCookies } from "nookies";
import {
  getPostLoginPath,
  normalizeLoginRole,
} from "@/lib/auth/roles";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const { token } = parseCookies();
    let tokenFromStorage: string | null = null;
    let accessType = "";
    let profile: Record<string, unknown> = {};
    if (typeof window !== "undefined") {
      tokenFromStorage = localStorage.getItem("token");
      accessType = localStorage.getItem("access_type") || "";
      try {
        const raw = localStorage.getItem("userProfile");
        if (raw) profile = JSON.parse(raw) as Record<string, unknown>;
      } catch {
        profile = {};
      }
    }

    if (token || tokenFromStorage) {
      const path = getPostLoginPath(normalizeLoginRole(profile, {}), accessType);
      router.replace(path);
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600">
      <p>Loading…</p>
    </div>
  );
}
