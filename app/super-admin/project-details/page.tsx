"use client";

import React, { useEffect, useState } from "react";
import { getAllProjectsAPI, deleteUserProjectsAPI } from "@/services/auth";
import SuperAdminDashboardLayout from "@/app/dashboard/super-admin/page";
import { Search, Eye, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";

const geocodingClient = mbxGeocoding({
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "",
});

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

export default function SuperAdminProjectDetailsPage() {
  useProtectedRoute();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roofFilter, setRoofFilter] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("");
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await getAllProjectsAPI();
      const dataArray = Array.isArray(response) ? response : (Array.isArray(response?.data) ? response.data : []);
      setProjects(dataArray);
      setFilteredProjects(dataArray);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      toast.error("Failed to load projects. Try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteUserProjectsAPI(id);
      toast.success("Project deleted successfully.");
      const updatedProjects = projects.filter((p) => p._id !== id);
      const updatedFiltered = filteredProjects.filter((p) => p._id !== id);
      setProjects(updatedProjects);
      setFilteredProjects(updatedFiltered);
      const newTotalPages = Math.ceil(updatedFiltered.length / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) setCurrentPage(newTotalPages);
      else if (updatedFiltered.length === 0 && currentPage > 1) setCurrentPage(1);
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error(err?.response?.data?.message || "Delete failed. Please try again.");
    }
  };

  useEffect(() => {
    let filtered = projects;
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.mobile_number?.includes(searchTerm)
      );
    }
    if (roofFilter) filtered = filtered.filter((p) => p.roof_type === roofFilter);
    if (propertyFilter) filtered = filtered.filter((p) => p.property_type === propertyFilter);
    setFilteredProjects(filtered);
    setCurrentPage(1);
  }, [searchTerm, roofFilter, propertyFilter, projects]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const paginatedData = filteredProjects.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  if (loading) {
    return (
      <SuperAdminDashboardLayout>
        <div className="min-h-[40vh] flex justify-center items-center">
          <p className="text-gray-500">Loading projects...</p>
        </div>
      </SuperAdminDashboardLayout>
    );
  }

  return (
    <SuperAdminDashboardLayout>
      <main className="min-h-screen px-4 md:px-8 py-6 bg-gray-50">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">All Estimate Projects</h1>
          <span className="text-sm text-gray-500">{filteredProjects.length} project(s)</span>
        </header>

        <div className="bg-white shadow-lg rounded-xl p-6 mb-6 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center flex-1 max-w-md">
            <Search className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={roofFilter}
              onChange={(e) => setRoofFilter(e.target.value)}
              className="border border-gray-300 rounded-lg py-2 px-3 text-sm"
            >
              <option value="">All roof types</option>
              {[...new Set(projects.map((p) => p.roof_type).filter(Boolean))].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="border border-gray-300 rounded-lg py-2 px-3 text-sm"
            >
              <option value="">All property types</option>
              {[...new Set(projects.map((p) => p.property_type).filter(Boolean))].map((pt) => (
                <option key={pt} value={pt}>{pt}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center text-white rounded-t-xl" style={{ backgroundColor: "#8b0e0f" }}>
            <h2 className="text-lg font-semibold">Projects</h2>
          </div>

          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="min-w-full table-auto text-sm border-collapse">
              <thead className="bg-gray-100 border-b sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">#</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Phone</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Roof</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Property</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Address</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Created</th>
                  <th className="px-6 py-3 text-center font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((p, index) => (
                    <tr key={p._id} className="hover:bg-gray-50 border-b transition">
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4">
                        {p.first_name} {p.middle_name || ""} {p.last_name}
                      </td>
                      <td className="px-6 py-4">{p.email}</td>
                      <td className="px-6 py-4">{p.mobile_number}</td>
                      <td className="px-6 py-4">{p.roof_type || "-"}</td>
                      <td className="px-6 py-4">{p.property_type || "-"}</td>
                      <td className="px-6 py-4">{p.address?.street || "-"}</td>
                      <td className="px-6 py-4">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "-"}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={async () => {
                              try {
                                let lat = p.address?.lat;
                                let lng = p.address?.lng;
                                if (!lat || !lng) {
                                  const addressParts = [
                                    p.address?.street,
                                    p.address?.city,
                                    p.address?.state,
                                    p.address?.zip_code,
                                    p.address?.country,
                                  ].filter(Boolean);
                                  const addressString = addressParts.join(", ") || p.address?.street || "";
                                  if (addressString.trim()) {
                                    const geoRes = await geocodingClient.forwardGeocode({ query: addressString, limit: 1 }).send();
                                    if (geoRes.body.features?.[0]?.center?.length >= 2) {
                                      [lng, lat] = geoRes.body.features[0].center;
                                    }
                                  }
                                  if (!lat || !lng) { lat = 31.5204; lng = 74.3587; }
                                }
                                const addr = { lat: lat!, lng: lng!, address: p.address?.street || "" };
                                localStorage.setItem("projectAddress", JSON.stringify(addr));
                                localStorage.setItem("projectLocation", JSON.stringify({ lat: addr.lat, lng: addr.lng }));
                                router.push("/property-map");
                              } catch {
                                toast.error("Error fetching location.");
                              }
                            }}
                            className="p-2 rounded-lg hover:bg-blue-100 transition"
                            title="View on Map"
                          >
                            <Eye className="w-5 h-5 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="p-2 rounded-lg hover:bg-red-100 transition"
                            title="Delete Project"
                          >
                            <Trash2 className="w-5 h-5 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-gray-500">
                      No projects found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 flex justify-center gap-3 bg-gray-50 border-t">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-4 py-2 rounded-lg disabled:opacity-50 text-sm font-medium"
              style={{ backgroundColor: currentPage === 1 ? "#e5e7eb" : "#8b0e0f", color: currentPage === 1 ? "#6b7280" : "#fff" }}
            >
              Prev
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-4 py-2 rounded-lg disabled:opacity-50 text-sm font-medium"
              style={{ backgroundColor: currentPage === totalPages ? "#e5e7eb" : "#8b0e0f", color: currentPage === totalPages ? "#6b7280" : "#fff" }}
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </SuperAdminDashboardLayout>
  );
}
