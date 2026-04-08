"use client";

import Link from "next/link";

type Props = {
  isChecking: boolean;
  isAuthenticated: boolean;
  children: React.ReactNode;
  /** Shown when session is missing after checks (avoids blank screens). */
  title?: string;
};

export default function SessionGate({
  isChecking,
  isAuthenticated,
  children,
  title = "Session required",
}: Props) {
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-slate-700" />
          <p className="mt-4 text-gray-600">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to continue. If you were logged out, your session may have expired.
          </p>
          <Link
            href="/login/"
            className="mt-6 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
