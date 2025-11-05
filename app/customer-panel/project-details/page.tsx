"use client";

import React, { useEffect, useState } from "react";
import { getUserProjectsAPI } from "@/services/auth";
import CustomerDashboardLayout from "@/app/dashboard/customer/page";
import { Search, Eye } from "lucide-react";
import router from "next/router";

interface Project {
  _id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  mobile_number: string;
  roof_type: string;
  property_type: string;
  address: {
    street: string;
    city?: string;
    state?: string;
    country?: string;
    zip_code?: string;
  };
  createdAt: string;
}

export default function ProjectDetailsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roofFilter, setRoofFilter] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getUserProjectsAPI();
        const dataArray = Array.isArray(response.data) ? response.data : [];
        setProjects(dataArray);
        setFilteredProjects(dataArray);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        alert("Failed to load projects. Try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.mobile_number.includes(searchTerm)
      );
    }

    if (roofFilter) {
      filtered = filtered.filter((p) => p.roof_type === roofFilter);
    }

    if (propertyFilter) {
      filtered = filtered.filter((p) => p.property_type === propertyFilter);
    }

    setFilteredProjects(filtered);
  }, [searchTerm, roofFilter, propertyFilter, projects]);

  if (loading) {
    return (
      <CustomerDashboardLayout>
        <div className="min-h-screen flex justify-center items-center">
          <p className="text-gray-500 text-lg">Loading projects...</p>
        </div>
      </CustomerDashboardLayout>
    );
  }

  if (!projects.length) {
    return (
      <CustomerDashboardLayout>
        <div className="min-h-screen flex justify-center items-center">
          <p className="text-gray-500 text-lg">No projects found.</p>
        </div>
      </CustomerDashboardLayout>
    );
  }

  const roofTypes = Array.from(new Set(projects.map((p) => p.roof_type)));
  const propertyTypes = Array.from(
    new Set(projects.map((p) => p.property_type))
  );

  return (
    <CustomerDashboardLayout>
      <main className="min-h-screen px-4 md:px-8 py-10 bg-gray-100">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Projects</h1>

        {/* Filters */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center flex-1 max-w-md">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 placeholder-gray-400"
            />
          </div>

          <select
            value={roofFilter}
            onChange={(e) => setRoofFilter(e.target.value)}
            className="border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
          >
            <option value="">All Roof Types</option>
            {roofTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            className="border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
          >
            <option value="">All Property Types</option>
            {propertyTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white shadow-md rounded-xl border border-gray-300 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">My Projects</h2>
            <p className="text-sm text-gray-500">
              {filteredProjects.length} total project(s)
            </p>
          </div>

          <div className="table-responsive overflow-x-auto overflow-y-auto max-h-[500px]">
            <table className="min-w-full table-auto text-sm md:text-base border-collapse">
              <thead className="bg-gray-100 border-b border-gray-300 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider">
                    Roof Type
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider">
                    Property Type
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((p) => (
                    <tr
                      key={p._id}
                      className="hover:bg-gray-50 transition-all duration-200"
                    >
                      <td className="px-6 py-4 text-gray-800 font-medium whitespace-nowrap">
                        {p.first_name} {p.middle_name || ""} {p.last_name}
                      </td>
                      <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                        {p.email}
                      </td>
                      <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                        {p.mobile_number}
                      </td>
                      <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                        {p.roof_type}
                      </td>
                      <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                        {p.property_type}
                      </td>
                      <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                        {p.address?.street || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap flex justify-center">
                        <button
                          onClick={() =>
                            router.push(`/customer-panel/map-view/${p._id}`)
                          }
                          className="p-2 rounded-full hover:bg-blue-100 transition"
                          title="View on Map"
                        >
                          <Eye className="w-5 h-5 text-blue-500 hover:text-blue-700" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-6 text-gray-500 italic"
                    >
                      No projects found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 text-right text-sm text-gray-500">
            Showing {filteredProjects.length} project(s)
          </div>
        </div>
      </main>
    </CustomerDashboardLayout>
  );
}
