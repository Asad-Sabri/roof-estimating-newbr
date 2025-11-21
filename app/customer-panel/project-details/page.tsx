"use client";

import React, { useEffect, useState } from "react";
import { getUserProjectsAPI } from "@/services/auth";
import CustomerDashboardLayout from "@/app/dashboard/customer/page";
import { Search, Eye, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

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
    lat?: number;
    lng?: number;
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
  const router = useRouter();
  // PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await getUserProjectsAPI();
      const dataArray = Array.isArray(response.data) ? response.data : [];
      setProjects(dataArray);
      setFilteredProjects(dataArray);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      toast.error("Failed to load projects. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://88.99.241.139:5000/api/roof-estimate-projects/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success === true) {
        toast.success(data.message || "Project deleted successfully!");

        // ✅ Runtime state update without full fetch
        const updatedProjects = projects.filter((p) => p._id !== id);
        setProjects(updatedProjects);

        const updatedFiltered = filteredProjects.filter((p) => p._id !== id);
        setFilteredProjects(updatedFiltered);

        // ✅ Pagination adjust
        const newTotalPages = Math.ceil(updatedFiltered.length / itemsPerPage);
        if (currentPage > newTotalPages)
          setCurrentPage(newTotalPages > 0 ? newTotalPages : 1);
      } else {
        toast.error(data.message || "Delete failed");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("Something went wrong");
    }
  };

  // Filtering useEffect
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

    if (roofFilter)
      filtered = filtered.filter((p) => p.roof_type === roofFilter);
    if (propertyFilter)
      filtered = filtered.filter((p) => p.property_type === propertyFilter);

    setFilteredProjects(filtered);
    setCurrentPage(1);
  }, [searchTerm, roofFilter, propertyFilter, projects]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const paginatedData = filteredProjects.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  if (loading) {
    return (
      <CustomerDashboardLayout>
        <div className="min-h-screen flex justify-center items-center">
          <p className="text-gray-500 text-lg">Loading projects...</p>
        </div>
      </CustomerDashboardLayout>
    );
  }

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
              className="w-full border border-gray-300 rounded-lg py-2 px-3"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow-md rounded-xl border border-gray-300 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">My Projects</h2>
          </div>

          {/* Scroll ONLY inside table */}
          <div className="overflow-x-auto max-h-[450px] overflow-y-auto">
            <table className="min-w-full table-auto text-sm border-collapse">
              <thead className="bg-gray-100 border-b sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left">ID</th>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Phone</th>
                  <th className="px-6 py-3 text-left">Roof</th>
                  <th className="px-6 py-3 text-left">Property</th>
                  <th className="px-6 py-3 text-left">Address</th>
                  <th className="px-6 py-3 text-left">Created</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((p, index) => (
                    <tr
                      key={p._id}
                      className="hover:bg-gray-50 border-b transition"
                    >
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4">
                        {p.first_name} {p.middle_name || ""} {p.last_name}
                      </td>
                      <td className="px-6 py-4">{p.email}</td>
                      <td className="px-6 py-4">{p.mobile_number}</td>
                      <td className="px-6 py-4">{p.roof_type}</td>
                      <td className="px-6 py-4">{p.property_type}</td>

                      <td className="px-6 py-4">{p.address?.street || "-"}</td>

                      <td className="px-6 py-4">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 text-center whitespace-nowrap flex justify-center gap-4">
                        {/* VIEW BUTTON */}
                        <button
                          onClick={() => {
                            const addr = {
                              lat: p.address?.lat || 31.5204, // fallback Lahore
                              lng: p.address?.lng || 74.3587,
                            };
                            localStorage.setItem(
                              "projectAddress",
                              JSON.stringify(addr)
                            );
                            router.push("/property-map"); // map screen pe redirect
                          }}
                          className="p-2 rounded-full hover:bg-blue-100 transition"
                          title="View on Map"
                        >
                          <Eye className="w-5 h-5 text-blue-500" />
                        </button>

                        {/* DELETE BUTTON */}
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="p-2 rounded-full hover:bg-red-100 transition"
                          title="Delete Project"
                        >
                          <Trash2 className="w-5 h-5 text-red-500" />
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

          {/* PAGINATION */}
          <div className="px-6 py-4 flex justify-center gap-3 bg-gray-50 border-t">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>

            <span className="px-4 py-2">
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </CustomerDashboardLayout>
  );
}
