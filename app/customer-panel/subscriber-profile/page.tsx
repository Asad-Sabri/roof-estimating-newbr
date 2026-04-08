"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Building2, Phone, Mail, Globe, MapPin, UserCircle, Loader2 } from "lucide-react";
import CustomerLayout from "@/components/layout/CustomerLayout";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";
import { getCompanyForCustomerAPI } from "@/services/companyAPI";
import {
  normalizeCompanyPayloadToView,
  type CompanyProfileView,
} from "@/lib/subscriber/companyProfileView";

const emptyProfile: CompanyProfileView = {
  companyName: "—",
  addressLine: "—",
};

export default function CustomerSubscriberProfilePage() {
  useProtectedRoute();
  const [profile, setProfile] = useState<CompanyProfileView>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCompanyForCustomerAPI()
      .then((res: unknown) => {
        if (cancelled) return;
        setProfile(normalizeCompanyPayloadToView(res));
        setError(null);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const msg =
          (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          "Could not load your contractor’s profile.";
        setError(String(msg));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const accent = profile.accentHex || "#8b0e0f";

  return (
    <CustomerLayout>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-4xl mx-auto text-gray-900"
      >
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-7 w-7 text-[#8b0e0f]" aria-hidden />
            Your contractor
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Your account is under this subscriber company. Estimates and projects use their branding and
            contact details.
          </p>
        </header>

        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-600">
            <Loader2 className="h-6 w-6 animate-spin" />
            Loading…
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
              <div
                className="h-2"
                style={{ backgroundColor: accent }}
                aria-hidden
              />
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
                <div className="shrink-0 mx-auto md:mx-0">
                  {profile.logoUrl ? (
                    <div className="relative w-48 h-24 md:w-56 md:h-28 bg-gray-50 rounded-lg border flex items-center justify-center p-2">
                      <Image
                        src={profile.logoUrl}
                        alt={profile.companyName}
                        width={220}
                        height={100}
                        className="object-contain max-h-[88px] w-auto"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div
                      className="w-48 h-24 md:w-56 md:h-28 rounded-lg flex items-center justify-center text-white font-semibold text-sm px-3 text-center"
                      style={{ backgroundColor: accent }}
                    >
                      {profile.companyName !== "—" ? profile.companyName : "Contractor"}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <h2 className="text-2xl font-semibold text-gray-900">{profile.companyName}</h2>
                  {profile.licenseNumber && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-700">License:</span> {profile.licenseNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </div>
                <p className="text-gray-900">{profile.phone ?? "—"}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
                  <Mail className="h-4 w-4" />
                  Email
                </div>
                <p className="text-gray-900 break-all">{profile.email ?? "—"}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm sm:col-span-2">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
                  <Globe className="h-4 w-4" />
                  Website
                </div>
                <p className="text-gray-900 break-all">
                  {profile.website ? (
                    <a
                      href={
                        profile.website.startsWith("http")
                          ? profile.website
                          : `https://${profile.website}`
                      }
                      className="text-[#8b0e0f] hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {profile.website}
                    </a>
                  ) : (
                    "—"
                  )}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm sm:col-span-2">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </div>
                <p className="text-gray-900">{profile.addressLine}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 text-gray-700 font-semibold mb-4">
                <UserCircle className="h-5 w-5" />
                Primary contact
              </div>
              <dl className="grid sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <dt className="text-gray-500">Name</dt>
                  <dd className="text-gray-900 mt-0.5">{profile.contactPersonName ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Phone</dt>
                  <dd className="text-gray-900 mt-0.5">{profile.contactPersonPhone ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Email</dt>
                  <dd className="text-gray-900 mt-0.5 break-all">{profile.contactPersonEmail ?? "—"}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </motion.div>
    </CustomerLayout>
  );
}
