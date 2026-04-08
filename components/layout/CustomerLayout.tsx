"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Menu,
  LogOut,
  LayoutDashboard,
  FolderOpen,
  FileText,
  ClipboardList,
  Building2,
} from "lucide-react";
import { handleLogout } from "@/utils/authHelper";
import { useQueryClient } from "@tanstack/react-query";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/slices/authSlice";
import { STORAGE_PROFILE } from "@/lib/auth/roles";
import SessionGate from "@/components/auth/SessionGate";
import { getCompanyForCustomerAPI } from "@/services/companyAPI";
import { CUSTOMER_BASE } from "@/lib/routes/portalPaths";

const CUSTOMER_NAV_REL = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Your contractor", href: "/subscriber-profile", icon: Building2 },
  { name: "Request estimate", href: "/request-estimate", icon: ClipboardList },
  { name: "Projects", href: "/project-details", icon: FolderOpen },
  { name: "Estimates", href: "/view-all-estimate", icon: FileText },
];

function parseProfile(): Record<string, unknown> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_PROFILE);
    if (!raw) return null;
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isChecking } = useProtectedRoute();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [branding, setBranding] = useState<{ logo?: string; name?: string }>({});
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const navItems = useMemo(
    () =>
      CUSTOMER_NAV_REL.map((item) => ({
        ...item,
        href: `${CUSTOMER_BASE}${item.href}`,
      })),
    []
  );

  const userProfile: any = queryClient.getQueryData(["profile"]) || {};

  useEffect(() => {
    const p = parseProfile();
    const logo =
      (p?.company_logo as string) ||
      (p?.logo as string) ||
      (p?.subscriber_logo as string) ||
      undefined;
    const name =
      (p?.company_name as string) ||
      (p?.subscriber_name as string) ||
      undefined;
    setBranding({ logo, name });

    getCompanyForCustomerAPI()
      .then((res: unknown) => {
        const r = res as Record<string, unknown> | null;
        const inner = (r?.data as Record<string, unknown>) ?? r ?? {};
        const nextLogo =
          (inner.logoUrl as string) ||
          (inner.logo as string) ||
          (inner.company_logo as string) ||
          logo;
        const nextName =
          (inner.companyName as string) ||
          (inner.company_name as string) ||
          name;
        if (nextLogo || nextName) {
          setBranding((prev) => ({
            logo: nextLogo || prev.logo,
            name: nextName || prev.name,
          }));
        }
      })
      .catch(() => {
        /* keep profile-based branding */
      });
  }, []);

  const handleLogoutFunction = () => {
    dispatch(logout());
    handleLogout();
    setSidebarOpen(false);
  };

  const showLogo = Boolean(branding.logo);
  const headerLabel = branding.name || "My projects";

  return (
    <SessionGate isChecking={isChecking} isAuthenticated={isAuthenticated}>
    <div className="flex bg-gray-100 text-gray-900 min-h-screen">
      <aside
        className={`fixed z-30 inset-y-0 left-0 transform bg-white shadow-lg w-64 transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        aria-label="Customer sidebar"
      >
        <div className="min-h-[72px] flex flex-col items-center justify-center border-b bg-white px-3 py-4">
          {showLogo ? (
            <Image
              src={branding.logo as string}
              alt={headerLabel}
              width={180}
              height={56}
              className="object-contain max-h-[48px] w-auto"
              unoptimized
            />
          ) : (
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900">{headerLabel}</p>
              <p className="text-[10px] text-gray-500 mt-1">
                Customer portal (via your contractor) · aiROOFS
              </p>
            </div>
          )}
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200
                  ${isActive ? "text-white shadow-md" : "text-gray-700 hover:bg-gray-100"}`}
                style={isActive ? { backgroundColor: "#8b0e0f" } : {}}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t">
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

      <div className="flex-1 flex flex-col lg:ml-64 bg-gray-50" style={{ minHeight: "100vh" }}>
        <header className="h-16 bg-white shadow flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="hidden md:inline text-xs text-gray-500 truncate">
              Level 3 — Customer
            </span>
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
            <div className="flex flex-col text-right">
              <span className="text-sm text-gray-600">
                {userProfile?.first_name ?? ""} {userProfile?.last_name ?? ""}
              </span>
            </div>
            {userProfile?.profile_image ? (
              <Image
                src={userProfile.profile_image}
                alt=""
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-full border shadow-sm bg-blue-500 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {userProfile?.first_name?.charAt(0)}
                  {userProfile?.last_name?.charAt(0)}
                </span>
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
