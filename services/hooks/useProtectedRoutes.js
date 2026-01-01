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
    
    if (token || tokenFromStorage) {
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
    
    // Check if token exists
    if (token || tokenFromStorage) {
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
