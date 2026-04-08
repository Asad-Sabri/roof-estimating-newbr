"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";
import { CUSTOMER_BASE } from "@/lib/routes/portalPaths";
import {
  Briefcase,
  FileText,
  CreditCard,
  ClipboardList,
  PlayCircle,
  Eye,
  PlusCircle,
  FileSignature,
  TrendingUp,
  MapPin,
  DollarSign,
} from "lucide-react";
import CustomerLayout from "@/components/layout/CustomerLayout";
import { useQueryClient } from "@tanstack/react-query";
import { getUserInstantEstimatesAPI } from "@/services/instantEstimateAPI";

type JobStatus = "Pending" | "In Progress" | "Completed";
type ProposalStatus = "Pending" | "Signed" | "Declined";
type PaymentStatus = "Paid" | "Pending" | "Due";

interface Job {
  id: number;
  title: string;
  description: string;
  status: JobStatus;
  createdAt: string;
}

interface Proposal {
  id: number;
  title: string;
  status: ProposalStatus;
  createdAt: string;
}

interface Payment {
  id: string;
  amount: number;
  status: PaymentStatus;
  date: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isChecking } = useProtectedRoute(); // Protect this route
  const queryClient = useQueryClient();

  const [jobs] = useState<Job[]>([
    {
      id: 1,
      title: "Roof Replacement - Smith House",
      description: "Full roof removal and new shingle replacement.",
      status: "In Progress",
      createdAt: "2025-09-12",
    },
    {
      id: 2,
      title: "Leak Repair - Johnson Villa",
      description: "Local leak repair and flashing replacement.",
      status: "Pending",
      createdAt: "2025-09-10",
    },
    {
      id: 3,
      title: "Inspection - Green Cottage",
      description: "Full roof inspection and report.",
      status: "Completed",
      createdAt: "2025-09-05",
    },
  ]);

  const [proposals] = useState<Proposal[]>([
    {
      id: 201,
      title: "Proposal #201",
      status: "Pending",
      createdAt: "2025-09-11",
    },
    {
      id: 200,
      title: "Proposal #200",
      status: "Signed",
      createdAt: "2025-09-07",
    },
  ]);

  const [payments] = useState<Payment[]>([
    { id: "INV-501", amount: 2500, status: "Due", date: "2025-09-09" },
    { id: "INV-499", amount: 1200, status: "Paid", date: "2025-09-05" },
  ]);

  const [instantEstimatesFromAPI, setInstantEstimatesFromAPI] = useState<{
    data: any[];
    meta: { totalRecords: number } | null;
  }>({ data: [], meta: null });
  const [loadingInstantEstimates, setLoadingInstantEstimates] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || isChecking) return;
    setLoadingInstantEstimates(true);
    getUserInstantEstimatesAPI()
      .then((res: any) => {
        setInstantEstimatesFromAPI({
          data: res?.data ?? [],
          meta: res?.meta ?? null,
        });
      })
      .catch((err) => {
        console.error("Instant estimates fetch error:", err);
        setInstantEstimatesFromAPI({ data: [], meta: null });
      })
      .finally(() => setLoadingInstantEstimates(false));
  }, [isAuthenticated, isChecking]);

  const userProfile: any = queryClient.getQueryData(["profile"]) || {};
  const userRole = userProfile?.role || (typeof window !== "undefined" ? localStorage.getItem("loginRole") : null) || "customer";

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const statusColor = (status: JobStatus) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const proposalColor = (status: ProposalStatus) =>
    status === "Pending"
      ? "bg-yellow-100 text-yellow-800"
      : status === "Signed"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";

  const paymentColor = (status: string) =>
    status.toLowerCase() === "paid"
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";

  // Navigation helpers
  const openProposal = (id: number) => router.push(`${CUSTOMER_BASE}/proposal`);
  const openPayment = (id: string) => router.push(`${CUSTOMER_BASE}/payment`);
  const openJobProgress = (id: number) =>
    router.push(`${CUSTOMER_BASE}/job-progress`);
  const openRequestEstimate = () =>
    router.push(`${CUSTOMER_BASE}/request-estimate`);

  return (
    <CustomerLayout>
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
              <Briefcase className="text-blue-600" /> {userRole === "admin" ? "Admin Dashboard" : "Customer Dashboard"}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Overview of your jobs, proposals and payments
            </p>
          </motion.div>

          <motion.div
            className="flex md:flex-row flex-col items-start md:items-center gap-3"
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <button
              onClick={openRequestEstimate}
              className="inline-flex items-center cursor-pointer gap-1 xl:gap-2 text-white px-2 xl:px-4 py-2 rounded-lg shadow-md focus:outline-none focus:ring-2 transition-all"
              style={{ backgroundColor: "#8b0e0f" }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#6d0b0c"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#8b0e0f"}
            >
              <PlusCircle size={18} /> Request Estimate (Create Project)
            </button>

            <Link
              href={`${CUSTOMER_BASE}/estimating`}
              className="inline-flex items-center gap-1 text-gray-700 bg-gray-200 px-3 py-2 rounded-md hover:bg-gray-400"
            >
              <ClipboardList size={18} /> View All Estimates
            </Link>
          </motion.div>
        </header>

        {/* Overview Cards */}
        <motion.section
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Briefcase size={16} /> Total Jobs
            </div>
            <div className="mt-2 text-2xl font-semibold">{jobs.length}</div>
            <div className="mt-3 text-xs text-gray-400">
              All jobs in your account
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <PlayCircle size={16} /> Pending
            </div>
            <div className="mt-2 text-2xl font-semibold">
              {jobs.filter((j) => j.status === "Pending").length}
            </div>
            <div className="mt-3 text-xs text-gray-400">
              Awaiting scheduling or approval
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <PlayCircle size={16} /> In Progress
            </div>
            <div className="mt-2 text-2xl font-semibold">
              {jobs.filter((j) => j.status === "In Progress").length}
            </div>
            <div className="mt-3 text-xs text-gray-400">
              Crew currently working
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FileSignature size={16} /> Completed
            </div>
            <div className="mt-2 text-2xl font-semibold">
              {jobs.filter((j) => j.status === "Completed").length}
            </div>
            <div className="mt-3 text-xs text-gray-400">
              Jobs marked complete
            </div>
          </div>
        </motion.section>

        {/* Jobs Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Briefcase size={20} /> My Jobs
            </h2>
            <Link
              href={`${CUSTOMER_BASE}/job-progress`}
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              View all jobs
            </Link>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {jobs.map((job) => (
              <motion.article
                key={job.id}
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition flex flex-col justify-between"
                whileHover={{ scale: 1.02 }}
              >
                <div>
                  <h3 className=" text-sm md:text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Briefcase size={18} className="text-blue-600" />{" "}
                    {job.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-2">
                    {job.description}
                  </p>
                </div>

                <div className="mt-4 flex md:flex-row flex-col items-start md:items-center justify-between gap-4 md:gap-0">
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusColor(
                      job.status
                    )}`}
                  >
                    {job.status}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openJobProgress(job.id)}
                      className="flex items-center cursor-pointer gap-1 px-3 py-1 text-sm text-white rounded-md transition-all"
                      style={{ backgroundColor: "#8b0e0f" }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#6d0b0c"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#8b0e0f"}
                    >
                      <PlayCircle size={14} /> Track
                    </button>

                    <Link
                      href={`${CUSTOMER_BASE}/estimates`}
                      className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      <FileText size={14} /> Estimate
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </section>

        {/* Recent Proposals & Payments */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Proposals */}
          <motion.div
            className="bg-white rounded-2xl p-4 shadow-sm"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText size={18} /> Recent Proposals
              </h3>
              <Link
                href={`${CUSTOMER_BASE}/proposal`}
                className="text-sm text-blue-600 hover:underline"
              >
                All proposals
              </Link>
            </div>

            <div className="divide-y divide-gray-300">
              {proposals.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <div className="font-medium text-gray-900">{p.title}</div>
                    <div className="text-xs text-gray-500">{p.createdAt}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${proposalColor(
                        p.status
                      )}`}
                    >
                      {p.status}
                    </span>
                    <button
                      onClick={() => openProposal(p.id)}
                      className="flex items-center cursor-pointer gap-1 px-3 py-1 text-white rounded-md text-sm transition-all"
                      style={{ backgroundColor: "#8b0e0f" }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#6d0b0c"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#8b0e0f"}
                    >
                      <Eye size={14} /> View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Payments */}
          <motion.div
            className="bg-white rounded-2xl p-4 shadow-sm"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <CreditCard size={18} /> Recent Payments
              </h3>
              <Link
                href={`${CUSTOMER_BASE}/payments`}
                className="text-sm text-blue-600 hover:underline"
              >
                Payment history
              </Link>
            </div>

            <div className="divide-y divide-gray-300">
              {payments.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      ${inv.amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">{inv.date}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${paymentColor(
                        inv.status
                      )}`}
                    >
                      {inv.status}
                    </span>

                    <button
                      onClick={() => openPayment(inv.id)}
                      className="flex items-center cursor-pointer gap-1 px-3 py-1 text-white rounded-md text-sm transition-all"
                      style={{ backgroundColor: "#8b0e0f" }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#6d0b0c"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#8b0e0f"}
                    >
                      <CreditCard size={14} /> Pay / View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Instant Estimates – simple table, 5 rows, See all estimate → Measurements */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp size={20} /> Instant Estimates
            </h2>
            <Link
              href={`${CUSTOMER_BASE}/estimating`}
              className="inline-flex items-center justify-center gap-1 xl:gap-2 text-white px-3 xl:px-4 py-2 rounded-lg shadow-md focus:outline-none focus:ring-2 transition-all text-sm shrink-0 cursor-pointer"
              style={{ backgroundColor: "#8b0e0f" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#6d0b0c";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#8b0e0f";
              }}
            >
              <PlusCircle size={16} /> See all estimate
            </Link>
          </div>

          {loadingInstantEstimates ? (
            <motion.div
              className="bg-white rounded-2xl p-12 shadow-sm text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
              <p className="text-gray-500">Loading your instant estimates…</p>
            </motion.div>
          ) : (instantEstimatesFromAPI.data?.length ?? 0) === 0 ? (
            <motion.div
              className="bg-white rounded-2xl p-12 shadow-sm text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No estimates yet</p>
              <p className="text-gray-400 mb-6">
                Get your first instant estimate in just a few minutes
              </p>
              <Link
                href={`${CUSTOMER_BASE}/instant-estimate`}
                className="px-6 py-3 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 mx-auto w-fit cursor-pointer"
                style={{ backgroundColor: "#8b0e0f" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#6d0b0c")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#8b0e0f")}
              >
                <TrendingUp className="w-5 h-5" />
                Get Free Estimate Instantly
              </Link>
            </motion.div>
          ) : (
            <motion.div
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead style={{ backgroundColor: "#8b0e0f" }}>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Roof / Building
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(instantEstimatesFromAPI.data ?? []).slice(0, 5).map((est: any) => {
                      const addr = est.address || {};
                      const addressStr = [addr.street, addr.city, addr.state, addr.zip_code]
                        .filter(Boolean)
                        .join(", ") || "—";
                      return (
                        <tr key={est._id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 text-gray-900 font-medium max-w-[200px] truncate" title={addressStr}>
                            {addressStr}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            <span className="text-gray-700">{est.roof_material || "—"}</span>
                            {est.building_type && (
                              <span className="text-gray-500 text-xs ml-1">({est.building_type})</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                            {est.createdAt ? new Date(est.createdAt).toLocaleDateString() : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 pt-4">
          Need help?{" "}
          <a
            href="mailto:support@roofestimate.com"
            className="text-blue-600 hover:underline"
          >
            Contact support
          </a>
        </footer>
      </motion.div>
    </CustomerLayout>
  );
}
