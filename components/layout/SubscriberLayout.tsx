"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  FileText,
  CreditCard,
  Briefcase,
  ClipboardList,
  ClipboardCheck,
  Users,
  Settings,
  DollarSign,
  FolderOpen,
  ChevronDown,
  ChevronUp,
  Ruler,
  Building2,
  Shield,
} from "lucide-react";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";
import { handleLogout } from "@/utils/authHelper";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/slices/authSlice";
import { STORAGE_PROFILE, getPostLoginPath, getStoredCanonicalRole } from "@/lib/auth/roles";
import SessionGate from "@/components/auth/SessionGate";
import {
  useSubscriberAccess,
  dispatchSubscriberProfileSync,
} from "@/lib/auth/useSubscriberAccess";
import { canShowSubscriberNavItem, subscriberUserMayAccessPath } from "@/lib/auth/subscriberPermissions";
import { subscriberBaseForRole } from "@/lib/routes/portalPaths";
import { syncProfileToStorage } from "@/services/auth";

type NavRel = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Empty = always visible for non-super-admin (dashboard, profile). Else `tenant.*` codes. */
  codes: string[];
  /** Only in Subscriber Super Admin shell — e.g. tenant admin pages below Estimates. */
  superAdminOnly?: boolean;
};

/** Relative to subscriber shell base (`/subscriber-admin` or `/subscriber-super-admin`). */
const PRIMARY_NAV_REL: NavRel[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, codes: [] },
  { name: "Subscriber profile", href: "/subscriber-profile", icon: Building2, codes: [] },
  { name: "Customers", href: "/customers", icon: Users, codes: ["tenant.customers"] },
  { name: "Projects", href: "/project-details", icon: FolderOpen, codes: ["tenant.projects"] },
  { name: "Request Estimates", href: "/request-estimate", icon: ClipboardList, codes: ["tenant.estimates"] },
  { name: "Preliminary Estimates", href: "/preliminary-estimates", icon: ClipboardCheck, codes: ["tenant.estimates"] },
  { name: "Estimates", href: "/estimates", icon: FileText, codes: ["tenant.estimates"] },
  { name: "Subscriber admins", href: "/subscriber-admins", icon: Shield, codes: [], superAdminOnly: true },
  { name: "Company settings", href: "/company-settings", icon: Settings, codes: [], superAdminOnly: true },
];

const MORE_NAV_REL: NavRel[] = [
  { name: "Measurement Reports", href: "/measurement-reports", icon: Ruler, codes: ["tenant.reports"] },
  { name: "Proposals", href: "/proposals", icon: FileText, codes: ["tenant.proposals"] },
  { name: "Payments", href: "/payments", icon: CreditCard, codes: ["tenant.payments"] },
  { name: "Job Progress", href: "/job-progress", icon: Briefcase, codes: ["tenant.projects"] },
  { name: "Estimating Pricing", href: "/estimating-pricing", icon: DollarSign, codes: ["tenant.estimates"] },
];

const TENANT_SUPER_NAV_REL: NavRel[] = [
  { name: "Assign Role", href: "/assign-role", icon: Settings, codes: [] },
];

/** Re-fetch profile so `subscriberPermissions` updates when Super Admin changes access (runtime). */
const SUBSCRIBER_PROFILE_POLL_MS = 30_000;

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

function profileInitials(p: Record<string, unknown> | null): string {
  if (!p) return "?";
  const fn = (p.first_name as string) || "";
  const ln = (p.last_name as string) || "";
  const a = fn.charAt(0) || "";
  const b = ln.charAt(0) || "";
  if (a || b) return `${a}${b}`.toUpperCase();
  const email = (p.email as string) || "";
  return email.charAt(0).toUpperCase() || "?";
}

