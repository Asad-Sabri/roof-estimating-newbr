import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { parseCookies } from "nookies";
import {
  getPostLoginPath,
  getStoredCanonicalRole,
  isCustomerRole,
  isPlatformRole,
  isSubscriberRole,
} from "@/lib/auth/roles";
import { platformUserMayAccessPath } from "@/lib/auth/platformPermissions";
import { subscriberUserMayAccessPath } from "@/lib/auth/subscriberPermissions";
import { saasRoleGuardsEnabled } from "@/lib/auth/env";
import { normalizeSubscriberShellPath } from "@/lib/routes/portalPaths";

const CUSTOMER_FORBIDDEN_PREFIXES = ["/customer-panel/subscribers", "/customer/subscribers"];

function isCustomerShellPath(pathname) {
  return pathname?.startsWith("/customer-panel") || pathname?.startsWith("/customer");
}

function isSubscriberShellPath(pathname) {
  return (
    pathname?.startsWith("/admin-panel") ||
    pathname?.startsWith("/subscriber-super-admin") ||
    pathname?.startsWith("/subscriber-admin")
  );
}

function isPlatformShellPath(pathname) {
  return (
    pathname?.startsWith("/super-admin") ||
    pathname?.startsWith("/platform-super-admin") ||
    pathname?.startsWith("/platform-admin")
  );
}

/** Normalized path uses legacy `/admin-panel/...` segment. */
function isSubscriberSuperAdminOnlyPath(pathname) {
  if (!pathname) return false;
  const n = normalizeSubscriberShellPath(pathname);
  return (
    n.startsWith("/admin-panel/assign-role") ||
    n.startsWith("/admin-panel/company-settings") ||
    n.startsWith("/admin-panel/subscriber-admins")
  );
}

