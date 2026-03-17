import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { parseCookies } from "nookies";

export const useProtectedRoute = () => {
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false); // Prevent multiple redirects
  
  // Check immediately on client side
  let initialAuth = false;
  let initialChecking = true;
  
  if (typeof window !== "undefined") {
    const { token } = parseCookies();
    const tokenFromStorage = localStorage.getItem("token");
    const isInstantEstimateVisitor = localStorage.getItem("isInstantEstimateVisitor");
    const customerAddress = localStorage.getItem("customerAddress");
    
    // Check if token exists OR if user is instant estimate visitor (has address)
    // For initial check, we allow if visitor flags exist (pathname check in useEffect)
    const hasVisitorAccess = isInstantEstimateVisitor === "true" && customerAddress;
    
    if (token || tokenFromStorage || hasVisitorAccess) {
      initialAuth = true;
      initialChecking = false;
    } else {
      initialAuth = false;
      initialChecking = false;
    }
  }

  const [isAuthenticated, setIsAuthenticated] = useState(initialAuth);
  const [isChecking, setIsChecking] = useState(initialChecking);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;
    
    // Prevent multiple redirects
    if (hasRedirected.current) return;

    const { token } = parseCookies();
    const tokenFromStorage = localStorage.getItem("token");
    const isInstantEstimateVisitor = localStorage.getItem("isInstantEstimateVisitor");
    const customerAddress = localStorage.getItem("customerAddress");
    const loginRole = localStorage.getItem("loginRole");
    const accessType = localStorage.getItem("access_type");
    
    // Customer / portal_only: never see platform (super-admin or admin-panel); redirect to subscriber portal
    const isCustomerOrPortalOnly = accessType === "portal_only" || loginRole === "customer";
    const isPlatformRoute = pathname?.startsWith("/super-admin") || pathname?.startsWith("/admin-panel");
    if (isCustomerOrPortalOnly && isPlatformRoute) {
      hasRedirected.current = true;
      router.replace("/customer-panel/dashboard");
      setIsAuthenticated(true);
      setIsChecking(false);
      return;
    }
    
    // Check if token exists OR if user is instant estimate visitor (for customer panel only)
    const isCustomerPanel = pathname?.startsWith("/customer-panel");
    const hasVisitorAccess = isCustomerPanel && isInstantEstimateVisitor === "true" && customerAddress;
    
    if (token || tokenFromStorage || hasVisitorAccess) {
      setIsAuthenticated(true);
      setIsChecking(false);
      hasRedirected.current = false;
    } else {
      // Only redirect if not already on login page and haven't redirected yet
      if (pathname !== "/login" && !hasRedirected.current) {
        hasRedirected.current = true;
        router.replace("/login");
      }
      setIsAuthenticated(false);
      setIsChecking(false);
    }
  }, [pathname, router]);

  // Return authentication status
  return { isAuthenticated, isChecking };
};
