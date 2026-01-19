"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { parseCookies } from "nookies";
import InstantEstimateLanding from "@/components/estimating/InstantEstimateLanding";

export default function InstantEstimatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isFromInstantLink, setIsFromInstantLink] = useState(false);

  useEffect(() => {
    // Check for URL parameters (promoter_id, sales_rep_id, marketing_channel)
    // If present, this is from instant estimate link/QR code
    if (typeof window !== "undefined") {
      const promoterId = searchParams?.get("promoter_id");
      const salesRepId = searchParams?.get("sales_rep_id");
      const marketingChannel = searchParams?.get("marketing_channel");
      const instantEstimate = searchParams?.get("instant");

      // If instant estimate link/QR code parameters present, skip login check
      if (promoterId || salesRepId || marketingChannel || instantEstimate === "true") {
        setIsFromInstantLink(true);
        
        // Store assignment parameters for later use
        const assignmentData = {
          promoter_id: promoterId,
          sales_rep_id: salesRepId,
          marketing_channel: marketingChannel || "Instant Estimate Link",
          assignment_source: promoterId || salesRepId ? "qr_code" : "link",
        };
        localStorage.setItem("assignmentData", JSON.stringify(assignmentData));

        // Directly go to address entry (measurements page)
        router.replace("/measurements");
        return;
      }

      // For normal access, check if user is logged in
      const { token } = parseCookies();
      const tokenFromStorage = localStorage.getItem("token");

      // If user is logged in, redirect to dashboard
      if (token || tokenFromStorage) {
        router.replace("/customer-panel/dashboard");
      }
    }
  }, [router, searchParams]);

  // If instant estimate link, don't show landing page (will redirect)
  if (isFromInstantLink) {
    return null;
  }

  // Show landing page for non-logged users
  return <InstantEstimateLanding />;
}
