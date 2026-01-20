"use client";

import SuperAdminDashboardLayout from "@/app/dashboard/super-admin/page";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";
import { useState } from "react";
import { Building2, Search, Edit, Users, Shield } from "lucide-react";

type Company = {
  id: number;
  name: string;
  domain: string;
  licenseNumber: string;
  masterAdmin: string;
  totalAdmins: number;
  totalCustomers: number;
  status: "Active" | "Inactive";
  createdAt: string;
};

const demoCompanies: Company[] = [
  {
    id: 1,
    name: "Superior Pro Roofing Systems",
    domain: "superiorproroofs.com",
    licenseNumber: "LIC-2024-001",
    masterAdmin: "John Admin",
    totalAdmins: 3,
    totalCustomers: 456,
    status: "Active",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "ABC Roofing Co",
    domain: "abcroofingco.com",
    licenseNumber: "LIC-2024-002",
    masterAdmin: "Sarah Manager",
    totalAdmins: 2,
    totalCustomers: 234,
    status: "Active",
    createdAt: "2024-02-10",
  },
  {
    id: 3,
    name: "Elite Roofing Solutions",
    domain: "eliteroofing.com",
    licenseNumber: "LIC-2024-003",
    masterAdmin: "Mike Director",
    totalAdmins: 4,
    totalCustomers: 567,
    status: "Active",
    createdAt: "2024-03-05",
  },
];

export default function SuperAdminCompaniesPage() {
  useProtectedRoute();
  const [searchTerm, setSearchTerm] = useState("");
  const [companies] = useState<Company[]>(demoCompanies);

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SuperAdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="text-purple-600" size={32} />
            Companies Management
          </h1>
          <p className="text-gray-600 mt-1">Manage all licensed companies and domains</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search companies by name, domain, or license..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Total Companies</p>
            <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {companies.filter((c) => c.status === "Active").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Total Admins</p>
            <p className="text-2xl font-bold text-blue-600">
              {companies.reduce((sum, c) => sum + c.totalAdmins, 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Total Customers</p>
            <p className="text-2xl font-bold text-purple-600">
              {companies.reduce((sum, c) => sum + c.totalCustomers, 0)}
            </p>
          </div>
        </div>

        {/* Companies Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    License
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Master Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{company.name}</p>
                        <p className="text-sm text-gray-500">{company.domain}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{company.licenseNumber}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Shield className="text-blue-500" size={16} />
                        <p className="text-sm text-gray-900">{company.masterAdmin}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Shield className="text-blue-400" size={14} />
                          <span className="text-sm text-gray-600">{company.totalAdmins}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="text-green-400" size={14} />
                          <span className="text-sm text-gray-600">{company.totalCustomers}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          company.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {company.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Edit size={18} />
                      </button>
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
