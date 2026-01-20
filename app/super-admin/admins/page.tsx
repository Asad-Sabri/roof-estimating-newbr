"use client";

import SuperAdminDashboardLayout from "@/app/dashboard/super-admin/page";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";
import { useState } from "react";
import { Shield, Plus, Search, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

type Admin = {
  id: number;
  name: string;
  email: string;
  company: string;
  role: "Master Admin" | "Sub Admin";
  status: "Active" | "Inactive";
  createdAt: string;
};

const demoAdmins: Admin[] = [
  {
    id: 1,
    name: "John Admin",
    email: "john.admin@superiorproroofs.com",
    company: "Superior Pro Roofing Systems",
    role: "Master Admin",
    status: "Active",
    createdAt: "2025-01-10",
  },
  {
    id: 2,
    name: "Sarah Manager",
    email: "sarah.manager@roofingco.com",
    company: "ABC Roofing Co",
    role: "Master Admin",
    status: "Active",
    createdAt: "2025-01-08",
  },
  {
    id: 3,
    name: "Mike Assistant",
    email: "mike.assistant@superiorproroofs.com",
    company: "Superior Pro Roofing Systems",
    role: "Sub Admin",
    status: "Active",
    createdAt: "2025-01-12",
  },
  {
    id: 4,
    name: "Emily Support",
    email: "emily.support@roofingco.com",
    company: "ABC Roofing Co",
    role: "Sub Admin",
    status: "Inactive",
    createdAt: "2024-12-20",
  },
];

export default function SuperAdminAdminsPage() {
  useProtectedRoute();
  const [searchTerm, setSearchTerm] = useState("");
  const [admins, setAdmins] = useState<Admin[]>(demoAdmins);

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleStatus = (id: number) => {
    setAdmins((prev) =>
      prev.map((admin) =>
        admin.id === id
          ? { ...admin, status: admin.status === "Active" ? "Inactive" : "Active" }
          : admin
      )
    );
  };

  return (
    <SuperAdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="text-blue-600" size={32} />
              Admins Management
            </h1>
            <p className="text-gray-600 mt-1">Manage all admin accounts and permissions</p>
          </div>
          <Link
            href="/super-admin/admins/create"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            <Plus size={20} />
            Create New Admin
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search admins by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Total Admins</p>
            <p className="text-2xl font-bold text-gray-900">{admins.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {admins.filter((a) => a.status === "Active").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Master Admins</p>
            <p className="text-2xl font-bold text-blue-600">
              {admins.filter((a) => a.role === "Master Admin").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Sub Admins</p>
            <p className="text-2xl font-bold text-purple-600">
              {admins.filter((a) => a.role === "Sub Admin").length}
            </p>
          </div>
        </div>

        {/* Admins Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{admin.name}</p>
                        <p className="text-sm text-gray-500">{admin.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{admin.company}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          admin.role === "Master Admin"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {admin.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(admin.id)}
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full transition ${
                          admin.status === "Active"
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                      >
                        {admin.status === "Active" ? (
                          <CheckCircle className="mr-1" size={14} />
                        ) : (
                          <XCircle className="mr-1" size={14} />
                        )}
                        {admin.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {admin.createdAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Edit size={18} />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SuperAdminDashboardLayout>
  );
}
