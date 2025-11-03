import React from "react";
import Link from "next/link";

export const DashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4 space-y-4">
        <h2 className="text-xl font-bold">Dashboard</h2>
        <nav className="flex flex-col space-y-2">
          <Link href="/dashboard/customer" className="hover:text-blue-600">
            Customer
          </Link>
          <Link href="/dashboard/estimator" className="hover:text-blue-600">
            Estimator
          </Link>
          <Link href="/dashboard/admin" className="hover:text-blue-600">
            Admin
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
};
