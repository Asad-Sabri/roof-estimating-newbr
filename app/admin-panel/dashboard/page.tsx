"use client";

import SubscriberLayout from "@/components/layout/SubscriberLayout";
import {
  Users,
  FileText,
  ClipboardPlus,
  ArrowRight,
  FolderOpen,
  ClipboardCheck,
} from "lucide-react";
import Link from "next/link";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";
import { useSubscriberAccess } from "@/lib/auth/useSubscriberAccess";
import { subscriberBaseForRole } from "@/lib/routes/portalPaths";

const activities = [
  { id: 1, user: "Workspace", action: "Connect your APIs to show live counts and activity here.", time: "—" },
];

export default function AdminDashboardPage() {
  useProtectedRoute();
  const { role: subscriberRole } = useSubscriberAccess();
  const base = subscriberBaseForRole(subscriberRole);
  const stats = [
    {
      name: "Customers",
      value: "—",
      icon: Users,
      color: "from-red-600 to-red-700",
      link: `${base}/customers`,
    },
    {
      name: "Projects",
      value: "—",
      icon: FolderOpen,
      color: "from-emerald-600 to-teal-700",
      link: `${base}/project-details`,
    },
    {
      name: "Estimates",
      value: "—",
      icon: FileText,
      color: "from-violet-600 to-purple-700",
      link: `${base}/estimates`,
    },
    {
      name: "Preliminary estimates",
      value: "—",
      icon: ClipboardCheck,
      color: "from-amber-600 to-orange-600",
      link: `${base}/preliminary-estimates`,
    },
  ];
  return (
    <SubscriberLayout>
      <div className="space-y-10 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between text-white p-6 rounded-2xl shadow-md" style={{ backgroundColor: "#8b0e0f" }}>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Subscriber dashboard</h1>
            <p className="text-sm text-white opacity-90 mt-1">
              Customers, projects, and estimates for your organization
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              href={`${base}/customers`}
              className="flex items-center gap-2 bg-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition"
              style={{ color: "#8b0e0f" }}
            >
              Go to customers <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* 🔹 Stats Section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.name} href={stat.link}>
                <div className="group bg-white rounded-xl shadow-lg p-6 flex items-center gap-5 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer relative overflow-hidden">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white shadow-md`}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{stat.name}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <ArrowRight className="absolute right-4 text-gray-400 group-hover:text-gray-600 transition" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* 🔹 Recent Activities */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            Activity
          </h2>
          <ul className="divide-y divide-gray-200">
            {activities.map((activity) => (
              <li
                key={activity.id}
                className="py-4 flex justify-between items-center hover:bg-gray-50 px-3 rounded-lg transition"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {activity.user}
                  </p>
                  <p className="text-sm text-gray-500">{activity.action}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Quick links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Link
              href={`${base}/customers`}
              className="flex flex-col items-center justify-center gap-2 bg-red-50 border border-red-100 rounded-xl p-4 hover:bg-red-100 transition"
            >
              <Users className="h-6 w-6 text-red-700" />
              <span className="text-sm font-medium">Customers</span>
            </Link>
            <Link
              href={`${base}/project-details`}
              className="flex flex-col items-center justify-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl p-4 hover:bg-emerald-100 transition"
            >
              <FolderOpen className="h-6 w-6 text-emerald-600" />
              <span className="text-sm font-medium">Projects</span>
            </Link>
            <Link
              href={`${base}/request-estimate`}
              className="flex flex-col items-center justify-center gap-2 bg-rose-50 border border-rose-100 rounded-xl p-4 hover:bg-rose-100 transition"
            >
              <ClipboardPlus className="h-6 w-6 text-rose-700" />
              <span className="text-sm font-medium">Request estimates</span>
            </Link>
          </div>
        </div>
      </div>
    </SubscriberLayout>
  );
}
