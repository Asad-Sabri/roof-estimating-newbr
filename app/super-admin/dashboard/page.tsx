"use client";

import PlatformLayout from "@/components/layout/PlatformLayout";
import {
  Shield,
  Building2,
  ArrowRight,
  Settings,
  Activity,
  Eye,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";
import { usePlatformAccess } from "@/lib/auth/usePlatformAccess";
import { platformBaseForRole } from "@/lib/routes/portalPaths";

export default function PlatformDashboardPage() {
  useProtectedRoute();
  const {
    role,
    isPlatformSuperAdmin,
    isReadOnlyPlatformAdmin,
    canManagePlatformAdmins,
    canEditPlatformSettings,
    canCreateSubscribers,
    canDeleteSubscribers,
    canEditSubscribers,
  } = usePlatformAccess();

  const base = platformBaseForRole(role);

  const statsSuper = [
    {
      name: "Platform admins",
      value: "—",
      icon: Shield,
      color: "from-blue-600 to-blue-700",
      link: `${base}/admins`,
    },
    {
      name: "Active subscribers",
      value: "—",
      icon: Building2,
      color: "from-purple-600 to-purple-700",
      link: `${base}/companies`,
    },
    {
      name: "Platform settings",
      value: "Configure",
      icon: Settings,
      color: "from-slate-600 to-slate-800",
      link: `${base}/settings`,
    },
  ];

  const statsPlatformAdmin = [
    {
      name: "Subscribers",
      value: "—",
      icon: Building2,
      color: "from-purple-600 to-purple-700",
      link: `${base}/companies`,
    },
    {
      name: "Admins (directory)",
      value: "View",
      icon: Eye,
      color: "from-indigo-600 to-indigo-800",
      link: `${base}/admins`,
    },
  ];

  const stats = isPlatformSuperAdmin ? statsSuper : statsPlatformAdmin;

  const activitiesSuper = [
    {
      id: 1,
      type: "admin",
      user: "Full access",
      action: "Manage subscribers, platform admins, and system settings from the sidebar.",
      time: "—",
    },
    {
      id: 2,
      type: "company",
      user: "aiROOFS.pro",
      action: "End-customer data stays in subscriber workspaces — not on this platform console.",
      time: "—",
    },
  ];

  const activitiesLimited = [
    {
      id: 1,
      type: "admin",
      user: "Limited access",
      action:
        "You can view platform settings and the admins list. Edit subscribers but you cannot add/delete subscribers or manage admin accounts.",
      time: "—",
    },
  ];

  const activities = isPlatformSuperAdmin ? activitiesSuper : activitiesLimited;

  return (
    <PlatformLayout>
      <div className="space-y-8 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between text-white p-6 rounded-2xl shadow-md bg-red-900">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {isPlatformSuperAdmin ? "Platform Super Admin" : "Platform Admin"}
            </h1>
            <p className="text-sm text-white opacity-90 mt-1 max-w-xl">
              {isPlatformSuperAdmin
                ? "Full control: subscribers, platform admins, settings, and reports."
                : "Access follows permissions set by Platform Super Admin."}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
            <Link
              href={`${base}/companies`}
              className="flex items-center justify-center gap-2 bg-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition text-slate-900"
            >
              Subscribers <ArrowRight className="h-4 w-4" />
            </Link>
            {isPlatformSuperAdmin && (
              <Link
                href={`${base}/admins`}
                className="flex items-center justify-center gap-2 bg-sky-600 font-semibold px-4 py-2 rounded-lg shadow hover:bg-sky-500 transition text-white"
              >
                Admin management <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        {isReadOnlyPlatformAdmin && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <strong className="font-semibold">Limited access:</strong> your role only has read / report permissions.
            Ask a Platform Super Admin to assign companies.* or admins.* as needed.
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.name} href={stat.link}>
                <div className="group bg-white rounded-xl shadow-lg p-6 flex items-center gap-5 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer relative overflow-hidden">
                  <div
                    className={`p-4 rounded-xl bg-gradient-to-r ${stat.color} text-white shadow-md`}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <ArrowRight className="absolute right-4 text-gray-400 group-hover:text-gray-600 transition" />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-slate-700" />
            {isPlatformSuperAdmin ? "Activity" : "What you can do"}
          </h2>
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      activity.type === "admin" ? "bg-blue-100" : "bg-purple-100"
                    }`}
                  >
                    {activity.type === "admin" ? (
                      <Shield className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Building2 className="h-4 w-4 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Quick actions</h2>
            <div className="space-y-3">
              {canManagePlatformAdmins && (
                <Link
                  href={`${base}/admins`}
                  className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition"
                >
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Create / manage platform admins</span>
                </Link>
              )}
              {!canManagePlatformAdmins && !isPlatformSuperAdmin && (
                <Link
                  href={`${base}/admins`}
                  className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition"
                >
                  <Eye className="h-5 w-5 text-indigo-700" />
                  <span className="font-medium">View admins directory</span>
                </Link>
              )}
              <Link
                href={`${base}/companies`}
                className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-100 rounded-lg hover:bg-purple-100 transition"
              >
                <Building2 className="h-5 w-5 text-purple-600" />
                <span className="font-medium">
                  {canCreateSubscribers || canEditSubscribers || canDeleteSubscribers
                    ? "Manage subscribers"
                    : "View subscribers"}
                </span>
              </Link>
              {canEditPlatformSettings && (
                <Link
                  href={`${base}/settings`}
                  className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100 transition"
                >
                  <Settings className="h-5 w-5 text-slate-700" />
                  <span className="font-medium">Platform settings</span>
                </Link>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-slate-600" />
              Scope
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {isPlatformSuperAdmin ? (
                <>
                  You have full platform access: create and remove subscribers and platform admins,
                  change platform-wide settings, and use platform reports when available.
                </>
              ) : (
                <>
                  Your actions follow the permissions on your account (e.g. companies.* for
                  subscribers, admins.* for the admins area — system settings are only for Platform
                  Super Admin).
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </PlatformLayout>
  );
}
