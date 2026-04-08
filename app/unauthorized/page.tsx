"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getPostLoginPath,
  getStoredCanonicalRole,
} from "@/lib/auth/roles";

export default function UnauthorizedPage() {
  const router = useRouter();
  const [home, setHome] = useState("/login");

  useEffect(() => {
    const role = getStoredCanonicalRole();
    const accessType = localStorage.getItem("access_type") || "";
    if (role) {
      setHome(getPostLoginPath(role, accessType));
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-2xl font-semibold text-gray-900">Access denied</h1>
      <p className="mt-2 text-gray-600 text-center max-w-md">
        You do not have permission to view this page. If you believe this is a mistake, sign
        out and try again with the correct account.
      </p>
      <div className="mt-8 flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          Go back
        </button>
        <Link
          href={home}
          className="px-4 py-2 rounded-lg text-white bg-slate-900 hover:bg-slate-800"
        >
          Go to your dashboard
        </Link>
        <Link href="/login" className="px-4 py-2 rounded-lg text-[#8b0e0f] font-medium">
          Sign in
        </Link>
      </div>
    </div>
  );
}
