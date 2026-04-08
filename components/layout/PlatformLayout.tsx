"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import {
  Menu,
  LogOut,
  LayoutDashboard,
  Shield,
  Building2,
  Settings,
  Users,
  BarChart3,
  FileText,
} from "lucide-react";
import { handleLogout } from "@/utils/authHelper";
import { useQueryClient } from "@tanstack/react-query";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/slices/authSlice";
import SessionGate from "@/components/auth/SessionGate";
import { usePlatformAccess } from "@/lib/auth/usePlatformAccess";
import { canShowPlatformNavPath } from "@/lib/auth/platformPermissions";
import { getStoredCanonicalRole } from "@/lib/auth/roles";
import { syncProfileToStorage } from "@/services/auth";
import { platformBaseForRole } from "@/lib/routes/portalPaths";

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  note?: string;
};

/** Paths are relative; `platformBaseForRole` prefixes public URL. */
const ALL_PLATFORM_NAV: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Companies", href: "/companies", icon: Building2 },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Admins", href: "/admins", icon: Shield },
  { name: "Projects", href: "/project-details", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isChecking } = useProtectedRoute();
  const {
    role,
    isPlatformSuperAdmin,
    isPlatformAdminOnly,
    isReadOnlyPlatformAdmin,
  } = usePlatformAccess();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  /** Bumps when profile is re-fetched so permission-based nav re-reads localStorage. */
  const [profileSyncVersion, setProfileSyncVersion] = useState(0);
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const userProfile: Record<string, unknown> =
    (queryClient.getQueryData(["profile"]) as Record<string, unknown>) || {};

  /** Refresh stored permissions after login / when opening platform shell (fixes missing merged permissions). */
  useEffect(() => {
    const r = getStoredCanonicalRole();
    if (r !== "PLATFORM_ADMIN") return;
    let cancelled = false;
    syncProfileToStorage()
      .then(() => {
        if (!cancelled) setProfileSyncVersion((v) => v + 1);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const platformNavItems = useMemo(() => {
    const base = platformBaseForRole(role);
    return ALL_PLATFORM_NAV.map((item) => ({
      ...item,
      href: `${base}${item.href}`,
    })).filter((item) => (role ? canShowPlatformNavPath(role, item.href) : true));
  }, [role, profileSyncVersion]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSidebarOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogoutFunction = () => {
    dispatch(logout());
    handleLogout();
    setSidebarOpen(false);
    queryClient.clear();
  };

  const firstName = (userProfile?.first_name as string) ?? "";
  const lastName = (userProfile?.last_name as string) ?? "";

  return (
    <SessionGate isChecking={isChecking} isAuthenticated={isAuthenticated}>
      <div className="flex bg-gray-100 text-gray-900 min-h-screen">
        <aside
          className={`fixed z-30 inset-y-0 left-0 transform bg-white shadow-lg w-64 transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
          aria-label="Platform sidebar"
        >
          <div className="min-h-[72px] flex flex-col items-center justify-center border-b bg-white px-3 py-4">
            <div className="text-center">
              <div className="text-xl font-bold tracking-tight text-gray-900">
                aiROOFS<span className="text-sky-500">.pro</span>
              </div>
              <p className="text-xs font-medium text-gray-600 mt-1">
                {isPlatformSuperAdmin
                  ? "Platform Super Admin"
                  : isPlatformAdminOnly
                    ? "Platform Admin"
                    : "Platform"}
              </p>
              {/* <p className="text-[10px] text-gray-500 mt-1">
                Level 1 — aiROOFS.pro
              </p> */}
            </div>
          </div>

          {isReadOnlyPlatformAdmin && !isPlatformSuperAdmin && (
            <div className="mx-3 mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] text-amber-900 leading-snug">
              Access follows permissions set by Platform Super Admin.
            </div>
          )}

          <nav className="p-4 space-y-1 pb-24">
            {platformNavItems.map((item) => {
              const isActive = pathname?.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={`${item.name}-${item.href}`}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex flex-col gap-0.5 px-4 py-2 rounded-lg transition-colors duration-200
                  ${isActive ? "text-white shadow-md" : "text-gray-700 hover:bg-gray-100"}`}
                  style={isActive ? { backgroundColor: "#8b0e0f" } : {}}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{item.name}</span>
                  </span>
                  {item.note && (
                    <span
                      className={`text-[10px] pl-8 ${
                        isActive ? "text-red-100" : "text-gray-500"
                      }`}
                    >
                      {item.note}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 w-full p-4 border-t bg-white">
            <button
              type="button"
              onClick={handleLogoutFunction}
              className="flex cursor-pointer items-center gap-2 w-full px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
        )}

        <div
          className="flex-1 flex flex-col lg:ml-64 bg-gray-50"
          style={{ minHeight: "100vh" }}
        >
          <header className="h-16 bg-white shadow flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* <span className="hidden md:inline text-xs text-gray-500 truncate">
                Level 1 — Platform
              </span> */}
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Open sidebar menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

            <div className="flex items-center space-x-3 sm:space-x-4">
              <span className="hidden sm:inline text-sm text-gray-600 max-w-[200px] truncate text-right">
                {firstName || lastName
                  ? `${firstName} ${lastName}`.trim()
                  : isPlatformSuperAdmin
                    ? "Platform Super Admin"
                    : isPlatformAdminOnly
                      ? "Platform Admin"
                      : "Platform"}
              </span>
              {userProfile?.profile_image ? (
                <Image
                  src={String(userProfile.profile_image)}
                  alt=""
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full border shadow-sm object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-10 h-10 rounded-full border shadow-sm bg-slate-800 flex items-center justify-center">
                  <Shield className="text-white" size={20} />
                </div>
              )}
            </div>
          </header>

          <main
            className="flex-1 p-4 md:p-6 bg-gray-50"
            style={{ minHeight: "calc(100vh - 4rem)" }}
          >
            {children}
          </main>
        </div>
      </div>
    </SessionGate>
  );
}