export const useProtectedRoute = (options = {}) => {
  const { redirect = true } = options;
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  let initialAuth = false;
  let initialChecking = true;

  if (typeof window !== "undefined") {
    const { token } = parseCookies();
    const tokenFromStorage = localStorage.getItem("token");
    const isInstantEstimateVisitor = localStorage.getItem("isInstantEstimateVisitor");
    const customerAddress = localStorage.getItem("customerAddress");
    const hasVisitorAccess =
      isInstantEstimateVisitor === "true" && customerAddress;

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
    if (typeof window === "undefined") return;

    if (!redirect) {
      setIsChecking(false);
      return;
    }

    hasRedirected.current = false;

    const { token: cookieToken } = parseCookies();
    const token = cookieToken || localStorage.getItem("token");
    const isInstantEstimateVisitor = localStorage.getItem("isInstantEstimateVisitor");
    const customerAddress = localStorage.getItem("customerAddress");
    const accessType = (localStorage.getItem("access_type") || "").toLowerCase();
    const loginRole = getStoredCanonicalRole();

    const isCustomerPanel = isCustomerShellPath(pathname);
    const isSubscriberPanel = isSubscriberShellPath(pathname);
    const isPlatformPanel = isPlatformShellPath(pathname);

    const hasVisitorAccess =
      isCustomerPanel && isInstantEstimateVisitor === "true" && customerAddress;

    const portalOnly = accessType === "portal_only";
    const postLogin = () => getPostLoginPath(loginRole || "CUSTOMER", accessType);

    const doRedirect = (href) => {
      if (hasRedirected.current) return;
      hasRedirected.current = true;
      router.replace(href);
    };

    const strictSaas = saasRoleGuardsEnabled();

    if (!strictSaas) {
      if (
        isCustomerPanel &&
        CUSTOMER_FORBIDDEN_PREFIXES.some((p) => pathname?.startsWith(p))
      ) {
        doRedirect(postLogin());
        setIsAuthenticated(true);
        setIsChecking(false);
        return;
      }

      if (hasVisitorAccess) {
        setIsAuthenticated(true);
        setIsChecking(false);
        hasRedirected.current = false;
        return;
      }

      if (!token) {
        if (pathname !== "/login" && pathname !== "/signup" && pathname !== "/otp") {
          doRedirect("/login");
        }
        setIsAuthenticated(false);
        setIsChecking(false);
        return;
      }

      if (
        loginRole &&
        isSubscriberPanel &&
        isSubscriberSuperAdminOnlyPath(pathname) &&
        loginRole !== "SUBSCRIBER_SUPER_ADMIN" &&
        (loginRole === "SUBSCRIBER_ADMIN" || loginRole === "SUBSCRIBER_STAFF")
      ) {
        doRedirect("/unauthorized");
        setIsAuthenticated(true);
        setIsChecking(false);
        return;
      }

      const isCustomerOrPortal =
        portalOnly || loginRole === "CUSTOMER";
      const isPlatformRoute = isPlatformPanel || isSubscriberPanel;
      if (isCustomerOrPortal && isPlatformRoute) {
        doRedirect(postLogin());
        setIsAuthenticated(true);
        setIsChecking(false);
        return;
      }

      if (loginRole && isPlatformPanel && isPlatformRole(loginRole)) {
        if (!platformUserMayAccessPath(pathname, loginRole)) {
          doRedirect(postLogin());
          setIsAuthenticated(true);
          setIsChecking(false);
          return;
        }
      }

      if (
        loginRole &&
        isSubscriberPanel &&
        isSubscriberRole(loginRole) &&
        loginRole !== "SUBSCRIBER_SUPER_ADMIN" &&
        !subscriberUserMayAccessPath(pathname, loginRole)
      ) {
        doRedirect(getPostLoginPath(loginRole, accessType));
        setIsAuthenticated(true);
        setIsChecking(false);
        return;
      }

      setIsAuthenticated(true);
      setIsChecking(false);
      hasRedirected.current = false;
      return;
    }

    if (loginRole && isPlatformPanel && isPlatformRole(loginRole)) {
      if (!platformUserMayAccessPath(pathname, loginRole)) {
        doRedirect(postLogin());
        setIsAuthenticated(true);
        setIsChecking(false);
        return;
      }
    }

    if (
      isSubscriberPanel &&
      loginRole &&
      isSubscriberSuperAdminOnlyPath(pathname) &&
      loginRole !== "SUBSCRIBER_SUPER_ADMIN" &&
      (loginRole === "SUBSCRIBER_ADMIN" || loginRole === "SUBSCRIBER_STAFF")
    ) {
      doRedirect("/unauthorized");
      setIsAuthenticated(true);
      setIsChecking(false);
      return;
    }

    if (
      loginRole &&
      isSubscriberPanel &&
      isSubscriberRole(loginRole) &&
      loginRole !== "SUBSCRIBER_SUPER_ADMIN" &&
      !subscriberUserMayAccessPath(pathname, loginRole)
    ) {
      doRedirect(getPostLoginPath(loginRole, accessType));
      setIsAuthenticated(true);
      setIsChecking(false);
      return;
    }

    if (
      isCustomerPanel &&
      CUSTOMER_FORBIDDEN_PREFIXES.some((p) => pathname?.startsWith(p))
    ) {
      doRedirect(postLogin());
      setIsAuthenticated(true);
      setIsChecking(false);
      return;
    }

    if (hasVisitorAccess) {
      setIsAuthenticated(true);
      setIsChecking(false);
      hasRedirected.current = false;
      return;
    }

    if (!token) {
      if (pathname !== "/login" && pathname !== "/signup" && pathname !== "/otp") {
        doRedirect("/login");
      }
      setIsAuthenticated(false);
      setIsChecking(false);
      return;
    }

    if (portalOnly || loginRole === "CUSTOMER") {
      if (isPlatformPanel || isSubscriberPanel) {
        doRedirect(postLogin());
        setIsAuthenticated(true);
        setIsChecking(false);
        return;
      }
    }

    if (isPlatformPanel && loginRole && !isPlatformRole(loginRole)) {
      doRedirect(postLogin());
      setIsAuthenticated(true);
      setIsChecking(false);
      return;
    }

    if (isSubscriberPanel && isPlatformRole(loginRole)) {
      doRedirect(postLogin());
      setIsAuthenticated(true);
      setIsChecking(false);
      return;
    }

    if (isSubscriberPanel && loginRole && (isCustomerRole(loginRole) || portalOnly)) {
      doRedirect(postLogin());
      setIsAuthenticated(true);
      setIsChecking(false);
      return;
    }

    if (
      isSubscriberPanel &&
      loginRole &&
      !isSubscriberRole(loginRole) &&
      !isPlatformRole(loginRole)
    ) {
      doRedirect(postLogin());
      setIsAuthenticated(true);
      setIsChecking(false);
      return;
    }

    if (isCustomerPanel && loginRole && isSubscriberRole(loginRole)) {
      doRedirect(postLogin());
      setIsAuthenticated(true);
      setIsChecking(false);
      return;
    }

    if (isCustomerPanel && loginRole && isPlatformRole(loginRole)) {
      doRedirect(postLogin());
      setIsAuthenticated(true);
      setIsChecking(false);
      return;
    }

    setIsAuthenticated(true);
    setIsChecking(false);
    hasRedirected.current = false;
  }, [pathname, router, redirect]);

  return { isAuthenticated, isChecking };
};
