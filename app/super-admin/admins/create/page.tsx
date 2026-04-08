"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePlatformAccess } from "@/lib/auth/usePlatformAccess";
import { platformBaseForRole } from "@/lib/routes/portalPaths";

export default function SuperAdminCreateAdminPage() {
  const router = useRouter();
  const { role } = usePlatformAccess();
  const base = platformBaseForRole(role);
  useEffect(() => {
    router.replace(`${base}/admins`);
  }, [router, base]);
  return null;
}
