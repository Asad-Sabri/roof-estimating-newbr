import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { parseCookies } from "nookies";

export const useProtectedRoute = () => {
  const router = useRouter();
  
  // Check immediately on client side (synchronous check)
  let initialAuth = false;
  let initialChecking = true;
  
  if (typeof window !== "undefined") {
    const { token } = parseCookies();
    const tokenFromStorage = localStorage.getItem("token");
    
    if (token || tokenFromStorage) {
      initialAuth = true;
      initialChecking = false;
    } else {
      // No token found - redirect immediately using window.location for instant redirect
      window.location.href = "/login";
      initialAuth = false;
      initialChecking = false;
    }
  }

  const [isAuthenticated, setIsAuthenticated] = useState(initialAuth);
  const [isChecking, setIsChecking] = useState(initialChecking);

  useEffect(() => {
    // Double check in useEffect as well
    const { token } = parseCookies();
    let tokenFromStorage = null;
    if (typeof window !== "undefined") {
      tokenFromStorage = localStorage.getItem("token");
    }

    if (!token && !tokenFromStorage) {
      // Use window.location for immediate redirect
      window.location.href = "/login";
      setIsAuthenticated(false);
      setIsChecking(false);
    } else {
      setIsAuthenticated(true);
      setIsChecking(false);
    }
  }, [router]);

  // Return authentication status
  return { isAuthenticated, isChecking };
};
