"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  UserCircle,
  Shield,
  Settings,
  Loader2,
  Plus,
} from "lucide-react";
import { toast } from "react-toastify";
import SubscriberLayout from "@/components/layout/SubscriberLayout";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";
import { getCompanySettingsAPI, uploadCompanyLogoAPI } from "@/services/companyAPI";
import { getSubscriberTeamAPI, syncProfileToStorage } from "@/services/auth";
import { useSubscriberAccess } from "@/lib/auth/useSubscriberAccess";
import { subscriberBaseForRole } from "@/lib/routes/portalPaths";
import {
  normalizeCompanyPayloadToView,
  type CompanyProfileView,
} from "@/lib/subscriber/companyProfileView";

const emptyProfile: CompanyProfileView = {
  companyName: "—",
  addressLine: "—",
};

export default function SubscriberProfilePage() {
  useProtectedRoute();
  const { isSubscriberSuperAdmin, role: subscriberRole } = useSubscriberAccess();
  const subBase = subscriberBaseForRole(subscriberRole);
  const [profile, setProfile] = useState<CompanyProfileView>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamCount, setTeamCount] = useState<number | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCompanySettingsAPI();
      setProfile(normalizeCompanyPayloadToView(res));
      setError(null);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Could not load company profile.";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const triggerLogoPicker = () => {
    logoInputRef.current?.click();
  };

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !isSubscriberSuperAdmin) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5MB or smaller.");
      return;
    }
    setUploadingLogo(true);
    try {
      await uploadCompanyLogoAPI(file);
      const res = await getCompanySettingsAPI();
      setProfile(normalizeCompanyPayloadToView(res));
      await syncProfileToStorage();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("subscriber-branding-update"));
      }
      toast.success("Logo updated.");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err as Error)?.message ??
        "Upload failed.";
      toast.error(String(msg));
    } finally {
      setUploadingLogo(false);
    }
  };

  useEffect(() => {
    if (!isSubscriberSuperAdmin) return;
    let cancelled = false;
    getSubscriberTeamAPI()
      .then((data: unknown) => {
        if (cancelled) return;
        const d = data as Record<string, unknown>;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(d.team)
            ? d.team
            : Array.isArray(d.users)
              ? d.users
              : Array.isArray(d.data)
                ? d.data
                : [];
        setTeamCount(Array.isArray(list) ? list.length : null);
      })
      .catch(() => {
        if (!cancelled) setTeamCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, [isSubscriberSuperAdmin]);

  const accent = profile.accentHex || "#8b0e0f";

  return (
    <SubscriberLayout>
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-4xl mx-auto text-gray-900"
      >
        <header
          className="rounded-xl px-6 py-5 text-white shadow-md mb-6"
          style={{ backgroundColor: accent }}
        >
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-7 w-7 shrink-0" aria-hidden />
            Subscriber profile
          </h1>
          <p className="text-sm text-white/90 mt-1 max-w-2xl">
            Logo, company name, and contact details shown here match what customers see in their portal
            and on estimates — keep them accurate in Company settings.
          </p>
        </header>

        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-600">
            <Loader2 className="h-6 w-6 animate-spin" />
            Loading profile…
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
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="shrink-0 mx-auto md:mx-0 flex flex-col items-center gap-2">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                    className="sr-only"
                    aria-hidden
                    tabIndex={-1}
                    onChange={handleLogoFileChange}
                  />
                  <div className="relative h-[132px] w-[132px] shrink-0">
                    <button
                      type="button"
                      onClick={isSubscriberSuperAdmin ? triggerLogoPicker : undefined}
                      disabled={!isSubscriberSuperAdmin || uploadingLogo}
                      className={`group relative flex h-[132px] w-[132px] items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50 shadow-sm outline-none transition ${
                        profile.logoUrl ? "border-solid border-gray-200" : ""
                      } ${
                        isSubscriberSuperAdmin
                          ? "cursor-pointer hover:border-[#8b0e0f] hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#8b0e0f] focus-visible:ring-offset-2"
                          : "cursor-default"
                      } ${uploadingLogo ? "opacity-70 pointer-events-none" : ""}`}
                      aria-label={profile.logoUrl ? "Change company logo" : "Upload company logo"}
                    >
                      {profile.logoUrl ? (
                        <Image
                          src={profile.logoUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="132px"
                          unoptimized
                        />
                      ) : isSubscriberSuperAdmin ? (
                        <Plus className="h-12 w-12 text-[#8b0e0f]/70" strokeWidth={1.75} aria-hidden />
                      ) : (
                        <Building2 className="h-12 w-12 text-gray-400" strokeWidth={1.25} aria-hidden />
                      )}
                      {isSubscriberSuperAdmin && profile.logoUrl && (
                        <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition group-hover:bg-black/40">
                          {uploadingLogo ? (
                            <Loader2 className="h-9 w-9 animate-spin text-white" />
                          ) : (
                            <Plus className="h-10 w-10 text-white opacity-0 transition group-hover:opacity-100 drop-shadow-md" strokeWidth={2} />
                          )}
                        </span>
                      )}
                      {isSubscriberSuperAdmin && !profile.logoUrl && uploadingLogo && (
                        <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-white/80">
                          <Loader2 className="h-9 w-9 animate-spin text-[#8b0e0f]" />
                        </span>
                      )}
                    </button>
                  </div>
                  <p className="max-w-[180px] text-center text-xs text-gray-500">
                    {isSubscriberSuperAdmin
                      ? "Tap the circle to upload · PNG, JPG, WebP · max 5MB"
                      : "Logo is managed by Subscriber Super Admin"}
                  </p>
                </div>
                <div className="flex-1 min-w-0 space-y-3">
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

            {isSubscriberSuperAdmin && (
              <div className="rounded-xl border border-red-100 bg-red-50/80 p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-6 w-6 text-[#8b0e0f] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Subscriber Super Admin</h3>
                    <p className="text-sm text-gray-700 mt-1">
                      Create subscriber admins, assign roles, and edit company-wide details (same idea as
                      platform super admin, scoped to your company). Customers you create see this profile
                      branding in their customer portal.
                    </p>
                    {teamCount !== null && (
                      <p className="text-sm text-gray-600 mt-2">
                        Team members listed: <strong>{teamCount}</strong>
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`${subBase}/subscriber-admins`}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#8b0e0f] text-white px-4 py-2.5 text-sm font-medium hover:opacity-95 shadow"
                  >
                    <Shield className="h-4 w-4" />
                    Subscriber admins
                  </Link>
                  <Link
                    href={`${subBase}/assign-role`}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
                  >
                    Assign role (legacy)
                  </Link>
                  <Link
                    href={`${subBase}/company-settings`}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
                  >
                    <Settings className="h-4 w-4" />
                    Company settings (edit branding)
                  </Link>
                </div>
              </div>
            )}

            {!isSubscriberSuperAdmin && (
              <p className="text-sm text-gray-600 text-center md:text-left">
                Need to change the logo or company details? Ask your{" "}
                <strong>Subscriber Super Admin</strong> to update Company settings.
              </p>
            )}
          </div>
        )}
      </motion.main>
    </SubscriberLayout>
  );
}
