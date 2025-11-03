import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { parseCookies } from "nookies";

export const useProtectedRoute = () => {
  const router = useRouter();

  useEffect(() => {
    const { token } = parseCookies();

    if (!token) {
      router.replace("/login");
    }
  }, [router]);
};
