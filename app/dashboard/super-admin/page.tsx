"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Users,
  Shield,
  Building2,
  Settings,
  BarChart3,
  FileText,
} from "lucide-react";
import { handleLogout } from "@/utils/authHelper";
import { useQueryClient } from "@tanstack/react-query";
import logo from "../../../public/logo-latest.png";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/slices/authSlice";

const navItems = [
  { name: "Dashboard", href: "/super-admin/dashboard", icon: LayoutDashboard },
  { name: "Admins", href: "/super-admin/admins", icon: Shield },
  { name: "Customers", href: "/super-admin/customers", icon: Users },
  { name: "Companies", href: "/super-admin/companies", icon: Building2 },
  { name: "Reports", href: "/super-admin/reports", icon: BarChart3 },
  { name: "Settings", href: "/super-admin/settings", icon: Settings },
];

export default function SuperAdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isChecking } = useProtectedRoute();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  // Check if user is Super Admin
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loginRole = localStorage.getItem("loginRole");
      if (loginRole !== "super-admin") {
        // Redirect if not super admin
        if (loginRole === "admin") {
          window.location.href = "/admin-panel/dashboard";
        } else {
          window.location.href = "/customer-panel/dashboard";
        }
      }
    }
  }, []);

  const handleLogoutFunction = () => {
    dispatch(logout());
    handleLogout();
    setSidebarOpen(false);
  };

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

  return (
    <div className="lg:flex min-h-screen bg-gray-100 text-gray-900">
      {/* Overlay (shown on mobile when sidebar is open) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-30 inset-y-0 left-0 transform bg-white shadow-lg w-64 transition-transform duration-300 ease-in-out 
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        aria-label="Sidebar"
      >
        {/* Sidebar content container with scroll */}
        <div className="h-screen flex flex-col overflow-y-auto">
          {/* Header */}
          <div className="h-35 flex items-center justify-center border-b bg-white">
            <Image
              src={logo}
              alt="Superior Pro Roofing Logo"
              width={180}
              height={60}
              className="object-contain drop-shadow-md mt-2"
              priority
            />
          </div>

          {/* Navigation items */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname?.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)} // close on mobile when a nav link is clicked
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200
              ${
                isActive
                  ? "text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
                  style={isActive ? { backgroundColor: "#8b0e0f" } : {}}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer (Logout button stays fixed at bottom of scroll area) */}
          <div className="p-4 border-t">
            <button
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

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-64 overflow-x-auto">
        {/* Navbar */}
        <header className="h-16 bg-white shadow flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Open sidebar menu"
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          <h1 className="font-semibold text-lg tracking-wide truncate text-center lg:text-left">
            {/* Super Admin Portal */}
          </h1>
          <div className="flex items-center space-x-4 text-left">
            <span className="hidden sm:inline text-sm text-gray-600">
              Super Admin
            </span>
            <div className="w-10 h-10 rounded-full border shadow-sm bg-[#8b0e0f] flex items-center justify-center">
              <Shield className="text-white" size={20} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 overflow-y-auto lg:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