export default function SubscriberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isChecking } = useProtectedRoute();
  const { isSubscriberSuperAdmin, role: subscriberRole } = useSubscriberAccess();
  /** Bumps when GET /api/profile syncs so nav re-reads `subscriberPermissions` from storage. */
  const [permSync, setPermSync] = useState(0);
  const subscriberBase = subscriberBaseForRole(subscriberRole);
  const primaryNavItems = useMemo(() => {
    void permSync;
    const mapped = PRIMARY_NAV_REL.filter((item) => {
      if (item.superAdminOnly && !isSubscriberSuperAdmin) return false;
      return canShowSubscriberNavItem(subscriberRole, item.codes);
    }).map((item) => ({ ...item, href: `${subscriberBase}${item.href}` }));
    return mapped;
  }, [subscriberBase, subscriberRole, isSubscriberSuperAdmin, permSync]);
  const moreNavItems = useMemo(() => {
    void permSync;
    return MORE_NAV_REL.filter((item) => canShowSubscriberNavItem(subscriberRole, item.codes)).map(
      (item) => ({ ...item, href: `${subscriberBase}${item.href}` })
    );
  }, [subscriberBase, subscriberRole, permSync]);
  const tenantSuperAdminNavItems = useMemo(
    () => TENANT_SUPER_NAV_REL.map((item) => ({ ...item, href: `${subscriberBase}${item.href}` })),
    [subscriberBase]
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [branding, setBranding] = useState<{ logo?: string; name?: string }>({});
  const [initials, setInitials] = useState("?");
  const pathname = usePathname();
  const dispatch = useDispatch();

  const pullSubscriberProfile = useCallback(async () => {
    try {
      await syncProfileToStorage();
      dispatchSubscriberProfileSync();
      setPermSync((n) => n + 1);
    } catch {
      /* offline / 401 handled elsewhere */
    }
    try {
      const role = getStoredCanonicalRole();
      const accessType =
        typeof window !== "undefined" ? localStorage.getItem("access_type") || "" : "";
      if (role && !subscriberUserMayAccessPath(pathname, role)) {
        router.replace(getPostLoginPath(role, accessType));
      }
    } catch {
      /* ignore */
    }
  }, [pathname, router]);

  useEffect(() => {
    void pullSubscriberProfile();
  }, [pathname, pullSubscriberProfile]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") void pullSubscriberProfile();
    };
    document.addEventListener("visibilitychange", onVis);
    const id = window.setInterval(() => {
      const r = getStoredCanonicalRole();
      if (r === "SUBSCRIBER_SUPER_ADMIN") return;
      void pullSubscriberProfile();
    }, SUBSCRIBER_PROFILE_POLL_MS);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.clearInterval(id);
    };
  }, [pullSubscriberProfile]);

  const refreshBrandingFromStorage = useCallback(() => {
    const p = parseProfile();
    const logo =
      (p?.company_logo as string) ||
      (p?.logo as string) ||
      (p?.companyLogo as string) ||
      undefined;
    const name =
      (p?.company_name as string) ||
      (p?.companyName as string) ||
      (p?.tenant_name as string) ||
      undefined;
    setBranding({ logo, name });
    setInitials(profileInitials(p));
  }, []);

  useEffect(() => {
    refreshBrandingFromStorage();
  }, [refreshBrandingFromStorage, permSync]);

  useEffect(() => {
    const onBranding = () => refreshBrandingFromStorage();
    window.addEventListener("subscriber-branding-update", onBranding);
    return () => window.removeEventListener("subscriber-branding-update", onBranding);
  }, [refreshBrandingFromStorage]);

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
  };

  const showLogo = Boolean(branding.logo);
  const headerTitle = branding.name || "Subscriber workspace";

  const NavLink = ({
    item,
  }: {
    item: { name: string; href: string; icon: React.ComponentType<{ className?: string }> };
  }) => {
    const isActive = pathname?.startsWith(item.href);
    const Icon = item.icon;
    return (
      <Link
        href={item.href}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 ${
          isActive ? "text-white shadow-md" : "text-gray-700 hover:bg-gray-100"
        }`}
        style={isActive ? { backgroundColor: "#8b0e0f" } : {}}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <span>{item.name}</span>
      </Link>
    );
  };

  return (
    <SessionGate isChecking={isChecking} isAuthenticated={isAuthenticated}>
      <div className="lg:flex min-h-screen bg-gray-100 text-gray-900">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-20 lg:hidden"
            aria-hidden="true"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed z-30 inset-y-0 left-0 transform bg-white shadow-lg w-64 transition-transform duration-300 ease-in-out 
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
          aria-label="Subscriber sidebar"
        >
          <div className="h-screen flex flex-col overflow-y-auto">
            <div className="min-h-[72px] flex flex-col items-center justify-center border-b bg-white px-3 py-4">
              {showLogo ? (
                <div className="flex flex-col items-center gap-1 w-full">
                  <Image
                    src={branding.logo as string}
                    alt={headerTitle}
                    width={180}
                    height={60}
                    className="object-contain max-h-[52px] w-auto drop-shadow-md"
                    unoptimized
                  />
                  <p className="text-[10px] text-gray-500 text-center px-1">
                    Level 2 — Subscriber portal
                  </p>
                </div>
              ) : (
                <div className="text-center px-2">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">{headerTitle}</p>
                  {/* <p className="text-[10px] text-gray-500 mt-1">
                    Level 2 — Subscriber portal · aiROOFS
                  </p> */}
                </div>
              )}
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {primaryNavItems.map((item) => (
                <NavLink key={item.name} item={item} />
              ))}

              <div className="pt-2 mt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setMoreOpen(!moreOpen)}
                  className="flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  <span>More Pages</span>
                  {moreOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {moreOpen && (
                  <div className="mt-1 space-y-1 pl-0">
                    {moreNavItems.map((item) => (
                      <NavLink key={item.name} item={item} />
                    ))}
                    {isSubscriberSuperAdmin &&
                      tenantSuperAdminNavItems.map((item) => (
                        <NavLink key={item.name} item={item} />
                      ))}
                  </div>
                )}
              </div>
            </nav>

            <div className="p-4 border-t">
              <button
                type="button"
                onClick={handleLogoutFunction}
                className="flex items-center cursor-pointer gap-2 w-full px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col lg:ml-64 overflow-x-auto">
          <header className="h-16 bg-white shadow flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Open sidebar menu"
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <h1 className="font-semibold text-lg tracking-wide truncate text-center lg:text-left text-gray-800">
              {headerTitle}
            </h1>
            <div className="flex items-center space-x-3 text-left">
              <span className="hidden sm:inline text-xs text-gray-600 max-w-[160px] truncate">
                {isSubscriberSuperAdmin
                  ? "Subscriber Super Admin"
                  : subscriberRole === "SUBSCRIBER_ADMIN"
                    ? "Subscriber Admin"
                    : subscriberRole === "SUBSCRIBER_STAFF"
                      ? "Team member"
                      : "Subscriber portal"}
              </span>
              <div
                className="w-10 h-10 rounded-full border shadow-sm bg-[#8b0e0f] flex items-center justify-center text-white text-xs font-semibold"
                aria-hidden
              >
                {initials}
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 overflow-y-auto lg:p-6 bg-gray-50">{children}</main>
        </div>
      </div>
    </SessionGate>
  );
}
